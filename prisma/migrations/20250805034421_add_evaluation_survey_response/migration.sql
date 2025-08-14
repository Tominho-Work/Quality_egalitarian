-- CreateEnum
CREATE TYPE "CycleStatus" AS ENUM ('PLANNING', 'ACTIVE', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "MetricType" AS ENUM ('SATISFACTION', 'ENGAGEMENT', 'LEARNING_OUTCOME', 'ATTENDANCE', 'COMPLETION_RATE', 'NPS_SCORE', 'CUSTOM');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "ImprovementStatus" AS ENUM ('IDENTIFIED', 'IN_PROGRESS', 'COMPLETED', 'DEFERRED');

-- CreateTable
CREATE TABLE "events" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "location" TEXT,
    "eventType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_cycles" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" "CycleStatus" NOT NULL DEFAULT 'PLANNING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "event_cycles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_participants" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "cycleId" TEXT,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "department" TEXT,
    "role" TEXT,
    "registeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "attended" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "event_participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "form_responses" (
    "id" TEXT NOT NULL,
    "cycleId" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,
    "responseData" JSONB NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "form_responses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evaluation_survey_responses" (
    "id" TEXT NOT NULL,
    "cycleId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "university" TEXT NOT NULL,
    "planning" INTEGER NOT NULL,
    "localStaff" INTEGER NOT NULL,
    "sendingInstitution" INTEGER NOT NULL,
    "accommodationTravel" INTEGER NOT NULL,
    "programme" INTEGER NOT NULL,
    "culturalTour" INTEGER NOT NULL,
    "overallSatisfaction" INTEGER NOT NULL,
    "preparedness" INTEGER NOT NULL,
    "comments" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "evaluation_survey_responses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_metrics" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "metricType" "MetricType" NOT NULL,
    "unit" TEXT,
    "targetValue" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "event_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cycle_metrics" (
    "id" TEXT NOT NULL,
    "cycleId" TEXT NOT NULL,
    "metricId" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cycle_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feedback_analysis" (
    "id" TEXT NOT NULL,
    "cycleId" TEXT,
    "eventId" TEXT,
    "textContent" TEXT NOT NULL,
    "sentiment" TEXT,
    "keywords" TEXT[],
    "score" DOUBLE PRECISION,
    "category" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "feedback_analysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "improvement_points" (
    "id" TEXT NOT NULL,
    "eventId" TEXT,
    "cycleId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "priority" "Priority" NOT NULL DEFAULT 'MEDIUM',
    "status" "ImprovementStatus" NOT NULL DEFAULT 'IDENTIFIED',
    "assignedTo" TEXT,
    "dueDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "improvement_points_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "event_participants_eventId_email_key" ON "event_participants"("eventId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "cycle_metrics_cycleId_metricId_key" ON "cycle_metrics"("cycleId", "metricId");

-- AddForeignKey
ALTER TABLE "event_cycles" ADD CONSTRAINT "event_cycles_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_participants" ADD CONSTRAINT "event_participants_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_participants" ADD CONSTRAINT "event_participants_cycleId_fkey" FOREIGN KEY ("cycleId") REFERENCES "event_cycles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "form_responses" ADD CONSTRAINT "form_responses_cycleId_fkey" FOREIGN KEY ("cycleId") REFERENCES "event_cycles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "form_responses" ADD CONSTRAINT "form_responses_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "event_participants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluation_survey_responses" ADD CONSTRAINT "evaluation_survey_responses_cycleId_fkey" FOREIGN KEY ("cycleId") REFERENCES "event_cycles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_metrics" ADD CONSTRAINT "event_metrics_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cycle_metrics" ADD CONSTRAINT "cycle_metrics_cycleId_fkey" FOREIGN KEY ("cycleId") REFERENCES "event_cycles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cycle_metrics" ADD CONSTRAINT "cycle_metrics_metricId_fkey" FOREIGN KEY ("metricId") REFERENCES "event_metrics"("id") ON DELETE CASCADE ON UPDATE CASCADE;
