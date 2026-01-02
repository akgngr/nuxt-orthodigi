-- AlterTable
ALTER TABLE "doctorprofile" ADD COLUMN     "canonicalUrl" TEXT,
ADD COLUMN     "jsonLd" JSONB,
ADD COLUMN     "metaDescription" TEXT,
ADD COLUMN     "titleTag" TEXT;

-- AlterTable
ALTER TABLE "doctortestimonial" ADD COLUMN     "canonicalUrl" TEXT,
ADD COLUMN     "jsonLd" JSONB,
ADD COLUMN     "metaDescription" TEXT,
ADD COLUMN     "titleTag" TEXT;
