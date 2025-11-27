import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Clear all existing users first
  await prisma.user.deleteMany({})
  console.log('🗑️  Cleared all existing users')

  const hashedPassword = await bcrypt.hash('Admin@123', 10)

  const admin = await prisma.user.create({
    data: {
      email: 'admin@kpi.com',
      password: hashedPassword,
      firstName: 'مدیر ارشد',
      lastName: 'سیستم',
      isAdmin: true,
      isTechnicalDeputy: true,
      isActive: true,
      totalPoints: 0,
    },
  })

  console.log('✅ High-level admin user created')
  console.log('📧 Email: admin@kpi.com')
  console.log('🔑 Password: Admin@123')
  console.log('👑 Role: Administrator + Technical Deputy')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

