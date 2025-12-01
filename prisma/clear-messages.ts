import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function clearAllMessages() {
  try {
    console.log('🗑️  Starting to clear all messages from database...')
    
    // Delete all messages
    const deletedMessages = await prisma.message.deleteMany({})
    
    console.log(`✅ Successfully cleared ${deletedMessages.count} messages from the database`)
    console.log('📭 The messages table is now empty')
    
  } catch (error) {
    console.error('❌ Error clearing messages:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Execute the function
clearAllMessages()
  .then(() => {
    console.log('🎉 All messages have been cleared successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Failed to clear messages:', error)
    process.exit(1)
  })