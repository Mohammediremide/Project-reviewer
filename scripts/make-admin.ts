/**
 * One-time admin seeder script.
 * Run with: npx tsx scripts/make-admin.ts <email>
 *
 * Example:
 *   npx tsx scripts/make-admin.ts admin@projectreviewer.com
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const email = process.argv[2]

  if (!email) {
    console.error('Usage: npx tsx scripts/make-admin.ts <email>')
    process.exit(1)
  }

  const user = await prisma.user.upsert({
    where: { email },
    update: { role: 'admin' },
    create: {
      email,
      name: email.split('@')[0],
      role: 'admin'
    }
  })

  console.log(`✅ User "${user.email}" is now an admin (Database Entry Verified/Created).`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
