-- DropIndex
DROP INDEX "TaskHistory_taskId_changedAt_idx";

-- CreateIndex
CREATE INDEX "TaskHistory_taskId_projectId_tenantId_idx" ON "TaskHistory"("taskId", "projectId", "tenantId");
