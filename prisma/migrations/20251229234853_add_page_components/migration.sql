-- CreateTable
CREATE TABLE "page_component" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "pageId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "page_component_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "page_component" ADD CONSTRAINT "page_component_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "page"("id") ON DELETE CASCADE ON UPDATE CASCADE;
