import { EvaluationSurveyResponse } from "@prisma/client";

/**
 * Map various textual answers in the XLSX to uniform numeric scores (1-5).
 */
export function ratingToNumber(text: string): number {
  const normalized = text.trim().toLowerCase();
  switch (normalized) {
    case "very dissatisfied":
    case "did not prepare at all":
      return 1;
    case "dissatisfied":
    case "prepared very little":
      return 2;
    case "neither dissatisfied nor satisfied":
    case "prepared a little":
      return 3;
    case "satisfied":
    case "prepared reasonably well":
      return 4;
    case "very satisfied":
    case "prepared very well":
      return 5;
    default:
      // Attempt to parse numeric, else 0
      const n = Number(text);
      return isNaN(n) ? 0 : n;
  }
}

export interface RawSurveyRow {
  startTime: Date;
  role: string;
  university: string;
  planning: string;
  localStaff: string;
  sendingInstitution: string;
  accommodationTravel: string;
  programme: string;
  culturalTour: string;
  overallSatisfaction: string;
  preparedness: string;
  comments?: string;
  memorableMoment?: string;
}

/**
 * Transform a raw row into data suitable for Prisma create.
 */
export function transformRow(row: RawSurveyRow) {
  // Combine comments and memorable moments for word cloud analysis
  const combinedComments = [
    row.comments || '',
    row.memorableMoment || ''
  ].filter(text => text.trim()).join(' ');

  return {
    sourceId: null,
    role: row.role,
    university: row.university,
    planning: ratingToNumber(row.planning),
    localStaff: ratingToNumber(row.localStaff),
    sendingInstitution: ratingToNumber(row.sendingInstitution),
    accommodationTravel: ratingToNumber(row.accommodationTravel),
    programme: ratingToNumber(row.programme),
    culturalTour: ratingToNumber(row.culturalTour),
    overallSatisfaction: ratingToNumber(row.overallSatisfaction),
    preparedness: ratingToNumber(row.preparedness),
    comments: combinedComments || null,
  } satisfies Omit<EvaluationSurveyResponse, "id" | "cycleId" | "createdAt">;
}
