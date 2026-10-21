-- One login, however many brands. A client account used to *be* a brand: it
-- carried `brandName` and a single `workgroupId`. An owner of two clinics
-- therefore needed two logins. The brands move into their own table so one
-- password opens both, and every verdict records which brand it is about.

-- CreateTable
CREATE TABLE "ClientBrand" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "brandName" TEXT NOT NULL,
    "workgroupId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClientBrand_pkey" PRIMARY KEY ("id")
);

-- Backfill: every existing account becomes its own single brand. The id is
-- derived from the account id so the UPDATE below can find it again.
INSERT INTO "ClientBrand" ("id", "clientId", "brandName", "workgroupId", "createdAt", "updatedAt")
SELECT
    'c' || md5("id" || ':brand'),
    "id",
    "brandName",
    "workgroupId",
    "createdAt",
    CURRENT_TIMESTAMP
FROM "ClientAccount";

-- AlterTable: point existing verdicts at the brand they were filed for.
ALTER TABLE "ClientEvaluation" ADD COLUMN "brandId" TEXT;

UPDATE "ClientEvaluation" AS e
SET "brandId" = b."id"
FROM "ClientBrand" AS b
WHERE b."clientId" = e."clientId";

-- Any row whose account vanished has nothing left to report on.
DELETE FROM "ClientEvaluation" WHERE "brandId" IS NULL;

ALTER TABLE "ClientEvaluation" ALTER COLUMN "brandId" SET NOT NULL;

-- AlterTable: the account keeps the person, the brand keeps the brand.
ALTER TABLE "ClientAccount" DROP CONSTRAINT "ClientAccount_workgroupId_fkey";
DROP INDEX "ClientAccount_workgroupId_idx";
ALTER TABLE "ClientAccount" DROP COLUMN "brandName";
ALTER TABLE "ClientAccount" DROP COLUMN "workgroupId";

-- CreateIndex
CREATE INDEX "ClientBrand_clientId_idx" ON "ClientBrand"("clientId");
CREATE INDEX "ClientBrand_workgroupId_idx" ON "ClientBrand"("workgroupId");
CREATE UNIQUE INDEX "ClientBrand_clientId_workgroupId_key" ON "ClientBrand"("clientId", "workgroupId");

-- CreateIndex: a person judged under two brands is two separate verdicts.
DROP INDEX "ClientEvaluation_unique_per_period";
CREATE UNIQUE INDEX "ClientEvaluation_unique_per_period" ON "ClientEvaluation"("clientId", "brandId", "targetId", "targetRole", "month", "year");
CREATE INDEX "ClientEvaluation_brandId_idx" ON "ClientEvaluation"("brandId");

-- AddForeignKey
ALTER TABLE "ClientBrand" ADD CONSTRAINT "ClientBrand_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "ClientAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ClientBrand" ADD CONSTRAINT "ClientBrand_workgroupId_fkey" FOREIGN KEY ("workgroupId") REFERENCES "Workgroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ClientEvaluation" ADD CONSTRAINT "ClientEvaluation_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "ClientBrand"("id") ON DELETE CASCADE ON UPDATE CASCADE;
