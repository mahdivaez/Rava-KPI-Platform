-- Client-side evaluation: brand contacts who rate the team working on their
-- workgroup. Clients live outside `User` so they can never hold a team role.

-- CreateTable
CREATE TABLE "ClientAccount" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "contactName" TEXT NOT NULL,
    "brandName" TEXT NOT NULL,
    "workgroupId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "welcomeTitle" TEXT,
    "welcomeMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClientAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientEvaluation" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "workgroupId" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "targetRole" "WorkgroupRole" NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "skipped" BOOLEAN NOT NULL DEFAULT false,
    "scores" JSONB NOT NULL,
    "totalScore" INTEGER NOT NULL DEFAULT 0,
    "averageScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "answers" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClientEvaluation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ClientAccount_email_key" ON "ClientAccount"("email");
CREATE INDEX "ClientAccount_workgroupId_idx" ON "ClientAccount"("workgroupId");
CREATE INDEX "ClientAccount_email_idx" ON "ClientAccount"("email");

-- CreateIndex
CREATE INDEX "ClientEvaluation_clientId_idx" ON "ClientEvaluation"("clientId");
CREATE INDEX "ClientEvaluation_targetId_idx" ON "ClientEvaluation"("targetId");
CREATE INDEX "ClientEvaluation_workgroupId_idx" ON "ClientEvaluation"("workgroupId");
CREATE INDEX "ClientEvaluation_month_year_idx" ON "ClientEvaluation"("month", "year");
CREATE UNIQUE INDEX "ClientEvaluation_unique_per_period" ON "ClientEvaluation"("clientId", "targetId", "targetRole", "month", "year");

-- AddForeignKey
ALTER TABLE "ClientAccount" ADD CONSTRAINT "ClientAccount_workgroupId_fkey" FOREIGN KEY ("workgroupId") REFERENCES "Workgroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ClientEvaluation" ADD CONSTRAINT "ClientEvaluation_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "ClientAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ClientEvaluation" ADD CONSTRAINT "ClientEvaluation_workgroupId_fkey" FOREIGN KEY ("workgroupId") REFERENCES "Workgroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ClientEvaluation" ADD CONSTRAINT "ClientEvaluation_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
