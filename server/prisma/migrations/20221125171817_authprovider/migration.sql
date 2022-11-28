/*
  Warnings:

  - You are about to drop the column `email` on the `User` table. All the data in the column will be lost.
  - Added the required column `authProvider` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `authProviderId` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ProviderType" AS ENUM ('GOOGLE', 'GITHUB');

-- DropIndex
DROP INDEX "User_email_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "email",
ADD COLUMN     "authProvider" "ProviderType" NOT NULL,
ADD COLUMN     "authProviderId" TEXT NOT NULL,
ADD COLUMN     "signUpConfirmed" BOOLEAN NOT NULL DEFAULT false;
