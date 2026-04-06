'use server'
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { auth, signIn } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { sendPasswordResetEmail } from "./email"
import crypto from "crypto"

export async function register(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const name = formData.get('name') as string
  const code = formData.get('code') as string

  if (!email || !password || !name) return { error: "Missing identity fields" }
  const normalizedEmail = email.trim().toLowerCase()

  const exists = await prisma.user.findUnique({ where: { email: normalizedEmail } })

  if (exists) return { error: "Identity already exists in neural logs" }

  // Phase 1: Initiation (No code provided)
  if (!code) {
    const twoFactorToken = await generateTwoFactorToken(normalizedEmail)
    await sendTwoFactorTokenEmail(normalizedEmail, twoFactorToken.token)
    return { twoFactor: true }
  }

  // Phase 2: Verification (Code provided)
  const twoFactorToken = await getTwoFactorTokenByEmail(normalizedEmail)

  if (!twoFactorToken || twoFactorToken.token !== code) {
    return { error: "Invalid synchronization code" }
  }

  const hasExpired = new Date(twoFactorToken.expires) < new Date()
  if (hasExpired) return { error: "Synchronization pulse expired" }

  await prisma.twoFactorToken.delete({
    where: { id: twoFactorToken.id }
  })

  const hashedPassword = await bcrypt.hash(password, 10)
  
  const adminEmails = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map(e => e.trim().toLowerCase())
    .filter(Boolean)
  const role = adminEmails.includes(normalizedEmail) ? "admin" : "user"

  const newUser = await prisma.user.create({
    data: {
      email: normalizedEmail,
      password: hashedPassword,
      name,
      role,
      isTwoFactorEnabled: true // Set to true by default for maximum security
    }
  })

  // Auto-confirm 2FA for 1 week upon registration
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  await prisma.twoFactorConfirmation.create({
    data: { 
      userId: newUser.id,
      expires
    }
  })

  return { success: true }
}

import { analyzeProject, analyzeItem } from "./ai"

export async function reviewProject(projectUrl: string, repoUrl?: string) {
  const session = await auth()
  if (!session || !session.user) throw new Error("Unauthorized")

  const { score, reviewText, amends } = await analyzeProject(projectUrl, repoUrl)

  const project = await prisma.project.create({
    data: {
      name: repoUrl ? repoUrl.split('/').pop() || 'Repo' : projectUrl.split('/').pop() || 'Project',
      repoUrl,
      deployedUrl: projectUrl,
      score,
      reviewText,
      amends,
      userId: session.user.id!
    }
  })

  revalidatePath('/dashboard')
  return project
}

export async function clearAuditLog() {
  const session = await auth()
  if (!session || !session.user) throw new Error("Unauthorized")

  await prisma.project.deleteMany({
    where: { userId: session.user.id }
  })

  revalidatePath('/dashboard')
}

export async function rateItem(type: string, description: string, imageUrl?: string) {
  const session = await auth()
  if (!session || !session.user) throw new Error("Unauthorized")

  const { score, reviewText, amends } = await analyzeItem(type, description, imageUrl)

  const review = await prisma.project.create({
    data: {
      name: `${type.charAt(0).toUpperCase() + type.slice(1)} Review`,
      repoUrl: imageUrl || 'N/A', // Reuse repoUrl for image/context link for now
      deployedUrl: description.substring(0, 50), // Reuse deployedUrl for description teaser
      score,
      reviewText,
      amends,
      userId: session.user.id!
    }
  })

  revalidatePath('/dashboard')
  return review
}
export async function signInWithGithub() {
  await signIn('github', { redirectTo: '/dashboard' })
}

export async function signInWithGoogle() {
  await signIn('google', { redirectTo: '/dashboard' })
}

