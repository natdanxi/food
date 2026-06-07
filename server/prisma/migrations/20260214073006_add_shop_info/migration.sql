-- CreateTable
CREATE TABLE "ShopInfo" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'แม่ครัวตัวกลม',
    "address" TEXT,
    "phone" TEXT,
    "isOpen" BOOLEAN NOT NULL DEFAULT true,
    "openTime" TEXT DEFAULT '08:30',
    "closeTime" TEXT DEFAULT '16:00',
    "logo" TEXT,

    CONSTRAINT "ShopInfo_pkey" PRIMARY KEY ("id")
);
