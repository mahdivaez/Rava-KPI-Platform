import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function clearAllEvaluations() {
  try {
    console.log('🗑️  Starting to clear all evaluations from database...')
    
    // Clear all types of evaluations
    const deletedStrategistEvals = await prisma.strategistEvaluation.deleteMany({})
    const deletedWriterEvals = await prisma.writerEvaluation.deleteMany({})
    const deletedWriterFeedbacks = await prisma.writerFeedback.deleteMany({})
    
    console.log(`✅ Successfully cleared:`)
    console.log(`   📊 ${deletedStrategistEvals.count} strategist evaluations`)
    console.log(`   📝 ${deletedWriterEvals.count} writer evaluations`)
    console.log(`   💬 ${deletedWriterFeedbacks.count} writer feedbacks`)
    console.log('')
    console.log('📈 The evaluations system is now empty and ready for fresh data')
    
  } catch (error) {
    console.error('❌ Error clearing evaluations:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Execute the function
clearAllEvaluations()
  .then(() => {
    console.log('🎉 All evaluations have been cleared successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Failed to clear evaluations:', error)
    process.exit(1)
  })