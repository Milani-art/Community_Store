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
);-- 7. Seed Data / Mock State (CPUT Bulletin Board)
-- Insert Users (Sellers and Organizers)
INSERT IGNORE INTO `users` (`id`, `email`, `password`, `full_name`, `role`, `institution_or_business`, `verified`, `verification_status`) VALUES 
(1, 'admin@cput.ac.za', 'password123', 'CPUT Admin', 'ADMIN', 'Cape Peninsula University of Technology', TRUE, 'APPROVED'),
(2, 'thabo.m@mycput.ac.za', 'password123', 'Thabo M.', 'USER', 'CPUT - Civil Engineering 2nd Year', TRUE, 'APPROVED'),
(3, 'ayesha.k@mycput.ac.za', 'password123', 'Ayesha K.', 'USER', 'CPUT - Hotel Management Alum', TRUE, 'APPROVED'),
(4, 'liam.d@mycput.ac.za', 'password123', 'Liam D.', 'USER', 'CPUT Student', TRUE, 'APPROVED'),
(5, 'naledi.p@mycput.ac.za', 'password123', 'Naledi P.', 'USER', 'CPUT Student', TRUE, 'APPROVED');

-- Insert Bulletin Posts (Events & Announcements)
INSERT IGNORE INTO `bulletin_posts` (`id`, `title`, `content`, `post_type`, `tags`, `author_id`, `event_date`) VALUES 
(1, 'CPUT Annual Work-Integrated Learning & Career Fair', 'Over 35 corporate, tech, engineering, and finance recruiters on campus. Ideal for 2nd, 3rd year, and Advanced Diploma students seeking in-service training, internships, and graduate programmes. Bring updated CVs and student card.\n\nType: Career & Networking\nCampus: Bellville Campus\nVenue: Major Sports Hall, Symphony Way\nTime: 09:00 - 15:30\nOrganizer: Centre for Community Engagement & Work-Integrated Learning (WIL)\nContact: careers@cput.ac.za', 'EVENT', 'careers, WIL, internships, networking, engineering, business', 1, '2026-08-14 09:00:00'),
(2, 'CPUT SRC Spring Market Day & Buskers Showcase', 'Student entrepreneurs selling food, vintage thrifts, custom prints, handmade jewellery, and beauty products. Features live lunchtime performances by the CPUT Performing Arts Society.\n\nType: Student Life & Enterprise\nCampus: District Six Campus\nVenue: Student Centre Piazza & Admin Quad, Hanover Street\nTime: 10:00 - 15:00\nOrganizer: Department of Student Affairs (DSA) & Central SRC\nContact: dsa@cput.ac.za', 'EVENT', 'market-day, student-business, food, music, campus-life', 1, '2026-09-18 10:00:00'),
(3, 'Faculty of Informatics and Design (FID) Graduate Showcase', 'End-of-year public exhibition showcasing final-year capstones in Architecture, Interior Design, Graphic Communication, Multimedia, and IT software prototypes. Industry judges and scouts attending.\n\nType: Exhibition & Academic\nCampus: District Six Campus\nVenue: Design Building (FID Atrium)\nTime: 11:00 - 18:00\nOrganizer: Faculty of Informatics and Design\nContact: fid-events@cput.ac.za', 'EVENT', 'design, informatics, showcase, architecture, coding', 1, '2026-11-20 11:00:00'),
(4, 'Varsity Shield Clash: CPUT Tekkies vs. UFH Blues', 'Support the boys in blue and gold for the home leg fixture. Free entry with valid CPUT student card. Food trucks and DJ booth opening at 17:30.\n\nType: Sports\nCampus: Bellville Campus\nVenue: CPUT Bellville Stadium\nTime: 19:00 kickoff\nOrganizer: CPUT Sport, Arts & Culture\nContact: sports@cput.ac.za', 'EVENT', 'rugby, varsity-shield, sports, tekkies', 1, '2026-03-23 19:00:00'),
(5, 'CPUT Institutional Open Day 2026', 'Showcasing course offerings across all 6 faculties: Applied Sciences, Business & Management Sciences, Education, Engineering & the Built Environment, Health & Wellness, and FID.\n\nType: Open Day\nCampus: Bellville Campus & District Six Campus\nVenue: Major Sports Hall (Bellville) & Multipurpose Hall (D6)\nTime: 09:00 - 16:00\nOrganizer: CPUT Marketing & Communication\nContact: info@cput.ac.za', 'EVENT', 'open-day, faculties, academics', 1, '2026-05-09 09:00:00'),
(6, 'Inter-Campus Shuttle Service Schedule Update (Bellville <-> D6)', 'Peak hour departure intervals have been adjusted to every 20 minutes between Bellville and District Six. Please tap your student card when boarding. Capacity is strictly seated.\n\nType: Campus Operations\nCampus: All Campuses\nVenue: Bus Terminals (Bellville North Gate / D6 Bus Shed)\nTime: Daily (06:30 - 21:00)\nOrganizer: CPUT Transport Department\nContact: transport@cput.ac.za', 'ANNOUNCEMENT', 'shuttle, transport, logistics', 1, '2026-10-01 06:30:00'),
(7, 'District Six & Bellville 24/7 Study Labs Extended Hours for Exams', 'Library study hubs will remain open 24/7 for semester 2 final exams. Security guards on duty and night shuttle drop-offs available for nearby accredited residences.\n\nType: Academic Services\nCampus: District Six & Bellville\nVenue: Library Complex Study Rooms\nTime: 24 Hours (Access Control via Biometrics)\nOrganizer: CPUT Libraries\nContact: library@cput.ac.za', 'ANNOUNCEMENT', 'library, study, exams, 24-7', 1, '2026-10-15 00:00:00');

