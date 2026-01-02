-- AlterTable
ALTER TABLE "urunler" ADD COLUMN     "canonicalUrl" TEXT,
ADD COLUMN     "jsonLd" JSONB,
ADD COLUMN     "metaDescription" TEXT,
ADD COLUMN     "titleTag" TEXT;
