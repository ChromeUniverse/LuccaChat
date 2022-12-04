/*
  Warnings:

  - You are about to drop the column `signUpConfirmed` on the `User` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "AccentColorType" AS ENUM ('blue', 'pink', 'green', 'orange', 'violet');

-- AlterTable
ALTER TABLE "User" DROP COLUMN "signUpConfirmed",
ADD COLUMN     "accentColor" "AccentColorType" NOT NULL DEFAULT 'blue';
