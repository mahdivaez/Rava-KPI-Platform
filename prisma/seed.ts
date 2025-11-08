import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  const hashedPassword = await bcrypt.hash('Admin@123', 10)
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@kpi.com' },
    update: {},
    create: {
      email: 'admin@kpi.com',
      password: hashedPassword,
      firstName: 'مدیر',
      lastName: 'سیستم',
      isAdmin: true,
      isActive: true,
    },
  })

  console.log('✅ Admin user created')
  console.log('📧 Email: admin@kpi.com')
  console.log('🔑 Password: Admin@123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

