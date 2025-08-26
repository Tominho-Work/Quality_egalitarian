import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import * as XLSX from "xlsx";
import { RawSurveyRow, transformRow } from "@/lib/evaluation-mapping";

export const runtime = "nodejs";

function parseExcelDate(value: any): Date | null {
  if (value instanceof Date) return value;
  if (typeof value === 'number') {
    // Excel serial number to JS Date (assuming 1900 date system)
    const jsDate = new Date(Math.round((value - 25569) * 86400 * 1000));
    return jsDate;
  }
  if (typeof value === 'string') {
    const d = new Date(value);
    return isNaN(+d) ? null : d;
  }
  return null;
}

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  // OPTIONAL: Protect this route with auth; simple check here
  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const workbook = XLSX.read(buffer, { type: "buffer", cellDates: true });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  const rows: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: true, defval: "" });

  // Determine column indices by header row (assumes first row headers)
  const headerRow = rows[0] || [];
  const headerMap: Record<string, number> = {};
  headerRow.forEach((cellValue: any, colIndex: number) => {
    const headerText = String(cellValue ?? "").toLowerCase().trim();
    if (headerText) {
      // store as 0-based index
      headerMap[headerText] = colIndex;
      console.log(`Column ${colIndex + 1}: "${headerText}"`);
    }
  });
  
  console.log('Available headers:', Object.keys(headerMap));

  const requiredHeaders = {
    startTime: [
      "start time",
      "start time (for filtering)",
      "hora de início",
      "hora de inicio"
    ] as string[],
    role: ["you are a", "role"] as string[],
    university: ["your university", "university"] as string[],
    planning: [
      "2 (the planning of the event)", 
      "2", 
      "'2", 
      "'2 (the planing of the event)", 
      "2 (the planing of the event)"
    ] as string[],
    localStaff: [
      "3 (the help from staff)", 
      "3", 
      "'3", 
      "'3 (the help from staff)", 
      "3 (the help from staff)",
      "3 (the help from the local staff)",
      "'3 (the help from the local staff)"
    ] as string[],
    sendingInstitution: [
      "4 (the help from university)", 
      "4", 
      "'4", 
      "'4 (the help from university)", 
      "4 (the help from university)",
      "4 (the help from your sending institution)",
      "'4 (the help from your sending institution)"
    ] as string[],
    accommodationTravel: [
      "5 (accommodation and travelling)", 
      "5", 
      "'5", 
      "'5 (accommodation and travelling)", 
      "5 (accommodation and travelling)",
      "5 (accomodation and traveling)",
      "'5 (accomodation and traveling)"
    ] as string[],
    programme: [
      "6 (the egalitarian programme)", 
      "6", 
      "'6",
      "'6 (the egalitarian programme)"
    ] as string[],
    culturalTour: [
      "7 (the cultural tour)", 
      "7", 
      "'7",
      "'7 (the cultural tour)"
    ] as string[],
    overallSatisfaction: [
      "8 (overral satisfaction)", 
      "7", 
      "'7", 
      "8", 
      "'8", 
      "'8 (overral satisfaction)",
      "8 (overral satisfaction)",
      "'7 (overral satisfaction)",
      "8 (overall satisfaction)",
      "'8 (overall satisfaction)"
    ] as string[],
    preparedness: [
      "9 (how preppared are you feeling)", 
      "8", 
      "'8", 
      "9", 
      "'9", 
      "'9 (how preppared are you feeling)",
      "9 (how preppared are you feeling)",
      "'8 (how preppared are you feeling)"
    ] as string[],
    comments: [
      "add coments bellow",
      "comments",
      "add comments below to help us understand what you liked and what we can improve in the egalitarian event (optional)"
    ] as string[],
    memorableMoment: [
      "please share with us what was the most memorable moment on the event this week in your opinion (we will share this on our social media anonimously, unless you want us to share your names as well)"
    ] as string[],
  } as const;

  // Resolve headers to column numbers
  const colIndex: Record<keyof typeof requiredHeaders, number> = {} as any;
  const optionalFields = ['culturalTour', 'memorableMoment']; // These fields might not exist in all cycles
  
  for (const key in requiredHeaders) {
    const aliases = requiredHeaders[key as keyof typeof requiredHeaders];
    const foundAlias = aliases
      .map((a) => a.toLowerCase().trim())
      .find((a) => a in headerMap);
    
    if (!foundAlias) {
      if (optionalFields.includes(key)) {
        console.log(`Optional field '${key}' not found - this is OK for some cycles`);
        colIndex[key as keyof typeof requiredHeaders] = -1; // Mark as not available
        continue;
      }
      console.error(`Missing required column for '${key}'. Tried aliases:`, aliases);
      console.error('Available headers:', Object.keys(headerMap));
      return NextResponse.json({ 
        error: `Missing column: ${aliases[0]}. Available columns: ${Object.keys(headerMap).join(', ')}` 
      }, { status: 400 });
    }
    colIndex[key as keyof typeof requiredHeaders] = headerMap[foundAlias!];
  }

  const createdRecords = [];
  for (let i = 1; i < rows.length; i++) {
    const rowArr = rows[i] as any[];
    if (!rowArr || rowArr.every((v) => (v === null || v === undefined || String(v).trim() === ""))) continue;

    const raw: RawSurveyRow & { startTime: Date | null; memorableMoment?: string } = {
      startTime: parseExcelDate(rowArr[colIndex.startTime]) as Date,
      role: String(rowArr[colIndex.role] ?? "").trim(),
      university: String(rowArr[colIndex.university] ?? "").trim(),
      planning: String(rowArr[colIndex.planning] ?? "").trim(),
      localStaff: String(rowArr[colIndex.localStaff] ?? "").trim(),
      sendingInstitution: String(rowArr[colIndex.sendingInstitution] ?? "").trim(),
      accommodationTravel: String(rowArr[colIndex.accommodationTravel] ?? "").trim(),
      programme: String(rowArr[colIndex.programme] ?? "").trim(),
      culturalTour: colIndex.culturalTour >= 0 ? String(rowArr[colIndex.culturalTour] ?? "").trim() : "",
      overallSatisfaction: String(rowArr[colIndex.overallSatisfaction] ?? "").trim(),
      preparedness: String(rowArr[colIndex.preparedness] ?? "").trim(),
      comments: String(rowArr[colIndex.comments] ?? "").trim(),
      memorableMoment: colIndex.memorableMoment >= 0 ? String(rowArr[colIndex.memorableMoment] ?? "").trim() : "",
    };

    if (!raw.startTime) {
      console.log(`Row ${i + 1}: No valid start time, skipping`);
      continue;
    }
    
    console.log(`Row ${i + 1}: Processing response with start time: ${raw.startTime}`);
    
    // Debug: List all cycles for first row of data
    if (i === 1) {
      const allCycles = await prisma.eventCycle.findMany({
        select: { id: true, name: true, startDate: true, endDate: true },
      });
      console.log('All available cycles:', allCycles);
    }
    
    // Find cycleId by month window (UTC month start to UTC month end) to avoid timezone issues
    const y = raw.startTime.getUTCFullYear();
    const m = raw.startTime.getUTCMonth();
    const monthStart = new Date(Date.UTC(y, m, 1, 0, 0, 0, 0));
    const monthEnd = new Date(Date.UTC(y, m + 1, 0, 23, 59, 59, 999));
    console.log(`Month window for ${raw.startTime}: ${monthStart.toISOString()} - ${monthEnd.toISOString()}`);

    const cycle = await prisma.eventCycle.findFirst({
      where: {
        startDate: { lte: monthEnd },
        endDate: { gte: monthStart },
      },
      select: { id: true, name: true, startDate: true, endDate: true },
    });
    
    console.log(`Found cycle for date ${raw.startTime}:`, cycle);
    
    if (!cycle) {
      console.log(`Row ${i + 1}: No cycle found for date ${raw.startTime}, skipping`);
      continue;
    }

    // Use the XLSX row index as a simple sourceId per cycle to avoid duplicates; if your sheet has a stable ID column, map it here instead
    const sourceId = String(rowArr[headerMap['id']] ?? `${i}`);
    const data = transformRow(raw as RawSurveyRow);
    try {
      const whereUnique: any = { cycleId_sourceId: { cycleId: cycle.id, sourceId } };
      const upserted = await prisma.evaluationSurveyResponse.upsert({
        where: whereUnique,
        update: { ...data },
        create: { cycleId: cycle.id, ...data, sourceId } as any,
      });
      createdRecords.push(upserted.id);
    } catch (e) {
      console.error("Failed to upsert row", e);
    }
  }

  return NextResponse.json({ inserted: createdRecords.length });
}
