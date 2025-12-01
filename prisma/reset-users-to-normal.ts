import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🔄 Resetting all users to normal role...')

  const defaultPassword = 'password123'
  const hashedPassword = await bcrypt.hash(defaultPassword, 10)

  // Update all users to normal role and set default password
  const updatedUsers = await prisma.user.updateMany({
    data: {
      isAdmin: false,
      isTechnicalDeputy: false,
      password: hashedPassword,
    },
  })

  console.log(`✅ Updated ${updatedUsers.count} users to normal role`)

  // Get all users
  const users = await prisma.user.findMany({
    select: {
      email: true,
      firstName: true,
      lastName: true,
    },
  })

  console.log('\n📧 User Credentials:')
  console.log('🔑 Default Password: password123')
  console.log('👥 All users are now normal users\n')

  users.forEach((user) => {
    console.log(`- ${user.firstName} ${user.lastName}: ${user.email}`)
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