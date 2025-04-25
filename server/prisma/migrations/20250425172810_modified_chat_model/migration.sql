/*
  Warnings:

  - You are about to drop the column `message` on the `Chat` table. All the data in the column will be lost.
  - Added the required column `aiResponse` to the `Chat` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userQuery` to the `Chat` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Chat" DROP COLUMN "message",
ADD COLUMN     "aiResponse" TEXT NOT NULL,
ADD COLUMN     "userQuery" TEXT NOT NULL;
