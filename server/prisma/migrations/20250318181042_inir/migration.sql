-- CreateEnum
CREATE TYPE "Severity" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "Impact" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "googleId" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "emailId" TEXT NOT NULL,
    "profilePic" TEXT NOT NULL DEFAULT 'https://plus.unsplash.com/premium_photo-1739786996022-5ed5b56834e2?q=80&w=1480',
    "isPremium" BOOLEAN NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContractReview" (
    "id" TEXT NOT NULL,
    "contractText" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "contractType" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "recommendations" TEXT[],
    "clauses" TEXT[],
    "performanceMetrics" TEXT[],
    "negotiationPoints" TEXT[],
    "legalCompliance" TEXT,
    "contractDuration" TEXT,
    "terminationConditions" TEXT,
    "overallScore" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expirationDate" TIMESTAMP(3),
    "language" TEXT NOT NULL DEFAULT 'en',
    "aiModel" TEXT NOT NULL DEFAULT 'gemini-pro',
    "version" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "ContractReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Risk" (
    "id" TEXT NOT NULL,
    "risk" TEXT NOT NULL,
    "riskDetails" TEXT NOT NULL,
    "contractReviewId" TEXT NOT NULL,
    "severity" "Severity" NOT NULL,

    CONSTRAINT "Risk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Opportunity" (
    "id" TEXT NOT NULL,
    "opportunity" TEXT NOT NULL,
    "opportunityDetails" TEXT NOT NULL,
    "impact" "Impact" NOT NULL,
    "contractReviewId" TEXT NOT NULL,

    CONSTRAINT "Opportunity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompensationStructure" (
    "id" TEXT NOT NULL,
    "contractReviewId" TEXT NOT NULL,
    "baseSalary" TEXT,
    "bonuses" TEXT,
    "equity" TEXT,
    "otherBenefits" TEXT,

    CONSTRAINT "CompensationStructure_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinancialTerms" (
    "id" TEXT NOT NULL,
    "contractReviewId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "details" TEXT[],

    CONSTRAINT "FinancialTerms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "sid" TEXT NOT NULL,
    "sess" JSONB NOT NULL,
    "expire" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("sid")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_googleId_key" ON "User"("googleId");

-- CreateIndex
CREATE UNIQUE INDEX "User_emailId_key" ON "User"("emailId");

-- CreateIndex
CREATE UNIQUE INDEX "CompensationStructure_contractReviewId_key" ON "CompensationStructure"("contractReviewId");

-- CreateIndex
CREATE UNIQUE INDEX "FinancialTerms_contractReviewId_key" ON "FinancialTerms"("contractReviewId");

-- AddForeignKey
ALTER TABLE "ContractReview" ADD CONSTRAINT "ContractReview_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Risk" ADD CONSTRAINT "Risk_contractReviewId_fkey" FOREIGN KEY ("contractReviewId") REFERENCES "ContractReview"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Opportunity" ADD CONSTRAINT "Opportunity_contractReviewId_fkey" FOREIGN KEY ("contractReviewId") REFERENCES "ContractReview"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompensationStructure" ADD CONSTRAINT "CompensationStructure_contractReviewId_fkey" FOREIGN KEY ("contractReviewId") REFERENCES "ContractReview"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinancialTerms" ADD CONSTRAINT "FinancialTerms_contractReviewId_fkey" FOREIGN KEY ("contractReviewId") REFERENCES "ContractReview"("id") ON DELETE CASCADE ON UPDATE CASCADE;
