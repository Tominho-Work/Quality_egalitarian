import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create sample event
  const event = await prisma.event.create({
    data: {
      name: 'Leadership Development Workshop',
      description: 'A comprehensive leadership development program to enhance management skills and team effectiveness.',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-12-31'),
      location: 'Corporate Training Center',
      eventType: 'workshop',
    },
  })

  // Create event metrics
  const metrics = await prisma.eventMetric.createMany({
    data: [
      {
        eventId: event.id,
        name: 'Overall Satisfaction',
        description: 'Overall satisfaction rating from participants',
        metricType: 'SATISFACTION',
        unit: '%',
        targetValue: 85,
      },
      {
        eventId: event.id,
        name: 'Engagement Rate',
        description: 'Level of participant engagement during sessions',
        metricType: 'ENGAGEMENT',
        unit: '%',
        targetValue: 90,
      },
      {
        eventId: event.id,
        name: 'Learning Outcomes',
        description: 'Achievement of learning objectives',
        metricType: 'LEARNING_OUTCOME',
        unit: 'score',
        targetValue: 4.5,
      },
      {
        eventId: event.id,
        name: 'Attendance Rate',
        description: 'Percentage of registered participants who attended',
        metricType: 'ATTENDANCE',
        unit: '%',
        targetValue: 95,
      },
    ],
  })

  // Create EGALITARIAN event cycles
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

  // Create sample participants
  const participants = await Promise.all([
    prisma.eventParticipant.create({
      data: {
        eventId: event.id,
        cycleId: cycles[0].id,
        email: 'john.doe@company.com',
        name: 'John Doe',
        department: 'Engineering',
        role: 'Team Lead',
        attended: true,
      },
    }),
    prisma.eventParticipant.create({
      data: {
        eventId: event.id,
        cycleId: cycles[0].id,
        email: 'jane.smith@company.com',
        name: 'Jane Smith',
        department: 'Marketing',
        role: 'Manager',
        attended: true,
      },
    }),
    prisma.eventParticipant.create({
      data: {
        eventId: event.id,
        cycleId: cycles[1].id,
        email: 'mike.johnson@company.com',
        name: 'Mike Johnson',
        department: 'Sales',
        role: 'Director',
        attended: true,
      },
    }),
  ])

  // Get created metrics for reference
  const createdMetrics = await prisma.eventMetric.findMany({
    where: { eventId: event.id },
  })

  // Create sample metric values for completed cycles
  const metricValues = []
  for (const cycle of cycles.slice(0, 2)) { // Only for completed cycles
    for (const metric of createdMetrics) {
      let value: number
      switch (metric.metricType) {
        case 'SATISFACTION':
          value = Math.random() * 20 + 80 // 80-100%
          break
        case 'ENGAGEMENT':
          value = Math.random() * 15 + 85 // 85-100%
          break
        case 'LEARNING_OUTCOME':
          value = Math.random() * 1 + 4 // 4-5 score
          break
        case 'ATTENDANCE':
          value = Math.random() * 10 + 90 // 90-100%
          break
        default:
          value = Math.random() * 100
      }

      metricValues.push({
        cycleId: cycle.id,
        metricId: metric.id,
        value: Math.round(value * 100) / 100,
      })
    }
  }

  await prisma.cycleMetric.createMany({
    data: metricValues,
  })

  // Create sample feedback analysis
  await prisma.feedbackAnalysis.createMany({
    data: [
      {
        cycleId: cycles[0].id,
        eventId: event.id,
        textContent: 'Great workshop! Very informative and engaging. The facilitator was excellent.',
        sentiment: 'positive',
        keywords: ['great', 'informative', 'engaging', 'excellent', 'facilitator'],
        score: 0.85,
        category: 'content',
      },
      {
        cycleId: cycles[0].id,
        eventId: event.id,
        textContent: 'The workshop was good but could use more hands-on activities and practical examples.',
        sentiment: 'neutral',
        keywords: ['good', 'hands-on', 'activities', 'practical', 'examples'],
        score: 0.1,
        category: 'delivery',
      },
      {
        cycleId: cycles[1].id,
        eventId: event.id,
        textContent: 'Excellent content and delivery. Learned a lot about leadership techniques.',
        sentiment: 'positive',
        keywords: ['excellent', 'content', 'delivery', 'learned', 'leadership', 'techniques'],
        score: 0.9,
        category: 'content',
      },
    ],
  })

  // Create improvement points
  await prisma.improvementPoint.createMany({
    data: [
      {
        eventId: event.id,
        cycleId: cycles[0].id,
        title: 'Add More Interactive Activities',
        description: 'Participants requested more hands-on exercises and group activities to enhance engagement.',
        category: 'content',
        priority: 'HIGH',
        status: 'IN_PROGRESS',
      },
      {
        eventId: event.id,
        cycleId: cycles[0].id,
        title: 'Improve Room Setup',
        description: 'Current room layout doesn\'t facilitate group discussions effectively.',
        category: 'logistics',
        priority: 'MEDIUM',
        status: 'IDENTIFIED',
      },
      {
        eventId: event.id,
        cycleId: cycles[1].id,
        title: 'Extend Session Duration',
        description: 'Participants felt rushed during some sessions and would benefit from additional time.',
        category: 'process',
        priority: 'MEDIUM',
        status: 'COMPLETED',
      },
    ],
  })

  console.log('✅ Seeding completed successfully!')
  console.log(`Created event: ${event.name}`)
  console.log(`Created ${cycles.length} cycles`)
  console.log(`Created ${participants.length} participants`)
  console.log(`Created ${createdMetrics.length} metrics`)
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 