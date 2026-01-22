/*
  Warnings:

  - Added the required column `projectId` to the `TaskHistory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenantId` to the `TaskHistory` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TaskHistory" ADD COLUMN     "projectId" BIGINT NOT NULL,
ADD COLUMN     "tenantId" BIGINT NOT NULL;