-- Insert Products (Marketplace Listings)
INSERT IGNORE INTO `products` (`id`, `title`, `description`, `price`, `category`, `condition_name`, `is_eco_friendly`, `is_available`, `location`, `seller_id`) VALUES 
(1, 'Engineering Maths 1 & Mechanics Textbook + Casio fx-991ZA Plus', 'Hardly used Advanced Engineering Mathematics 8th Ed + Casio scientific calculator approved for CPUT exam venues. No highlighted pages.\n\nContact: chat-dm / 071-xxx-xxxx', 450.00, 'Textbooks & Equipment', 'Used - Good', FALSE, TRUE, 'Bellville Campus - Meet at Student Centre or Engineering Cafe', 2),
(2, 'Hospitality / Chef Knife Set & Uniform (Granger Bay Campus)', 'Complete Wüsthof student starter knife roll with whetstone plus size M chef whites and safety clogs. Clean and compliant with Hotel School kitchen inspection standards.\n\nContact: chat-dm', 850.00, 'Academic Gear', 'Used - Good', FALSE, TRUE, 'Granger Bay Campus - Granger Bay Hotel School foyer', 3),
(3, 'Single Room Sublet in Accredited Res near D6 (Hanover Street)', 'Furnished single room with desk, high-speed Wi-Fi, biometric entry, backup solar power for loadshedding, and communal kitchen. Looking for clean male/female student.\n\nContact: chat-dm', 4200.00, 'Student Housing', 'N/A', FALSE, TRUE, 'District Six Campus - Buitenkant / Constitution St area (5 min walk to campus)', 4),
(4, 'LOST: Black Targus Laptop Bag with Student Card inside FID Lab 2.4', 'Left behind during Wednesday afternoon Maya tutorial. Contains external hard drive with major project files and CPUT student ID card. Please return to D6 security desk or DM me.\n\nContact: chat-dm', 0.00, 'Lost & Found', 'N/A', FALSE, TRUE, 'District Six Campus - Design Building 2nd Floor', 5);

-- Show confirmation message
SELECT 'Database schema communitystore initialized successfully with all tables and mock data!' AS Status;
