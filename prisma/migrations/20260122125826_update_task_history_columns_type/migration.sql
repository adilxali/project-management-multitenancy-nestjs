-- AlterTable
ALTER TABLE "TaskHistory" ADD COLUMN     "additionalJson" JSON,
ALTER COLUMN "oldStatus" DROP NOT NULL,
ALTER COLUMN "newStatus" DROP NOT NULL;