export async function requestPasswordReset(email: string) {
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return { error: "Identity not found in neural logs" }

  const token = crypto.randomBytes(32).toString('hex')
  const expires = new Date(Date.now() + 3600000) // 1 hour

  await prisma.verificationToken.deleteMany({
    where: { identifier: email }
  })

  await prisma.verificationToken.create({
    data: {
      identifier: email,
      token,
      expires
    }
  })

  // Generate the full link (using AUTH_URL or a fallback)
  const baseUrl = process.env.AUTH_URL || "https://project-reviewer.vercel.app"
  const resetLink = `${baseUrl}/reset-password?token=${token}`

  return await sendPasswordResetEmail(email, resetLink)
}

export async function resetPassword(token: string, password: string) {
  const verificationToken = await prisma.verificationToken.findUnique({
    where: { token }
  })

  if (!verificationToken || verificationToken.expires < new Date()) {
    return { error: "Recall signal expired or invalid" }
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  await prisma.user.update({
    where: { email: verificationToken.identifier },
    data: { password: hashedPassword }
  })

  await prisma.verificationToken.deleteMany({
    where: { token }
  })

  return { success: true }
}
import { generateTwoFactorToken, getTwoFactorTokenByEmail } from "./tokens"
import { sendTwoFactorTokenEmail } from "./email"

export async function login(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const code = formData.get('code') as string

  if (!email || !password) return { error: "Missing identity credentials" }

  const normalizedEmail = email.trim().toLowerCase()
  const adminEmails = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map(e => e.trim().toLowerCase())
    .filter(Boolean)
  const adminDefaultPassword = process.env.ADMIN_DEFAULT_PASSWORD || "admin"

  let existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail }
  })

  // Auto-provision fixed admin account if missing
  if (!existingUser && adminEmails.includes(normalizedEmail)) {
    if (password !== adminDefaultPassword) {
      return { error: "Invalid authentication pattern" }
    }

    const hashedPassword = await bcrypt.hash(adminDefaultPassword, 10)
    existingUser = await prisma.user.create({
      data: {
        email: normalizedEmail,
        password: hashedPassword,
        name: "Admin",
        role: "admin",
        isTwoFactorEnabled: true
      }
    })
  }

  if (!existingUser || !existingUser.password) {
    return { error: "Identity not found in neural logs" }
  }

  const passwordsMatch = await bcrypt.compare(password, existingUser.password)

  if (!passwordsMatch) {
    return { error: "Invalid authentication pattern" }
  }

  // Handle Two-Factor Authentication
  if (existingUser.isTwoFactorEnabled) {
    // Check if user already has a valid confirmation (Remember me for 1 week)
    const existingConfirmation = await prisma.twoFactorConfirmation.findUnique({
      where: { userId: existingUser.id }
    })

    const hasValidConfirmation = existingConfirmation && new Date(existingConfirmation.expires) > new Date()

    if (!hasValidConfirmation) {
      if (code) {
        const twoFactorToken = await getTwoFactorTokenByEmail(existingUser.email!)

        if (!twoFactorToken || twoFactorToken.token !== code) {
          return { error: "Invalid synchronization code" }
        }

        const hasExpired = new Date(twoFactorToken.expires) < new Date()

        if (hasExpired) {
          return { error: "Synchronization pulse expired" }
        }

        await prisma.twoFactorToken.delete({
          where: { id: twoFactorToken.id }
        })

        if (existingConfirmation) {
          await prisma.twoFactorConfirmation.delete({
            where: { id: existingConfirmation.id }
          })
        }

        // Create new confirmation valid for 7 days
        const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        await prisma.twoFactorConfirmation.create({
          data: { 
            userId: existingUser.id,
            expires
          }
        })
      } else {
        const twoFactorToken = await generateTwoFactorToken(existingUser.email!)
        await sendTwoFactorTokenEmail(existingUser.email!, twoFactorToken.token)

        return { twoFactor: true }
      }
    }
  }

  try {
    // NextAuth signIn (credentials)
    // Note: We need a specialized signIn handle in auth.ts for this
    await signIn("credentials", {
      email: normalizedEmail,
      password,
      redirectTo: existingUser.role === "admin" ? "/admin" : "/dashboard",
    })
    return { success: true }
  } catch (error: any) {
    if (error.type === "CredentialsSignin") {
      return { error: "Neural link rejected" }
    }
    throw error
  }
}
