-- AlterForeignKey
ALTER TABLE "WriterEvaluation" DROP CONSTRAINT "WriterEvaluation_workgroupId_fkey",
ADD CONSTRAINT "WriterEvaluation_workgroupId_fkey" FOREIGN KEY ("workgroupId") REFERENCES "Workgroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterForeignKey
ALTER TABLE "WriterFeedback" DROP CONSTRAINT "WriterFeedback_workgroupId_fkey",
ADD CONSTRAINT "WriterFeedback_workgroupId_fkey" FOREIGN KEY ("workgroupId") REFERENCES "Workgroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;