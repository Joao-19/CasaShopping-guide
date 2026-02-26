/*
  Warnings:

  - You are about to drop the column `advertisementBanner` on the `settings` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "settings" DROP COLUMN "advertisementBanner",
ADD COLUMN     "advertisementBannerDesktop" TEXT,
ADD COLUMN     "advertisementBannerMobile" TEXT;
