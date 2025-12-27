-- AlterTable
ALTER TABLE "products" ADD COLUMN     "isFeatured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "showStorePhone" BOOLEAN NOT NULL DEFAULT false;
