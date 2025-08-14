import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function resetAndSeed() {
  console.log('🧹 Clearing existing data...')
  
  // Delete in order of dependencies
  await prisma.evaluationSurveyResponse.deleteMany()
  await prisma.cycleMetric.deleteMany()
  await prisma.feedbackAnalysis.deleteMany()
  await prisma.improvementPoint.deleteMany()
  await prisma.formResponse.deleteMany()
  await prisma.eventParticipant.deleteMany()
  await prisma.eventCycle.deleteMany()
  await prisma.eventMetric.deleteMany()
  await prisma.event.deleteMany()

  console.log('🌱 Creating EGALITARIAN event...')
  
  // Create the main EGALITARIAN event
  const event = await prisma.event.create({
    data: {
      name: 'EGALITARIAN Program',
      description: 'European mobility program with evaluation surveys across multiple cycles',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2026-12-31'),
      location: 'Multi-location (Brazil, Denmark, Netherlands, Portugal)',
      eventType: 'program',
    },
  })

  console.log('📅 Creating event cycles...')
  
  // Create EGALITARIAN cycles matching the actual program structure
  const cycles = await Promise.all([
    prisma.eventCycle.create({
      data: {
        eventId: event.id,
        name: 'Cycle 1 - Brazil',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31'),
        status: 'COMPLETED',
      },
    }),
    prisma.eventCycle.create({
      data: {
        eventId: event.id,
        name: 'Cycle 2 - Denmark',
        startDate: new Date('2024-08-01'),
        endDate: new Date('2024-08-31'),
        status: 'COMPLETED',
      },
    }),
    prisma.eventCycle.create({
      data: {
        eventId: event.id,
        name: 'Cycle 3 - Brazil',
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-01-31'),
        status: 'PLANNING',
      },
    }),
    prisma.eventCycle.create({
      data: {
        eventId: event.id,
        name: 'Cycle 4 - Netherlands',
        startDate: new Date('2025-08-01'),
        endDate: new Date('2025-08-31'),
        status: 'PLANNING',
      },
    }),
    prisma.eventCycle.create({
      data: {
        eventId: event.id,
        name: 'Cycle 5 - Brazil',
        startDate: new Date('2026-01-01'),
        endDate: new Date('2026-01-31'),
        status: 'PLANNING',
      },
    }),
    prisma.eventCycle.create({
      data: {
        eventId: event.id,
        name: 'Cycle 6 - Portugal',
        startDate: new Date('2026-08-01'),
        endDate: new Date('2026-08-31'),
        status: 'PLANNING',
      },
    }),
  ])

  console.log('✅ Reset and seed completed!')
  console.log(`Created event: ${event.name}`)
  console.log(`Created ${cycles.length} cycles`)
  
  cycles.forEach(cycle => {
    console.log(`  - ${cycle.name}: ${cycle.startDate.toISOString().split('T')[0]} to ${cycle.endDate.toISOString().split('T')[0]}`)
  })
}

resetAndSeed()
  .catch((e) => {
    console.error('❌ Reset and seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })