/*
  Warnings:

  - You are about to drop the `Task` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('user', 'supporter');

-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('open', 'matched', 'confirmed', 'completed', 'canceled', 'expired');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('matched', 'confirmed', 'decline', 'refusal', 'completed', 'canceled');

-- DropTable
DROP TABLE "Task";

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'user',

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "requests" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "RequestStatus" NOT NULL DEFAULT 'open',
    "requestedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "scheduledDate" DATE NOT NULL,
    "scheduledStartTime" TEXT,
    "scheduledEndTime" TEXT,
    "scheduledDurationMinutes" INTEGER,
    "workLocation1" TEXT NOT NULL,
    "workLocation2" TEXT,
    "matchedSupporterId" TEXT,
    "centerId" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" SERIAL NOT NULL,
    "requestId" INTEGER NOT NULL,
    "supporterId" TEXT NOT NULL,
    "status" "OrderStatus" NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "requests_status_requestedAt_idx" ON "requests"("status", "requestedAt");

-- CreateIndex
CREATE INDEX "requests_userId_status_idx" ON "requests"("userId", "status");

-- CreateIndex
CREATE INDEX "orders_supporterId_requestId_idx" ON "orders"("supporterId", "requestId");

-- CreateIndex
CREATE UNIQUE INDEX "orders_requestId_supporterId_key" ON "orders"("requestId", "supporterId");

-- AddForeignKey
ALTER TABLE "requests" ADD CONSTRAINT "requests_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requests" ADD CONSTRAINT "requests_matchedSupporterId_fkey" FOREIGN KEY ("matchedSupporterId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_supporterId_fkey" FOREIGN KEY ("supporterId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
