-- CreateEnum
CREATE TYPE "WorkgroupRole" AS ENUM ('STRATEGIST', 'WRITER');

-- CreateEnum
CREATE TYPE "EvaluationStatus" AS ENUM ('PENDING', 'COMPLETED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "isTechnicalDeputy" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Workgroup" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Workgroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkgroupMember" (
    "id" TEXT NOT NULL,
    "workgroupId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "WorkgroupRole" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkgroupMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StrategistEvaluation" (
    "id" TEXT NOT NULL,
    "strategistId" TEXT NOT NULL,
    "evaluatorId" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "status" "EvaluationStatus" NOT NULL DEFAULT 'PENDING',
    "ideation" INTEGER NOT NULL,
    "avgViews" INTEGER NOT NULL,
    "qualityControl" INTEGER NOT NULL,
    "teamRelations" INTEGER NOT NULL,
    "clientRelations" INTEGER NOT NULL,
    "responsiveness" INTEGER NOT NULL,
    "clientSatisfaction" INTEGER NOT NULL,
    "strengths" TEXT,
    "improvements" TEXT,
    "suggestions" TEXT,
    "evaluatorNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StrategistEvaluation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WriterEvaluation" (
    "id" TEXT NOT NULL,
    "writerId" TEXT NOT NULL,
    "strategistId" TEXT NOT NULL,
    "workgroupId" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "status" "EvaluationStatus" NOT NULL DEFAULT 'PENDING',
    "responsibility" INTEGER NOT NULL,
    "strategistSatisfaction" INTEGER NOT NULL,
    "meetingEngagement" INTEGER NOT NULL,
    "scenarioPerformance" INTEGER NOT NULL,
    "clientSatisfaction" INTEGER NOT NULL,
    "brandAlignment" INTEGER NOT NULL,
    "strengths" TEXT,
    "improvements" TEXT,
    "suggestions" TEXT,
    "evaluatorNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WriterEvaluation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WriterFeedback" (
    "id" TEXT NOT NULL,
    "writerId" TEXT NOT NULL,
    "strategistId" TEXT NOT NULL,
    "workgroupId" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "communication" INTEGER NOT NULL,
    "supportLevel" INTEGER NOT NULL,
    "clarityOfTasks" INTEGER NOT NULL,
    "feedbackQuality" INTEGER NOT NULL,
    "positivePoints" TEXT,
    "improvements" TEXT,
    "suggestions" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WriterFeedback_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "Workgroup_name_idx" ON "Workgroup"("name");

-- CreateIndex
CREATE INDEX "WorkgroupMember_workgroupId_idx" ON "WorkgroupMember"("workgroupId");

-- CreateIndex
CREATE INDEX "WorkgroupMember_userId_idx" ON "WorkgroupMember"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "WorkgroupMember_workgroupId_userId_role_key" ON "WorkgroupMember"("workgroupId", "userId", "role");

-- CreateIndex
CREATE INDEX "StrategistEvaluation_strategistId_idx" ON "StrategistEvaluation"("strategistId");

-- CreateIndex
CREATE INDEX "StrategistEvaluation_evaluatorId_idx" ON "StrategistEvaluation"("evaluatorId");

-- CreateIndex
CREATE INDEX "StrategistEvaluation_month_year_idx" ON "StrategistEvaluation"("month", "year");

-- CreateIndex
CREATE UNIQUE INDEX "StrategistEvaluation_strategistId_month_year_key" ON "StrategistEvaluation"("strategistId", "month", "year");

-- CreateIndex
CREATE INDEX "WriterEvaluation_writerId_idx" ON "WriterEvaluation"("writerId");

-- CreateIndex
CREATE INDEX "WriterEvaluation_strategistId_idx" ON "WriterEvaluation"("strategistId");

-- CreateIndex
CREATE INDEX "WriterEvaluation_workgroupId_idx" ON "WriterEvaluation"("workgroupId");

-- CreateIndex
CREATE INDEX "WriterEvaluation_month_year_idx" ON "WriterEvaluation"("month", "year");

-- CreateIndex
CREATE UNIQUE INDEX "WriterEvaluation_writerId_strategistId_workgroupId_month_ye_key" ON "WriterEvaluation"("writerId", "strategistId", "workgroupId", "month", "year");

-- CreateIndex
CREATE INDEX "WriterFeedback_strategistId_idx" ON "WriterFeedback"("strategistId");

-- CreateIndex
CREATE INDEX "WriterFeedback_workgroupId_idx" ON "WriterFeedback"("workgroupId");

-- CreateIndex
CREATE INDEX "WriterFeedback_month_year_idx" ON "WriterFeedback"("month", "year");

-- CreateIndex
CREATE UNIQUE INDEX "WriterFeedback_writerId_strategistId_workgroupId_month_year_key" ON "WriterFeedback"("writerId", "strategistId", "workgroupId", "month", "year");

-- AddForeignKey
ALTER TABLE "WorkgroupMember" ADD CONSTRAINT "WorkgroupMember_workgroupId_fkey" FOREIGN KEY ("workgroupId") REFERENCES "Workgroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkgroupMember" ADD CONSTRAINT "WorkgroupMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StrategistEvaluation" ADD CONSTRAINT "StrategistEvaluation_strategistId_fkey" FOREIGN KEY ("strategistId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StrategistEvaluation" ADD CONSTRAINT "StrategistEvaluation_evaluatorId_fkey" FOREIGN KEY ("evaluatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WriterEvaluation" ADD CONSTRAINT "WriterEvaluation_writerId_fkey" FOREIGN KEY ("writerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WriterEvaluation" ADD CONSTRAINT "WriterEvaluation_strategistId_fkey" FOREIGN KEY ("strategistId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WriterEvaluation" ADD CONSTRAINT "WriterEvaluation_workgroupId_fkey" FOREIGN KEY ("workgroupId") REFERENCES "Workgroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WriterFeedback" ADD CONSTRAINT "WriterFeedback_writerId_fkey" FOREIGN KEY ("writerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WriterFeedback" ADD CONSTRAINT "WriterFeedback_workgroupId_fkey" FOREIGN KEY ("workgroupId") REFERENCES "Workgroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
