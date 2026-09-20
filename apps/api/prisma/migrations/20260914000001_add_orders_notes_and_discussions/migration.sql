-- AlterTable: Add weight to products
ALTER TABLE "products" ADD COLUMN "weight" INTEGER NOT NULL DEFAULT 500;

-- AlterTable: Add name fields to customer_addresses
ALTER TABLE "customer_addresses" ADD COLUMN "province_name" VARCHAR(100) NOT NULL DEFAULT '';
ALTER TABLE "customer_addresses" ADD COLUMN "city_name" VARCHAR(100) NOT NULL DEFAULT '';
ALTER TABLE "customer_addresses" ADD COLUMN "district_name" VARCHAR(100) NOT NULL DEFAULT '';

-- AlterTable: Add notes to orders
ALTER TABLE "orders" ADD COLUMN "notes" TEXT;

-- CreateTable: discussions
CREATE TABLE "discussions" (
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "customer_name" VARCHAR(150) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT,
    "answered_by" VARCHAR(150),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "discussions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "discussions_product_id_idx" ON "discussions"("product_id");

-- AddForeignKey
ALTER TABLE "discussions" ADD CONSTRAINT "discussions_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
