-- Add imageUrl fields to evaluation tables
ALTER TABLE "StrategistEvaluation" ADD COLUMN "imageUrl" TEXT;
ALTER TABLE "WriterEvaluation" ADD COLUMN "imageUrl" TEXT;