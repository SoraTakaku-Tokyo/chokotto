/*
  Warnings:

  - Made the column `address2` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "users" ALTER COLUMN "address2" SET NOT NULL;
