/*
  Warnings:

  - A unique constraint covering the columns `[id,tenantId]` on the table `Projects` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tenantId,authToken]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Projects_id_tenantId_key" ON "Projects"("id", "tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "User_tenantId_authToken_key" ON "User"("tenantId", "authToken");
