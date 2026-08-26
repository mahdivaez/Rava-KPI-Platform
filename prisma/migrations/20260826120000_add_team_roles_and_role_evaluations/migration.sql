-- Adds the six new team roles and the generic, role-driven evaluation table.

-- AlterEnum: WorkgroupRole gains STRATEGIST_ASSISTANT, DESIGNER, EDITOR,
-- VIDEOGRAPHER, SOCIAL_ADMIN and ONSITE_ADMIN.
-- Recreated (instead of ALTER TYPE ... ADD VALUE) so the whole migration stays
-- inside one transaction on every supported PostgreSQL version.
CREATE TYPE "WorkgroupRole_new" AS ENUM (
  'STRATEGIST',
  'STRATEGIST_ASSISTANT',
  'WRITER',
  'DESIGNER',
  'EDITOR',
  'VIDEOGRAPHER',
  'SOCIAL_ADMIN',
  'ONSITE_ADMIN'
);
ALTER TABLE "WorkgroupMember"
  ALTER COLUMN "role" TYPE "WorkgroupRole_new"
  USING ("role"::text::"WorkgroupRole_new");
ALTER TYPE "WorkgroupRole" RENAME TO "WorkgroupRole_old";
ALTER TYPE "WorkgroupRole_new" RENAME TO "WorkgroupRole";
DROP TYPE "WorkgroupRole_old";

-- AlterEnum: CommentType gains ROLE_EVALUATION.
CREATE TYPE "CommentType_new" AS ENUM (
  'STRATEGIST_EVALUATION',
  'WRITER_EVALUATION',
  'WRITER_FEEDBACK',
  'ROLE_EVALUATION'
);
ALTER TABLE "Comment"
  ALTER COLUMN "type" TYPE "CommentType_new"
  USING ("type"::text::"CommentType_new");
ALTER TYPE "CommentType" RENAME TO "CommentType_old";
ALTER TYPE "CommentType_new" RENAME TO "CommentType";
DROP TYPE "CommentType_old";

-- CreateTable
CREATE TABLE "RoleEvaluation" (
    "id" TEXT NOT NULL,
    "workgroupId" TEXT NOT NULL,
    "evaluatorId" TEXT NOT NULL,
    "evaluatorRole" "WorkgroupRole" NOT NULL,
    "targetId" TEXT NOT NULL,
    "targetRole" "WorkgroupRole" NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "status" "EvaluationStatus" NOT NULL DEFAULT 'COMPLETED',
    "scores" JSONB NOT NULL,
    "totalScore" INTEGER NOT NULL,
    "averageScore" DOUBLE PRECISION NOT NULL,
    "metricNotes" JSONB,
    "strengths" TEXT,
    "improvements" TEXT,
    "example" TEXT,
    "suggestions" TEXT,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RoleEvaluation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RoleEvaluation_evaluatorId_idx" ON "RoleEvaluation"("evaluatorId");
CREATE INDEX "RoleEvaluation_targetId_idx" ON "RoleEvaluation"("targetId");
CREATE INDEX "RoleEvaluation_workgroupId_idx" ON "RoleEvaluation"("workgroupId");
CREATE INDEX "RoleEvaluation_targetRole_idx" ON "RoleEvaluation"("targetRole");
CREATE INDEX "RoleEvaluation_month_year_idx" ON "RoleEvaluation"("month", "year");
CREATE UNIQUE INDEX "RoleEvaluation_unique_per_period"
  ON "RoleEvaluation"("evaluatorId", "targetId", "targetRole", "workgroupId", "month", "year");

-- AddForeignKey
ALTER TABLE "RoleEvaluation" ADD CONSTRAINT "RoleEvaluation_workgroupId_fkey"
  FOREIGN KEY ("workgroupId") REFERENCES "Workgroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "RoleEvaluation" ADD CONSTRAINT "RoleEvaluation_evaluatorId_fkey"
  FOREIGN KEY ("evaluatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "RoleEvaluation" ADD CONSTRAINT "RoleEvaluation_targetId_fkey"
  FOREIGN KEY ("targetId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
