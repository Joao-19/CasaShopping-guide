-- CreateTable
CREATE TABLE "settings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "backgroundDesktop" TEXT,
    "backgroundMobile" TEXT,
    "advertisementBanner" TEXT,
    "advertisementBannerDisplay" INTEGER NOT NULL DEFAULT 3,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "settings_pkey" PRIMARY KEY ("id")
);
