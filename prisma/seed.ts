import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Clear all existing users first
  await prisma.user.deleteMany({})
  console.log('🗑️  Cleared all existing users')

  const hashedPassword = await bcrypt.hash('Admin@123', 10)

  // Create admin user first
  const adminPassword = await bcrypt.hash('Admin@123', 10)
  const admin = await prisma.user.create({
    data: {
      email: 'admin@kpi.com',
      password: adminPassword,
      firstName: 'مدیر',
      lastName: 'سیستم',
      isAdmin: true,
      isTechnicalDeputy: true,
      isActive: true,
      totalPoints: 0,
    },
  })

  console.log('✅ Admin user created: admin@kpi.com | Password: Admin@123')

  const userData = [
    { firstName: 'Aida', lastName: 'Aida', email: 'aida@kpi.com', password: 'Aida2025!' },
    { firstName: 'Amirhosein', lastName: 'Amirhosein', email: 'amirhosein@kpi.com', password: 'Amir@2025' },
    { firstName: 'Avin', lastName: 'Avin', email: 'avin@kpi.com', password: 'Avin@4567' },
    { firstName: 'Ehsan', lastName: 'Ehsan', email: 'ehsan@kpi.com', password: 'Ehsan!9876' },
    { firstName: 'Fateme', lastName: 'Fateme', email: 'fateme@kpi.com', password: 'Fateme@2025' },
    { firstName: 'Ghasem', lastName: 'Ghasem', email: 'ghasem@kpi.com', password: 'Ghasem!1234' },
    { firstName: 'Helia', lastName: 'Helia', email: 'helia@kpi.com', password: 'Helia_2025' },
    { firstName: 'Kosar', lastName: 'Kosar', email: 'kosar@kpi.com', password: 'Kosar!7890' },
    { firstName: 'Mahsa', lastName: 'Mahsa', email: 'mahsa@kpi.com', password: 'Mahsa2025#' },
    { firstName: 'Mahyar', lastName: 'Mahyar', email: 'mahyar@kpi.com', password: 'Mahyar@2025' },
    { firstName: 'Mehdi', lastName: 'Mehdi', email: 'mehdi@kpi.com', password: 'Mehdi_1234' },
    { firstName: 'Mehrnaz', lastName: 'Mehrnaz', email: 'mehrnaz@kpi.com', password: 'Mehrnaz2025#' },
    { firstName: 'Mina', lastName: 'Mina', email: 'mina@kpi.com', password: 'Mina@2025!' },
    { firstName: 'Parham', lastName: 'Parham', email: 'parham@kpi.com', password: 'Parham!9876' },
    { firstName: 'Sahel', lastName: 'Sahel', email: 'sahel@kpi.com', password: 'Sahel2025@' },
    { firstName: 'Sara', lastName: 'Sara', email: 'sara@kpi.com', password: 'Sara!2025' },
    { firstName: 'Shahab', lastName: 'Shahab', email: 'shahab@kpi.com', password: 'Shahab@2025!' },
    { firstName: 'Zahra', lastName: 'Zahra', email: 'zahra@kpi.com', password: 'Zahra_1234' },
    { firstName: 'Zeinab', lastName: 'Zeinab', email: 'zeinab@kpi.com', password: 'Zeinab!2025' },
    { firstName: 'کاربر', lastName: 'کاربر', email: 'karbar@kpi.com', password: 'Karbar@2025' },
  ]

  const users = await Promise.all(
    userData.map(async (user) => {
      const hashedPassword = await bcrypt.hash(user.password, 10)
      return prisma.user.create({
        data: {
          email: user.email,
          password: hashedPassword,
          firstName: user.firstName,
          lastName: user.lastName,
          isAdmin: false,
          isTechnicalDeputy: false,
          isActive: true,
          totalPoints: 0,
        },
      })
    })
  )

 console.log('✅ All normal users created')
 console.log('👥 Total users created: 1 admin +', users.length, 'normal users =', users.length + 1, 'total')
 console.log('\n📧 Admin Credentials:')
 console.log('- مدیر سیستم: admin@kpi.com | Password: Admin@123 | Role: Admin + Technical Deputy')
 console.log('\n📧 Normal User Credentials:')
 userData.forEach((user) => {
   console.log(`- ${user.firstName} ${user.lastName}: ${user.email} | Password: ${user.password}`)
 })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

