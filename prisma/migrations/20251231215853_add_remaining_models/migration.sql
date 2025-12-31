-- CreateTable
CREATE TABLE "blog" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "titleTag" TEXT NOT NULL,
    "metaDescription" TEXT,
    "canonicalUrl" TEXT,
    "h1Title" TEXT NOT NULL,
    "bodyText" TEXT,
    "jsonLd" JSONB,
    "featuredImage" TEXT,
    "featuredImageAlt" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "blog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blog_component" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "blogId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "blog_component_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "urunler" (
    "id" TEXT NOT NULL,
    "title" TEXT,
    "summery" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "body" TEXT,
    "media" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "urunler_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "doctortestimonial" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "unvan" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "social_link" JSONB NOT NULL,
    "testimonial" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "doctortestimonial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "doctorprofile" (
    "id" TEXT NOT NULL,
    "isim_unvan" TEXT NOT NULL,
    "uzmanlik_alani" TEXT,
    "unvan_detay" TEXT,
    "adres" JSONB,
    "iletisim" JSONB,
    "pratisen_ozellikleri" TEXT,
    "konum_bilgisi" JSONB,
    "slug" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "doctorprofile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "blog_slug_key" ON "blog"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "urunler_title_key" ON "urunler"("title");

-- CreateIndex
CREATE UNIQUE INDEX "urunler_slug_key" ON "urunler"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "doctortestimonial_name_key" ON "doctortestimonial"("name");

-- CreateIndex
CREATE UNIQUE INDEX "doctortestimonial_slug_key" ON "doctortestimonial"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "doctorprofile_slug_key" ON "doctorprofile"("slug");

-- AddForeignKey
ALTER TABLE "blog_component" ADD CONSTRAINT "blog_component_blogId_fkey" FOREIGN KEY ("blogId") REFERENCES "blog"("id") ON DELETE CASCADE ON UPDATE CASCADE;
