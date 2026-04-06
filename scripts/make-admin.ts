/**
 * One-time admin seeder script.
 * Run with: npx tsx scripts/make-admin.ts <email>
 *
 * Example:
 *   npx tsx scripts/make-admin.ts odewunmimohammed@gmail.com
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const email = process.argv[2]

  if (!email) {
    console.error('Usage: npx tsx scripts/make-admin.ts <email>')
    process.exit(1)
  }

  const user = await prisma.user.findUnique({ where: { email } })

  if (!user) {
    console.error(`❌ No user found with email: ${email}`)
    process.exit(1)
  }

  await prisma.user.update({
    where: { email },
    data: { role: 'admin' }
  })

  console.log(`✅ "${user.name || user.email}" has been promoted to admin.`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
