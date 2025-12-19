import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function clearEvaluations(userEmail: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      select: { id: true, firstName: true, lastName: true }
    })

    if (!user) {
      console.error(`❌ User with email "${userEmail}" not found.`)
      process.exit(1)
    }

    const userId = user.id
    const userName = `${user.firstName} ${user.lastName}`
    console.log(`🗑️  Starting to clear evaluations for user: ${userName} (${userEmail})...`)

    // Clear evaluations for the specified user
    const deletedStrategistEvals = await prisma.strategistEvaluation.deleteMany({ where: { strategistId: userId } })
    const deletedWriterEvals = await prisma.writerEvaluation.deleteMany({ where: { writerId: userId } })
    const deletedWriterFeedbacks = await prisma.writerFeedback.deleteMany({ where: { writerId: userId } })

    console.log(`✅ Successfully cleared:`)
    console.log(`   📊 ${deletedStrategistEvals.count} strategist evaluations`)
    console.log(`   📝 ${deletedWriterEvals.count} writer evaluations`)
    console.log(`   💬 ${deletedWriterFeedbacks.count} writer feedbacks`)
    console.log('')
    console.log(`📈 All evaluations for ${userName} have been cleared successfully!`)

  } catch (error) {
    console.error('❌ Error clearing evaluations:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Get command line arguments
const args = process.argv.slice(2)
const userEmail = args[0]

if (!userEmail) {
  console.error('❌ Usage: node clear-evaluations.ts <user-email>')
  console.error('   Example: node clear-evaluations.ts user@example.com')
  process.exit(1)
}

// Execute the function
clearEvaluations(userEmail)
  .then(() => {
    console.log('🎉 User evaluations have been cleared successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Failed to clear evaluations:', error)
    process.exit(1)
  })