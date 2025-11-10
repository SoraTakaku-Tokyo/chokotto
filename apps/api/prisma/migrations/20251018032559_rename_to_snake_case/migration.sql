/*
  Warnings:

  - You are about to drop the column `createdAt` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `requestId` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `supporterId` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `centerId` on the `requests` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `requests` table. All the data in the column will be lost.
  - You are about to drop the column `matchedSupporterId` on the `requests` table. All the data in the column will be lost.
  - You are about to drop the column `requestedAt` on the `requests` table. All the data in the column will be lost.
  - You are about to drop the column `scheduledDate` on the `requests` table. All the data in the column will be lost.
  - You are about to drop the column `scheduledDurationMinutes` on the `requests` table. All the data in the column will be lost.
  - You are about to drop the column `scheduledEndTime` on the `requests` table. All the data in the column will be lost.
  - You are about to drop the column `scheduledStartTime` on the `requests` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `requests` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `requests` table. All the data in the column will be lost.
  - You are about to drop the column `workLocation1` on the `requests` table. All the data in the column will be lost.
  - You are about to drop the column `workLocation2` on the `requests` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[request_id,supporter_id]` on the table `orders` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `request_id` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `supporter_id` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `scheduled_date` to the `requests` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `requests` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `requests` table without a default value. This is not possible if the table is not empty.
  - Added the required column `work_location1` to the `requests` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "orders" DROP CONSTRAINT "orders_requestId_fkey";

-- DropForeignKey
ALTER TABLE "orders" DROP CONSTRAINT "orders_supporterId_fkey";

-- DropForeignKey
ALTER TABLE "requests" DROP CONSTRAINT "requests_matchedSupporterId_fkey";

-- DropForeignKey
ALTER TABLE "requests" DROP CONSTRAINT "requests_userId_fkey";

-- DropIndex
DROP INDEX "orders_requestId_supporterId_key";

-- DropIndex
DROP INDEX "orders_supporterId_requestId_idx";

-- DropIndex
DROP INDEX "requests_status_requestedAt_idx";

-- DropIndex
DROP INDEX "requests_userId_status_idx";

-- AlterTable
ALTER TABLE "orders" DROP COLUMN "createdAt",
DROP COLUMN "requestId",
DROP COLUMN "supporterId",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "request_id" INTEGER NOT NULL,
ADD COLUMN     "supporter_id" TEXT NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMPTZ(6) NOT NULL;

-- AlterTable
ALTER TABLE "requests" DROP COLUMN "centerId",
DROP COLUMN "createdAt",
DROP COLUMN "matchedSupporterId",
DROP COLUMN "requestedAt",
DROP COLUMN "scheduledDate",
DROP COLUMN "scheduledDurationMinutes",
DROP COLUMN "scheduledEndTime",
DROP COLUMN "scheduledStartTime",
DROP COLUMN "updatedAt",
DROP COLUMN "userId",
DROP COLUMN "workLocation1",
DROP COLUMN "workLocation2",
ADD COLUMN     "center_id" TEXT,
ADD COLUMN     "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "matched_supporter_id" TEXT,
ADD COLUMN     "requested_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "scheduled_date" DATE NOT NULL,
ADD COLUMN     "scheduled_duration_minutes" INTEGER,
ADD COLUMN     "scheduled_end_time" TEXT,
ADD COLUMN     "scheduled_start_time" TEXT,
ADD COLUMN     "updated_at" TIMESTAMPTZ(6) NOT NULL,
ADD COLUMN     "user_id" TEXT NOT NULL,
ADD COLUMN     "work_location1" TEXT NOT NULL,
ADD COLUMN     "work_location2" TEXT;

-- CreateIndex
CREATE INDEX "orders_supporter_id_request_id_idx" ON "orders"("supporter_id", "request_id");

-- CreateIndex
CREATE UNIQUE INDEX "orders_request_id_supporter_id_key" ON "orders"("request_id", "supporter_id");

-- CreateIndex
CREATE INDEX "requests_status_requested_at_idx" ON "requests"("status", "requested_at");

-- CreateIndex
CREATE INDEX "requests_user_id_status_idx" ON "requests"("user_id", "status");

-- AddForeignKey
ALTER TABLE "requests" ADD CONSTRAINT "requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requests" ADD CONSTRAINT "requests_matched_supporter_id_fkey" FOREIGN KEY ("matched_supporter_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_supporter_id_fkey" FOREIGN KEY ("supporter_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
