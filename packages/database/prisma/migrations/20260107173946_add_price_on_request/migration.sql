-- AlterEnum
ALTER TYPE "PriceTier" ADD VALUE 'ON_REQUEST';

-- AlterTable
ALTER TABLE "stores" ADD COLUMN     "whatsapp" TEXT;
