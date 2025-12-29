-- CreateTable
CREATE TABLE `users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `first_name` VARCHAR(50) NOT NULL,
    `last_name` VARCHAR(50) NOT NULL,
    `full_name` VARCHAR(105) NOT NULL,
    `email` VARCHAR(80) NOT NULL,
    `password` VARCHAR(255) NULL,
    `role` ENUM('INVESTOR', 'AGENT', 'ADMIN') NOT NULL DEFAULT 'INVESTOR',
    `status` ENUM('ACTIVE', 'INACTIVE', 'PENDING') NOT NULL DEFAULT 'PENDING',
    `reset_token` VARCHAR(500) NULL,
    `access_token` VARCHAR(500) NULL,
    `is_email_verified` BOOLEAN NOT NULL DEFAULT false,
    `password_reset_at` DATETIME(3) NULL,
    `created_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    UNIQUE INDEX `users_reset_token_key`(`reset_token`),
    UNIQUE INDEX `users_access_token_key`(`access_token`),
    INDEX `users_email_role_status_idx`(`email`, `role`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `investor_profiles` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `risk_tolerance` VARCHAR(50) NULL,
    `budget_min` DECIMAL(15, 2) NULL,
    `budget_max` DECIMAL(15, 2) NULL,
    `preferred_property_types` JSON NULL,
    `investment_horizon` ENUM('SHORT', 'MEDIUM', 'LONG') NULL,
    `primary_objective` ENUM('YIELD', 'APPRECIATION', 'LIFESTYLE', 'DIVERSIFICATION') NULL,
    `ownership_structure` ENUM('SOLE', 'JOINT', 'FRACTIONAL', 'LEASEBACK') NULL,
    `preferred_regions` JSON NULL,
    `tourism_preferences` JSON NULL,
    `renovation_willingness` ENUM('TURNKEY', 'LIGHT', 'FULL') NULL,
    `amenities_priority` JSON NULL,
    `management_strategy` ENUM('SELF', 'AGENCY', 'HYBRID') NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `investor_profiles_user_id_key`(`user_id`),
    INDEX `investor_profiles_user_id_fkey`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `agent_profiles` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `company_name` VARCHAR(150) NULL,
    `contact_number` VARCHAR(20) NOT NULL,
    `license_number` VARCHAR(50) NOT NULL,
    `approval_status` ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `agent_profiles_user_id_key`(`user_id`),
    INDEX `agent_profiles_user_status_idx`(`user_id`, `approval_status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `agent_clients` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `agent_id` INTEGER NOT NULL,
    `investor_id` INTEGER NOT NULL,
    `agentProfileId` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `agent_clients_agent_id_idx`(`agent_id`),
    INDEX `agent_clients_investor_id_idx`(`investor_id`),
    UNIQUE INDEX `agent_investor_unique`(`agent_id`, `investor_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `favorites` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `property_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `favorites_user_id_fkey`(`user_id`),
    UNIQUE INDEX `favorites_user_property_unique`(`user_id`, `property_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `saved_calculations` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `purchase_price` DECIMAL(15, 2) NOT NULL,
    `down_payment` DECIMAL(15, 2) NOT NULL,
    `loan_term_months` INTEGER NOT NULL,
    `interest_rate` DECIMAL(5, 2) NOT NULL,
    `expected_rental_income` DECIMAL(15, 2) NULL,
    `appreciation_rate` DECIMAL(5, 2) NULL,
    `emi` DECIMAL(15, 2) NULL,
    `roi` DECIMAL(5, 2) NULL,
    `rental_yield` DECIMAL(5, 2) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `saved_calculations_user_id_fkey`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `investor_profiles` ADD CONSTRAINT `investor_profiles_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `agent_profiles` ADD CONSTRAINT `agent_profiles_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `agent_clients` ADD CONSTRAINT `agent_clients_agent_id_fkey` FOREIGN KEY (`agent_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `agent_clients` ADD CONSTRAINT `agent_clients_investor_id_fkey` FOREIGN KEY (`investor_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `agent_clients` ADD CONSTRAINT `agent_clients_agentProfileId_fkey` FOREIGN KEY (`agentProfileId`) REFERENCES `agent_profiles`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `favorites` ADD CONSTRAINT `favorites_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `saved_calculations` ADD CONSTRAINT `saved_calculations_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
