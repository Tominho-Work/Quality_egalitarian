import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import * as XLSX from "xlsx";

export const runtime = "nodejs";

const prisma = new PrismaClient();

function parseExcelDate(value: any): Date | null {
  if (value instanceof Date) return value;
  if (typeof value === 'number') {
    const jsDate = new Date(Math.round((value - 25569) * 86400 * 1000));
    return jsDate;
  }
  if (typeof value === 'string') {
    const d = new Date(value);
    return isNaN(+d) ? null : d;
  }
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(Buffer.from(arrayBuffer), { type: 'buffer', cellDates: true });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const rows: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: true, defval: "" });

    const headerRow = rows[0] || [];
    const headerMap: Record<string, number> = {};
    headerRow.forEach((cellValue: any, colIndex: number) => {
      const headerText = String(cellValue ?? '').toLowerCase().trim();
      if (headerText) headerMap[headerText] = colIndex;
    });

    const requiredHeaders: Record<string, { aliases: string[]; keywords: string[] }> = {
      id: {
        aliases: ["id"],
        keywords: ["id"],
      },
      program: {
        aliases: ["program"],
        keywords: ["program"],
      },
      impact: {
        aliases: [
          "does the proposal intends to create the  expected  impact? (note: a framework of good practices to solve major environmental and social issues related to waste, dumpsites and waste pickers, throug...)",
          "does the proposal intends to create the expected impact?",
          "impact"
        ],
        keywords: ["impact"],
      },
      digitalTransformation: {
        aliases: [
          "does the proposal intends to create digital solutions to the problems and promote digital transformation in the regions targeted, and, simultaneously, develop digital competences in the students?",
          "digital transformation",
          "digital"
        ],
        keywords: ["digital"],
      },
      clarity: {
        aliases: [
          "does the proposal is clear and detailed in terms of objectives, timeline,  organization, future work plan among others?",
          "clarity",
          "clear and detailed"
        ],
        keywords: ["clear", "detailed"],
      },
      comments: {
        aliases: [
          "comments and recommendations for the team progress.",
          "comments"
        ],
        keywords: ["comments"],
      },
    };

    const headers = Object.keys(headerMap);
    const resolveColumn = (config: { aliases: string[]; keywords: string[] }) => {
      const direct = config.aliases
        .map(a => a.toLowerCase().trim())
        .find(a => a in headerMap);
      if (direct) return headerMap[direct];
      const candidate = headers.find(h => {
        const text = h.toLowerCase();
        if (config.keywords.length <= 1) {
          return config.keywords.some(k => text.includes(k));
        }
        return config.keywords.every(k => text.includes(k));
      });
      if (candidate) return headerMap[candidate];
      return -1;
    };

    // Resolve rating/comment columns
    const colIndex: Record<keyof typeof requiredHeaders, number> = {} as any;
    for (const key in requiredHeaders) {
      const idx = resolveColumn(requiredHeaders[key as keyof typeof requiredHeaders]);
      if (idx < 0) {
        const cfg = requiredHeaders[key as keyof typeof requiredHeaders];
        return NextResponse.json({ error: `Missing column: one of ${cfg.aliases.join(' | ')} or keywords: ${cfg.keywords.join(' & ')}` }, { status: 400 });
      }
      colIndex[key as keyof typeof requiredHeaders] = idx;
    }

    // Resolve a date column to determine cycle (supports multiple variants across cycles)
    const dateHeaderCandidates = [
      'start time', 'completion time',
      'hora de início', 'hora de inicio', 'hora da última modificação', 'hora da última modif', 'hora de conclusão', 'hora de conclusao'
    ].map(h => h.toLowerCase());

    const dateColName = headers.find(h => dateHeaderCandidates.includes(h.toLowerCase()))
      || headers.find(h => /hora.*(in[ií]cio|conclus[aã]o|modifica[cç][aã]o)/i.test(h))
      || headers.find(h => /(start|completion).*time/i.test(h));

    const dateColIdx = dateColName ? headerMap[dateColName] : -1;
    if (dateColIdx < 0) {
      return NextResponse.json({ error: `Missing a date/time column (expected one of: ${dateHeaderCandidates.join(', ')})` }, { status: 400 });
    }

    const createdIds: string[] = [];

    const normalizeScore = (value: any): number => {
      if (value === null || value === undefined) return 0;
      if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
      const raw = String(value).trim().toLowerCase();
      const digitMatch = raw.replace(/[,]/g, '.').match(/[1-5]/);
      if (digitMatch) return Number(digitMatch[0]);
      if (/(very\s*dissatisfied|strongly\s*disagree)/.test(raw)) return 1;
      if (/(dissatisfied|disagree)/.test(raw)) return 2;
      if (/(neither|neutral)/.test(raw)) return 3;
      if (/(satisfied|agree)/.test(raw)) return 4;
      if (/(very\s*satisfied|strongly\s*agree)/.test(raw)) return 5;
      const n = Number(raw);
      return isNaN(n) ? 0 : n;
    }

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i] as any[];
      if (!row || row.every(v => (v === null || v === undefined || String(v).trim() === ""))) continue;

      const startTime = parseExcelDate(row[dateColIdx]);
      if (!startTime) continue;

      // Resolve cycle by month window (UTC) to avoid timezone issues
      const y = startTime.getUTCFullYear();
      const m = startTime.getUTCMonth();
      const monthStart = new Date(Date.UTC(y, m, 1, 0, 0, 0, 0));
      const monthEnd = new Date(Date.UTC(y, m + 1, 0, 23, 59, 59, 999));
      const cycle = await prisma.eventCycle.findFirst({
        where: {
          startDate: { lte: monthEnd },
          endDate: { gte: monthStart },
        },
        select: { id: true },
      });
      if (!cycle) continue;

      const sourceId = String(row[colIndex.id] ?? '').trim();
      if (!sourceId) continue;

      try {
        const whereUnique: any = { cycleId_sourceId: { cycleId: cycle.id, sourceId } };
        const upserted = await prisma.proposalPresentationFeedback.upsert({
          where: whereUnique,
          update: {
            program: String(row[colIndex.program] ?? '').trim(),
            impact: normalizeScore(row[colIndex.impact]),
            digitalTransformation: normalizeScore(row[colIndex.digitalTransformation]),
            clarity: normalizeScore(row[colIndex.clarity]),
            comments: String(row[colIndex.comments] ?? '').trim() || null,
          },
          create: {
            cycleId: cycle.id,
            sourceId,
            program: String(row[colIndex.program] ?? '').trim(),
            impact: normalizeScore(row[colIndex.impact]),
            digitalTransformation: normalizeScore(row[colIndex.digitalTransformation]),
            clarity: normalizeScore(row[colIndex.clarity]),
            comments: String(row[colIndex.comments] ?? '').trim() || null,
          } as any,
        });
        createdIds.push(upserted.id);
      } catch (e) {
        console.error('Failed to upsert proposal feedback row', e);
      }
    }

    return NextResponse.json({ inserted: createdIds.length });
  } catch (e) {
    console.error('Import proposals feedback error:', e);
    return NextResponse.json({ error: 'Failed to import proposals feedback' }, { status: 500 });
  }
}


