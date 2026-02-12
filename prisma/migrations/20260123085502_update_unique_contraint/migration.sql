/*
  Warnings:

  - A unique constraint covering the columns `[name,tenantId]` on the table `Projects` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[projectId,title]` on the table `Tasks` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Projects_id_tenantId_key";

-- CreateIndex
CREATE UNIQUE INDEX "Projects_name_tenantId_key" ON "Projects"("name", "tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Tasks_projectId_title_key" ON "Tasks"("projectId", "title");
