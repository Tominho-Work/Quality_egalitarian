import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import ExcelJS from "exceljs";
import { RawSurveyRow, transformRow } from "@/lib/evaluation-mapping";

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
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(arrayBuffer);
  const worksheet = workbook.worksheets[0];

  // Determine column indices by header row (assumes first row headers)
  const headerRow = worksheet.getRow(1);
  const headerMap: Record<string, number> = {};
  headerRow.eachCell((cell, colNumber) => {
    const headerText = String(cell.text).toLowerCase().trim();
    headerMap[headerText] = colNumber;
    console.log(`Column ${colNumber}: "${headerText}"`);
  });
  
  console.log('Available headers:', Object.keys(headerMap));

  const requiredHeaders = {
    startTime: ["start time", "start time (for filtering)"] as string[],
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
  for (let i = 2; i <= worksheet.rowCount; i++) {
    const row = worksheet.getRow(i);
    if (row.actualCellCount === 0) continue; // skip empty rows

    const raw: RawSurveyRow & { startTime: Date | null; memorableMoment?: string } = {
      startTime: parseExcelDate(row.getCell(colIndex.startTime).value) as Date,
      role: String(row.getCell(colIndex.role).text).trim(),
      university: String(row.getCell(colIndex.university).text).trim(),
      planning: String(row.getCell(colIndex.planning).text).trim(),
      localStaff: String(row.getCell(colIndex.localStaff).text).trim(),
      sendingInstitution: String(row.getCell(colIndex.sendingInstitution).text).trim(),
      accommodationTravel: String(row.getCell(colIndex.accommodationTravel).text).trim(),
      programme: String(row.getCell(colIndex.programme).text).trim(),
      culturalTour: colIndex.culturalTour > 0 ? String(row.getCell(colIndex.culturalTour).text).trim() : "",
      overallSatisfaction: String(row.getCell(colIndex.overallSatisfaction).text).trim(),
      preparedness: String(row.getCell(colIndex.preparedness).text).trim(),
      comments: String(row.getCell(colIndex.comments).text).trim(),
      memorableMoment: colIndex.memorableMoment > 0 ? String(row.getCell(colIndex.memorableMoment).text).trim() : "",
    };

    if (!raw.startTime) {
      console.log(`Row ${i}: No valid start time, skipping`);
      continue;
    }
    
    console.log(`Row ${i}: Processing response with start time: ${raw.startTime}`);
    
    // Debug: List all cycles for first row
    if (i === 2) {
      const allCycles = await prisma.eventCycle.findMany({
        select: { id: true, name: true, startDate: true, endDate: true },
      });
      console.log('All available cycles:', allCycles);
    }
    
    // Find cycleId by date (convert to UTC date-only comparison to handle timezone differences)
    const responseDate = new Date(Date.UTC(raw.startTime.getFullYear(), raw.startTime.getMonth(), raw.startTime.getDate()));
    console.log(`Converted ${raw.startTime} to UTC date-only: ${responseDate}`);
    
    const cycle = await prisma.eventCycle.findFirst({
      where: {
        startDate: { lte: responseDate },
        endDate: { gte: responseDate },
      },
      select: { id: true, name: true, startDate: true, endDate: true },
    });
    
    console.log(`Found cycle for date ${raw.startTime}:`, cycle);
    
    if (!cycle) {
      console.log(`Row ${i}: No cycle found for date ${raw.startTime}, skipping`);
      continue;
    }

    const data = transformRow(raw as RawSurveyRow);
    try {
      const created = await prisma.evaluationSurveyResponse.create({
        data: {
          cycleId: cycle.id,
          ...data,
        },
      });
      createdRecords.push(created.id);
    } catch (e) {
      console.error("Failed to create row", e);
    }
  }

  return NextResponse.json({ inserted: createdRecords.length });
}
