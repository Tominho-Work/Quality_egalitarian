import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { processTextToWords } from "@/lib/text-processing";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const cycleId = searchParams.get('cycleId');
  const role = searchParams.get('role');
  const university = searchParams.get('university');

  try {
    // Get cycles for filter dropdown
    const cycles = await prisma.eventCycle.findMany({
      select: {
        id: true,
        name: true,
        startDate: true,
        endDate: true,
      },
      orderBy: { startDate: 'asc' },
    });

    // Get unique roles and universities for filter dropdowns
    const uniqueRoles = await prisma.evaluationSurveyResponse.findMany({
      select: { role: true },
      distinct: ['role'],
      orderBy: { role: 'asc' },
    });

    const uniqueUniversities = await prisma.evaluationSurveyResponse.findMany({
      select: { university: true },
      distinct: ['university'],
      orderBy: { university: 'asc' },
    });

    // Build filter
    const whereClause: any = {};
    if (cycleId) whereClause.cycleId = cycleId;
    if (role) whereClause.role = role;
    if (university) whereClause.university = university;

    // Get all survey responses (respecting all selected filters)
    const responses = await prisma.evaluationSurveyResponse.findMany({
      where: whereClause,
      include: {
        cycle: {
          select: {
            name: true,
          },
        },
      },
    });

    if (responses.length === 0) {
      return NextResponse.json({
        cycles,
        roles: uniqueRoles.map(r => r.role),
        universities: uniqueUniversities.map(u => u.university),
        metrics: {
          overallSatisfaction: { value: 0, target: 4.0, count: 0 },
          preparedness: { value: 0, target: 4.0, count: 0 },
        },
        questionAverages: {},
        wordCloudData: [],
        demographics: {
          byRole: {},
          byUniversity: {},
          byCycle: {},
        },
        totalResponses: 0,
      });
    }

    // Calculate KPI metrics
    const satisfactionQuestions = [
      'planning',
      'localStaff', 
      'sendingInstitution',
      'accommodationTravel',
      'programme',
      'culturalTour',
      'overallSatisfaction'
    ] as const;

    // Overall satisfaction average (Q2-Q8, but only count questions with data)
    let satisfactionSum = 0;
    let satisfactionQuestionCount = 0;
    
    responses.forEach(response => {
      satisfactionQuestions.forEach(question => {
        const value = response[question] || 0;
        if (value > 0) {  // Only count questions that have answers
          satisfactionSum += value;
          satisfactionQuestionCount++;
        }
      });
    });
    
    const overallSatisfactionAvg = satisfactionQuestionCount > 0 ? satisfactionSum / satisfactionQuestionCount : 0;

    // Preparedness average (Q9)
    const preparednessSum = responses.reduce((sum, response) => sum + (response.preparedness || 0), 0);
    const preparednessAvg = responses.length > 0 ? preparednessSum / responses.length : 0;

    // Process comments for word cloud
    const comments = responses
      .map(r => r.comments)
      .filter(c => c && c.trim().length > 0) as string[];
    
    const wordCloudData = comments.length > 0 
      ? processTextToWords(comments)
      : [];

    // Demographics breakdown
    const demographics = {
      byRole: responses.reduce((acc: Record<string, number>, r) => {
        acc[r.role] = (acc[r.role] || 0) + 1;
        return acc;
      }, {}),
      byUniversity: responses.reduce((acc: Record<string, number>, r) => {
        acc[r.university] = (acc[r.university] || 0) + 1;
        return acc;
      }, {}),
      byCycle: responses.reduce((acc: Record<string, number>, r) => {
        const cycleName = r.cycle?.name || 'Unknown';
        acc[cycleName] = (acc[cycleName] || 0) + 1;
        return acc;
      }, {}),
    };

    // Individual question averages for detailed breakdown
    const questionAverages = satisfactionQuestions.reduce((acc, question) => {
      const validResponses = responses.filter(response => (response[question] || 0) > 0);
      const sum = validResponses.reduce((sum, response) => sum + (response[question] || 0), 0);
      acc[question] = validResponses.length > 0 ? sum / validResponses.length : 0;
      return acc;
    }, {} as Record<string, number>);

    // Overall trend by cycle (ignores cycleId filter, but applies other filters)
    const trendWhere: any = { ...whereClause };
    delete trendWhere.cycleId;

    const trendResponses = await prisma.evaluationSurveyResponse.findMany({
      where: trendWhere,
      select: {
        cycleId: true,
        planning: true,
        localStaff: true,
        sendingInstitution: true,
        accommodationTravel: true,
        programme: true,
        culturalTour: true,
        overallSatisfaction: true,
      },
    });

    const perCycleAggregation = trendResponses.reduce((acc: Record<string, { sum: number; count: number }>, r) => {
      const values = [
        r.planning,
        r.localStaff,
        r.sendingInstitution,
        r.accommodationTravel,
        r.programme,
        r.culturalTour,
        r.overallSatisfaction,
      ];
      let sum = 0;
      let count = 0;
      values.forEach(v => {
        const value = v || 0;
        if (value > 0) {
          sum += value;
          count += 1;
        }
      });
      if (!acc[r.cycleId]) acc[r.cycleId] = { sum: 0, count: 0 };
      acc[r.cycleId].sum += sum;
      acc[r.cycleId].count += count;
      return acc;
    }, {});

    const overallTrend = cycles.map(cycle => {
      const agg = perCycleAggregation[cycle.id] || { sum: 0, count: 0 };
      const avg = agg.count > 0 ? Math.round((agg.sum / agg.count) * 100) / 100 : 0;
      return { cycle: cycle.name, value: avg };
    });

    return NextResponse.json({
      cycles,
      roles: uniqueRoles.map(r => r.role),
      universities: uniqueUniversities.map(u => u.university),
      metrics: {
        overallSatisfaction: { 
          value: Math.round(overallSatisfactionAvg * 100) / 100, 
          target: 4.0, 
          count: responses.length 
        },
        preparedness: { 
          value: Math.round(preparednessAvg * 100) / 100, 
          target: 4.0, 
          count: responses.length 
        },
      },
      questionAverages,
      wordCloudData,
      demographics,
      totalResponses: responses.length,
      overallTrend,
    });

  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}