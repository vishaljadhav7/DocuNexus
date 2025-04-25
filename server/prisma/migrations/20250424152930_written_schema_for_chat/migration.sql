-- DropForeignKey
ALTER TABLE "ContractReview" DROP CONSTRAINT "ContractReview_userId_fkey";

-- CreateTable
CREATE TABLE "Chat" (
    "id" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "contractId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Chat_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ContractReview" ADD CONSTRAINT "ContractReview_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "ContractReview"("id") ON DELETE CASCADE ON UPDATE CASCADE;
