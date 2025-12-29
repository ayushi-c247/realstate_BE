/*
  Warnings:

  - You are about to alter the column `company_name` on the `agent_profiles` table. The data in that column could be lost. The data in that column will be cast from `VarChar(150)` to `VarChar(56)`.
  - You are about to alter the column `risk_tolerance` on the `investor_profiles` table. The data in that column could be lost. The data in that column will be cast from `VarChar(50)` to `VarChar(15)`.

*/
-- AlterTable
ALTER TABLE `agent_profiles` MODIFY `company_name` VARCHAR(56) NULL;

-- AlterTable
ALTER TABLE `investor_profiles` MODIFY `risk_tolerance` VARCHAR(15) NULL;

-- AlterTable
ALTER TABLE `users` ADD COLUMN `last_login_date` DATETIME(3) NULL;
