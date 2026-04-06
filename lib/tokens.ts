import { prisma } from "@/lib/prisma"
import crypto from "crypto"

export const getTwoFactorTokenByEmail = async (email: string) => {
  try {
    const twoFactorToken = await prisma.twoFactorToken.findFirst({
      where: { email }
    })
    return twoFactorToken
  } catch {
    return null
  }
}

export const generateTwoFactorToken = async (email: string) => {
  // Generate a random 6-digit numeric code
  const token = crypto.randomInt(100_000, 999_999).toString()
  const expires = new Date(new Date().getTime() + 3600 * 1000) // 1 hour

  const existingToken = await getTwoFactorTokenByEmail(email)

  if (existingToken) {
    await prisma.twoFactorToken.delete({
      where: {
        id: existingToken.id
      }
    })
  }

  const twoFactorToken = await prisma.twoFactorToken.create({
    data: {
      email,
      token,
      expires
    }
  })

  return twoFactorToken
}
