import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { processTextToWords } from "@/lib/text-processing";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const cycleId = searchParams.get('cycleId');
  const program = searchParams.get('program');

  try {
    const cycles = await prisma.eventCycle.findMany({
      select: { id: true, name: true, startDate: true, endDate: true },
      orderBy: { startDate: 'asc' },
    });

    const uniquePrograms = await prisma.proposalPresentationFeedback.findMany({
      select: { program: true },
      distinct: ['program'],
      orderBy: { program: 'asc' },
    });

    const where: any = {};
    if (cycleId) where.cycleId = cycleId;
    if (program) where.program = program;

    const responses = await prisma.proposalPresentationFeedback.findMany({ where });

    const totalResponses = responses.length;
    const distributionTemplate = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } as Record<number, number>;

    const makeDistribution = (key: 'impact' | 'digitalTransformation' | 'clarity') => {
      const dist: Record<number, number> = { ...distributionTemplate };
      let validSum = 0;
      let validCount = 0;
      responses.forEach(r => {
        const v = r[key];
        if (v >= 1 && v <= 5) {
          dist[v] = (dist[v] || 0) + 1;
          validSum += v;
          validCount += 1;
        }
      });
      const avg = validCount ? validSum / validCount : 0;
      return { distribution: dist, average: Math.round(avg * 100) / 100 };
    };

    const impact = makeDistribution('impact');
    const digitalTransformation = makeDistribution('digitalTransformation');
    const clarity = makeDistribution('clarity');

    const comments = responses.map(r => r.comments).filter((c): c is string => !!c && c.trim().length > 0);
    const wordCloudData = comments.length ? processTextToWords(comments) : [];

    // Overall trend by cycle (average of the three question averages), ignoring cycleId filter but respecting program
    const trendWhere: any = { ...where };
    delete trendWhere.cycleId;
    const trendResponses = await prisma.proposalPresentationFeedback.findMany({ where: trendWhere });
    const perCycle = new Map<string, { impactSum: number; impactCount: number; dtSum: number; dtCount: number; claritySum: number; clarityCount: number }>();
    trendResponses.forEach(r => {
      const key = r.cycleId;
      if (!perCycle.has(key)) perCycle.set(key, { impactSum: 0, impactCount: 0, dtSum: 0, dtCount: 0, claritySum: 0, clarityCount: 0 });
      const agg = perCycle.get(key)!;
      if (r.impact >= 1 && r.impact <= 5) { agg.impactSum += r.impact; agg.impactCount += 1; }
      if (r.digitalTransformation >= 1 && r.digitalTransformation <= 5) { agg.dtSum += r.digitalTransformation; agg.dtCount += 1; }
      if (r.clarity >= 1 && r.clarity <= 5) { agg.claritySum += r.clarity; agg.clarityCount += 1; }
    });
    const overallTrend = cycles.map(cycle => {
      const agg = perCycle.get(cycle.id);
      const avgImpact = agg && agg.impactCount ? agg.impactSum / agg.impactCount : 0;
      const avgDt = agg && agg.dtCount ? agg.dtSum / agg.dtCount : 0;
      const avgClarity = agg && agg.clarityCount ? agg.claritySum / agg.clarityCount : 0;
      const overall = (avgImpact + avgDt + avgClarity) / 3;
      return { cycle: cycle.name, value: Math.round(overall * 100) / 100 };
    });

    return NextResponse.json({
      cycles,
      programs: uniquePrograms.map(p => p.program),
      totalResponses,
      questions: {
        impact,
        digitalTransformation,
        clarity,
      },
      wordCloudData,
      overallTrend,
    });
  } catch (e) {
    console.error('Proposals analytics error:', e);
    return NextResponse.json({ error: 'Failed to fetch proposals analytics' }, { status: 500 });
  }
}




