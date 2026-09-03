-- The portal shows a client's name in three places that want three different
-- forms: the brand headline, the full contact name under it, and the greeting,
-- where a short first name plus «جان» reads far warmer than a full title.
-- `greetingName` is that third form; empty falls back to `contactName`.

ALTER TABLE "ClientAccount" ADD COLUMN "greetingName" TEXT;
