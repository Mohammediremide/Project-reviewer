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

  if (!email || !password) return { error: "Missing fields" }

  const exists = await prisma.user.findUnique({
    where: { email }
  })

  if (exists) return { error: "User already exists" }

  const hashedPassword = await bcrypt.hash(password, 10)

  await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name
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

export async function requestPasswordReset(email: string) {
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return { error: "Identity not found in neural logs" }

  const token = crypto.randomBytes(32).toString('hex')
  const expires = new Date(Date.now() + 3600000) // 1 hour

  await prisma.verificationToken.upsert({
    where: { token },
    update: { expires },
    create: {
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

  await prisma.verificationToken.delete({
    where: { token }
  })

  return { success: true }
}
