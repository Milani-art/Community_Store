-- =========================================================
-- Community Store Database Setup Script for MySQL Workbench
-- PRM370 Group Project 2026
-- =========================================================

-- Create Database Schema if not exists
CREATE DATABASE IF NOT EXISTS `communitystore`
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE `communitystore`;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS `users` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `email` VARCHAR(255) NOT NULL UNIQUE,
    `password` VARCHAR(255) NOT NULL,
    `full_name` VARCHAR(255) NOT NULL,
    `role` VARCHAR(50) NOT NULL,
    `institution_or_business` VARCHAR(255),
    `verified` BOOLEAN DEFAULT FALSE,
    `verification_status` VARCHAR(50) DEFAULT 'PENDING',
    `verification_note` VARCHAR(500),
    `rating` DOUBLE DEFAULT 5.0,
    `total_ratings` INT DEFAULT 0,
    `profile_image` VARCHAR(500),
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Products Table
CREATE TABLE IF NOT EXISTS `products` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT,
    `price` DECIMAL(10,2) NOT NULL,
    `category` VARCHAR(50) NOT NULL,
    `condition_name` VARCHAR(100),
    `is_eco_friendly` BOOLEAN DEFAULT FALSE,
    `is_available` BOOLEAN DEFAULT TRUE,
    `image_url` VARCHAR(500),
    `location` VARCHAR(255),
    `seller_id` BIGINT NOT NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`seller_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
);

-- 3. Bulletin Posts Table
CREATE TABLE IF NOT EXISTS `bulletin_posts` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `title` VARCHAR(255) NOT NULL,
    `content` TEXT NOT NULL,
    `post_type` VARCHAR(50) DEFAULT 'ANNOUNCEMENT',
    `tags` VARCHAR(255),
    `author_id` BIGINT NOT NULL,
    `event_date` DATETIME,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
);

-- 4. Customer Orders Table
CREATE TABLE IF NOT EXISTS `orders` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `buyer_id` BIGINT NOT NULL,
    `total_amount` DECIMAL(10,2) NOT NULL,
    `status` VARCHAR(50) DEFAULT 'PENDING',
    `payment_method` VARCHAR(50) DEFAULT 'SNAPSCAN',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`buyer_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
);

-- 5. Order Items Table
CREATE TABLE IF NOT EXISTS `order_items` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `order_id` BIGINT NOT NULL,
    `product_id` BIGINT NOT NULL,
    `quantity` INT NOT NULL,
    `price` DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE
);

-- 6. Reviews Table
CREATE TABLE IF NOT EXISTS `reviews` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `reviewer_id` BIGINT NOT NULL,
    `target_user_id` BIGINT NOT NULL,
    `rating` INT NOT NULL,
    `comment` VARCHAR(1000),
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`reviewer_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`target_user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
);

-- Show confirmation message
SELECT 'Database schema communitystore initialized successfully with all tables!' AS Status;
