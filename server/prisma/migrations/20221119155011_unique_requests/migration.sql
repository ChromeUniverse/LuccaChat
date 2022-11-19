/*
  Warnings:

  - A unique constraint covering the columns `[receiverId,senderId]` on the table `Request` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Request_receiverId_senderId_key" ON "Request"("receiverId", "senderId");
