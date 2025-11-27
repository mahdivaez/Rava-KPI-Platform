const { PrismaClient } = require('@prisma/client')
const moment = require('moment-jalaali')

const prisma = new PrismaClient()

async function convertToPersianDates() {
  console.log('🔄 Converting Gregorian dates to Persian dates...')

  // Convert StrategistEvaluation dates
  const strategistEvals = await prisma.strategistEvaluation.findMany()
  console.log(`📊 Found ${strategistEvals.length} strategist evaluations`)

  for (const evaluation of strategistEvals) {
    // Create a Gregorian date from year/month/1
    const gregorianDate = moment(`${evaluation.year}-${evaluation.month.toString().padStart(2, '0')}-01`, 'YYYY-MM-DD')

    // Get Persian year and month
    const persianYear = gregorianDate.jYear()
    const persianMonth = gregorianDate.jMonth() + 1 // jMonth is 0-based

    await prisma.strategistEvaluation.update({
      where: { id: evaluation.id },
      data: {
        year: persianYear,
        month: persianMonth
      }
    })
  }

  // Convert WriterEvaluation dates
  const writerEvals = await prisma.writerEvaluation.findMany()
  console.log(`📝 Found ${writerEvals.length} writer evaluations`)

  for (const evaluation of writerEvals) {
    const gregorianDate = moment(`${evaluation.year}-${evaluation.month.toString().padStart(2, '0')}-01`, 'YYYY-MM-DD')
    const persianYear = gregorianDate.jYear()
    const persianMonth = gregorianDate.jMonth() + 1

    await prisma.writerEvaluation.update({
      where: { id: evaluation.id },
      data: {
        year: persianYear,
        month: persianMonth
      }
    })
  }

  // Convert WriterFeedback dates
  const feedbacks = await prisma.writerFeedback.findMany()
  console.log(`💬 Found ${feedbacks.length} writer feedbacks`)

  for (const feedback of feedbacks) {
    const gregorianDate = moment(`${feedback.year}-${feedback.month.toString().padStart(2, '0')}-01`, 'YYYY-MM-DD')
    const persianYear = gregorianDate.jYear()
    const persianMonth = gregorianDate.jMonth() + 1

    await prisma.writerFeedback.update({
      where: { id: feedback.id },
      data: {
        year: persianYear,
        month: persianMonth
      }
    })
  }

  console.log('✅ Migration completed successfully!')
}

async function main() {
  try {
    await convertToPersianDates()
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()