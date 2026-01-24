import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔄 Migrating admin roles...')

  // Update all ADMIN users to SUPER_ADMIN
  const result = await prisma.$executeRaw`
    UPDATE users 
    SET role = 'SUPER_ADMIN'::text::"UserRole"
    WHERE role = 'ADMIN'::text::"UserRole"
  `

  console.log(`✅ Updated ${result} users from ADMIN to SUPER_ADMIN`)
}

main()
  .catch((e) => {
    console.error('❌ Migration failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
