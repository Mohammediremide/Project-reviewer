import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const email = "admin@projectreviewer.com"
  const password = "admin123"
  const hashedPassword = await bcrypt.hash(password, 10)

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      password: hashedPassword,
      role: 'admin'
    },
    create: {
      email,
      name: 'Global Admin',
      password: hashedPassword,
      role: 'admin',
      isTwoFactorEnabled: false // Disabled for initial login convenience
    }
  })

  console.log(`✅ Admin account "${user.email}" seeded successfully with requested credentials.`)
  console.log(`Role: ${user.role}`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
