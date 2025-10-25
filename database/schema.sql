-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Oct 25, 2025 at 05:22 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `urban_skill_exchange`
--

-- --------------------------------------------------------

--
-- Table structure for table `availability`
--

CREATE TABLE `availability` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `day_of_week` enum('monday','tuesday','wednesday','thursday','friday','saturday','sunday') NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `is_available` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `availability`
--

INSERT INTO `availability` (`id`, `user_id`, `day_of_week`, `start_time`, `end_time`, `is_available`, `created_at`, `updated_at`) VALUES
(1, 7, 'monday', '09:00:00', '17:00:00', 1, '2025-10-25 07:08:18', '2025-10-25 07:08:18'),
(2, 7, 'tuesday', '09:00:00', '17:00:00', 1, '2025-10-25 07:08:18', '2025-10-25 07:08:18'),
(3, 7, 'wednesday', '09:00:00', '17:00:00', 1, '2025-10-25 07:08:18', '2025-10-25 07:08:18'),
(4, 7, 'thursday', '09:00:00', '17:00:00', 1, '2025-10-25 07:08:18', '2025-10-25 07:08:18'),
(5, 7, 'friday', '09:00:00', '17:00:00', 1, '2025-10-25 07:08:18', '2025-10-25 07:08:18');

-- --------------------------------------------------------

--
-- Table structure for table `bookings`
--

CREATE TABLE `bookings` (
  `id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `teacher_id` int(11) NOT NULL,
  `skill_id` int(11) NOT NULL,
  `booking_date` date NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `duration_hours` decimal(4,2) DEFAULT NULL,
  `total_price` decimal(10,2) DEFAULT NULL,
  `status` enum('pending','confirmed','completed','cancelled','rejected') DEFAULT 'pending',
  `notes` text DEFAULT NULL,
  `timezone` varchar(50) DEFAULT NULL,
  `is_recurring` tinyint(1) DEFAULT 0,
  `recurrence_pattern` enum('daily','weekly','monthly') DEFAULT NULL,
  `recurrence_end_date` date DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `bookings`
--

INSERT INTO `bookings` (`id`, `student_id`, `teacher_id`, `skill_id`, `booking_date`, `start_time`, `end_time`, `duration_hours`, `total_price`, `status`, `notes`, `timezone`, `is_recurring`, `recurrence_pattern`, `recurrence_end_date`, `created_at`, `updated_at`) VALUES
(1, 8, 7, 9, '2025-10-31', '10:00:00', '11:00:00', 1.00, 10.00, 'pending', 'hi', NULL, 0, NULL, NULL, '2025-10-25 07:54:16', '2025-10-25 07:54:16');

-- --------------------------------------------------------

--
-- Table structure for table `credit_transactions`
--

CREATE TABLE `credit_transactions` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `transaction_type` enum('earned','spent','bonus','refund') NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `reference_id` int(11) DEFAULT NULL,
  `reference_type` enum('booking','project','donation') DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `credit_transactions`
--

INSERT INTO `credit_transactions` (`id`, `user_id`, `amount`, `transaction_type`, `description`, `reference_id`, `reference_type`, `created_at`) VALUES
(1, 8, 100.00, 'bonus', 'Credit purchase', NULL, '', '2025-10-25 07:49:40'),
(2, 8, 20.00, 'bonus', 'Credit purchase', NULL, '', '2025-10-25 07:52:19'),
(3, 8, 10.00, 'spent', 'Booking payment', 1, 'booking', '2025-10-25 07:54:16'),
(4, 7, 10.00, 'earned', 'Booking earnings', 1, 'booking', '2025-10-25 07:54:16');

-- --------------------------------------------------------

--
-- Table structure for table `learning_paths`
--

CREATE TABLE `learning_paths` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `estimated_duration_weeks` int(11) DEFAULT NULL,
  `difficulty_level` enum('beginner','intermediate','advanced') DEFAULT 'beginner',
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `learning_path_steps`
--

CREATE TABLE `learning_path_steps` (
  `id` int(11) NOT NULL,
  `learning_path_id` int(11) NOT NULL,
  `step_order` int(11) NOT NULL,
  `skill_category_id` int(11) DEFAULT NULL,
  `skill_id` int(11) DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `estimated_hours` int(11) DEFAULT NULL,
  `is_completed` tinyint(1) DEFAULT 0,
  `completed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `messages`
--

CREATE TABLE `messages` (
  `id` int(11) NOT NULL,
  `sender_id` int(11) NOT NULL,
  `receiver_id` int(11) NOT NULL,
  `booking_id` int(11) DEFAULT NULL,
  `project_id` int(11) DEFAULT NULL,
  `message_text` text NOT NULL,
  `message_type` enum('text','image','file') DEFAULT 'text',
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text DEFAULT NULL,
  `notification_type` enum('booking','project','message','system') DEFAULT 'system',
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `projects`
--

CREATE TABLE `projects` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `creator_id` int(11) NOT NULL,
  `category` varchar(100) DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `latitude` decimal(10,8) DEFAULT NULL,
  `longitude` decimal(11,8) DEFAULT NULL,
  `max_participants` int(11) DEFAULT NULL,
  `current_participants` int(11) DEFAULT 0,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `status` enum('planning','active','completed','cancelled') DEFAULT 'planning',
  `project_type` enum('skill_sharing','community_service','educational','creative') DEFAULT 'skill_sharing',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `projects`
--

INSERT INTO `projects` (`id`, `title`, `description`, `creator_id`, `category`, `location`, `latitude`, `longitude`, `max_participants`, `current_participants`, `start_date`, `end_date`, `status`, `project_type`, `created_at`, `updated_at`) VALUES
(1, 'Community Garden Project', 'Creating a community vegetable garden in the neighborhood park', 1, 'community_service', 'Central Park, NY', 40.78290000, -73.96540000, 20, 1, NULL, NULL, 'planning', 'community_service', '2025-10-25 05:17:34', '2025-10-25 11:32:52'),
(2, 'Coding Workshop for Kids', 'Teaching basic programming to local children aged 10-14', 1, 'educational', 'Brooklyn Library', 40.67820000, -73.94420000, 15, 0, NULL, NULL, 'planning', 'educational', '2025-10-25 05:17:34', '2025-10-25 05:17:34'),
(3, 'Neighborhood Photography Club', 'Monthly photography sessions and exhibitions', 2, 'creative', 'Queens Arts Center', 40.72820000, -73.79490000, 12, 0, NULL, NULL, 'planning', 'creative', '2025-10-25 05:17:34', '2025-10-25 05:17:34'),
(4, 'Test Community Project', 'A test project for community building', 5, 'Community Service', NULL, NULL, NULL, NULL, 0, NULL, NULL, 'planning', 'community_service', '2025-10-25 09:06:28', '2025-10-25 09:06:28');

-- --------------------------------------------------------

--
-- Table structure for table `project_participants`
--

CREATE TABLE `project_participants` (
  `project_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `role` enum('creator','participant','mentor') DEFAULT 'participant',
  `joined_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `project_participants`
--

INSERT INTO `project_participants` (`project_id`, `user_id`, `role`, `joined_at`) VALUES
(1, 1, 'creator', '2025-10-25 05:17:34'),
(1, 2, 'participant', '2025-10-25 05:17:34'),
(1, 4, 'participant', '2025-10-25 05:17:34'),
(1, 8, 'participant', '2025-10-25 11:32:52'),
(2, 1, 'creator', '2025-10-25 05:17:34'),
(2, 3, 'mentor', '2025-10-25 05:17:34'),
(3, 1, 'participant', '2025-10-25 05:17:34'),
(3, 2, 'creator', '2025-10-25 05:17:34'),
(4, 5, 'creator', '2025-10-25 09:06:28');

-- --------------------------------------------------------

--
-- Table structure for table `provider_compatibility`
--

CREATE TABLE `provider_compatibility` (
  `id` int(11) NOT NULL,
  `learner_id` int(11) NOT NULL,
  `provider_id` int(11) NOT NULL,
  `compatibility_score` decimal(5,4) DEFAULT NULL,
  `factors` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`factors`)),
  `last_calculated` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `reviews`
--

CREATE TABLE `reviews` (
  `id` int(11) NOT NULL,
  `reviewer_id` int(11) NOT NULL,
  `reviewee_id` int(11) NOT NULL,
  `booking_id` int(11) DEFAULT NULL,
  `project_id` int(11) DEFAULT NULL,
  `rating` int(11) DEFAULT NULL CHECK (`rating` >= 1 and `rating` <= 5),
  `review_text` text DEFAULT NULL,
  `review_type` enum('skill_session','project_participation') NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `is_anonymous` tinyint(1) DEFAULT 0,
  `is_moderated` tinyint(1) DEFAULT 0,
  `moderation_status` enum('pending','approved','rejected') DEFAULT 'approved',
  `moderator_id` int(11) DEFAULT NULL,
  `response_text` text DEFAULT NULL,
  `response_created_at` timestamp NULL DEFAULT NULL,
  `helpful_votes` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `reviews`
--

INSERT INTO `reviews` (`id`, `reviewer_id`, `reviewee_id`, `booking_id`, `project_id`, `rating`, `review_text`, `review_type`, `created_at`, `is_anonymous`, `is_moderated`, `moderation_status`, `moderator_id`, `response_text`, `response_created_at`, `helpful_votes`) VALUES
(1, 2, 1, NULL, NULL, 5, 'Alice is an excellent teacher! Very patient and knowledgeable.', 'skill_session', '2025-10-25 05:17:34', 0, 0, 'approved', NULL, NULL, NULL, 0),
(2, 1, 2, NULL, NULL, 5, 'Bob captured amazing photos for our event. Highly recommended!', 'skill_session', '2025-10-25 05:17:34', 0, 0, 'approved', NULL, NULL, NULL, 0),
(3, 4, 3, NULL, NULL, 4, 'Carol helped me improve my Spanish conversation skills significantly.', 'skill_session', '2025-10-25 05:17:34', 0, 0, 'approved', NULL, NULL, NULL, 1),
(4, 3, 4, NULL, NULL, 5, 'David\'s yoga classes are transformative. Great instructor!', 'skill_session', '2025-10-25 05:17:34', 0, 0, 'approved', NULL, NULL, NULL, 0);

-- --------------------------------------------------------

--
-- Table structure for table `review_reports`
--

CREATE TABLE `review_reports` (
  `id` int(11) NOT NULL,
  `review_id` int(11) NOT NULL,
  `reporter_id` int(11) NOT NULL,
  `report_reason` enum('spam','inappropriate','fake','harassment','other') NOT NULL,
  `report_details` text DEFAULT NULL,
  `status` enum('pending','investigated','resolved') DEFAULT 'pending',
  `moderator_id` int(11) DEFAULT NULL,
  `resolution_notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `resolved_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `review_votes`
--

CREATE TABLE `review_votes` (
  `id` int(11) NOT NULL,
  `review_id` int(11) NOT NULL,
  `voter_id` int(11) NOT NULL,
  `vote_type` enum('helpful','not_helpful') NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `review_votes`
--

INSERT INTO `review_votes` (`id`, `review_id`, `voter_id`, `vote_type`, `created_at`) VALUES
(1, 3, 8, 'helpful', '2025-10-25 14:52:19');

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

CREATE TABLE `sessions` (
  `id` int(11) NOT NULL,
  `learner_id` int(11) NOT NULL,
  `provider_id` int(11) NOT NULL,
  `skill_id` int(11) NOT NULL,
  `scheduled_at` datetime NOT NULL,
  `duration_minutes` int(11) NOT NULL DEFAULT 60,
  `session_type` enum('one-on-one','group','workshop') DEFAULT 'one-on-one',
  `status` enum('scheduled','in-progress','completed','cancelled','no-show') DEFAULT 'scheduled',
  `notes` text DEFAULT NULL,
  `room_id` varchar(255) DEFAULT NULL,
  `recording_url` varchar(500) DEFAULT NULL,
  `started_at` datetime DEFAULT NULL,
  `ended_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `session_analytics`
--

CREATE TABLE `session_analytics` (
  `id` int(11) NOT NULL,
  `session_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `event_type` enum('joined','left','message_sent','file_shared','screen_shared','whiteboard_used') NOT NULL,
  `event_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`event_data`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `session_files`
--

CREATE TABLE `session_files` (
  `id` int(11) NOT NULL,
  `session_id` int(11) NOT NULL,
  `uploaded_by` int(11) NOT NULL,
  `filename` varchar(255) NOT NULL,
  `original_filename` varchar(255) NOT NULL,
  `file_path` varchar(500) NOT NULL,
  `file_size` int(11) NOT NULL,
  `file_type` varchar(100) NOT NULL,
  `uploaded_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `session_messages`
--

CREATE TABLE `session_messages` (
  `id` int(11) NOT NULL,
  `session_id` int(11) NOT NULL,
  `sender_id` int(11) NOT NULL,
  `message_type` enum('text','file','system') DEFAULT 'text',
  `message_content` text DEFAULT NULL,
  `file_url` varchar(500) DEFAULT NULL,
  `file_name` varchar(255) DEFAULT NULL,
  `file_size` int(11) DEFAULT NULL,
  `sent_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `session_participants`
--

CREATE TABLE `session_participants` (
  `id` int(11) NOT NULL,
  `session_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `role` enum('learner','provider','observer') DEFAULT 'learner',
  `joined_at` datetime DEFAULT NULL,
  `left_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `session_whiteboard_strokes`
--

CREATE TABLE `session_whiteboard_strokes` (
  `id` int(11) NOT NULL,
  `session_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `stroke_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`stroke_data`)),
  `stroke_type` enum('draw','erase','clear') DEFAULT 'draw',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `skills`
--

CREATE TABLE `skills` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `category` varchar(100) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `proficiency_level` enum('beginner','intermediate','advanced','expert') DEFAULT 'beginner',
  `is_available` tinyint(1) DEFAULT 1,
  `price_per_hour` decimal(10,2) DEFAULT NULL,
  `price_per_session` decimal(10,2) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `skills`
--

INSERT INTO `skills` (`id`, `user_id`, `name`, `category`, `description`, `proficiency_level`, `is_available`, `price_per_hour`, `price_per_session`, `created_at`, `updated_at`) VALUES
(1, 1, 'Web Development', 'Technology', 'Full-stack web development with React, Node.js, and databases', 'advanced', 1, 50.00, 150.00, '2025-10-25 05:17:34', '2025-10-25 05:17:34'),
(2, 1, 'JavaScript Programming', 'Technology', 'Modern JavaScript, ES6+, and frameworks', 'expert', 1, 45.00, 135.00, '2025-10-25 05:17:34', '2025-10-25 05:17:34'),
(3, 2, 'Photography', 'Arts & Crafts', 'Portrait and event photography with professional equipment', 'expert', 1, 75.00, 200.00, '2025-10-25 05:17:34', '2025-10-25 05:17:34'),
(4, 2, 'Graphic Design', 'Arts & Crafts', 'Logo design, branding, and digital graphics', 'advanced', 1, 40.00, 120.00, '2025-10-25 05:17:34', '2025-10-25 05:17:34'),
(5, 3, 'Spanish Language', 'Languages', 'Conversational Spanish for beginners and intermediate learners', 'advanced', 1, 25.00, 75.00, '2025-10-25 05:17:34', '2025-10-25 05:17:34'),
(6, 4, 'Yoga Instruction', 'Sports & Fitness', 'Hatha yoga classes for all levels', 'expert', 1, 35.00, 100.00, '2025-10-25 05:17:34', '2025-10-25 05:17:34'),
(7, 4, 'Meditation', 'Health & Wellness', 'Mindfulness and meditation techniques', 'intermediate', 1, 30.00, 80.00, '2025-10-25 05:17:34', '2025-10-25 05:17:34'),
(8, 6, 'Python Programming', 'Technology', 'Learn Python programming from basics to advanced', 'intermediate', 1, 40.00, 120.00, '2025-10-25 05:25:57', '2025-10-25 05:25:57'),
(9, 7, 'python', 'Education', 'introduction to python', 'beginner', 1, 10.00, 10.00, '2025-10-25 07:02:40', '2025-10-25 07:02:40');

-- --------------------------------------------------------

--
-- Table structure for table `skill_categories`
--

CREATE TABLE `skill_categories` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `skill_categories`
--

INSERT INTO `skill_categories` (`id`, `name`, `description`, `created_at`) VALUES
(1, 'Technology', 'Programming, web development, IT skills', '2025-10-25 05:17:30'),
(2, 'Languages', 'Foreign language tutoring and translation', '2025-10-25 05:17:30'),
(3, 'Arts & Crafts', 'Painting, music, crafting, design', '2025-10-25 05:17:30'),
(4, 'Sports & Fitness', 'Physical training, sports coaching', '2025-10-25 05:17:30'),
(5, 'Education', 'Academic tutoring, test preparation', '2025-10-25 05:17:30'),
(6, 'Music', 'Instrument lessons, music theory', '2025-10-25 05:17:30'),
(7, 'Cooking', 'Culinary skills, baking, nutrition', '2025-10-25 05:17:30'),
(8, 'Business', 'Entrepreneurship, marketing, finance', '2025-10-25 05:17:30'),
(9, 'Health & Wellness', 'Meditation, yoga, counseling', '2025-10-25 05:17:30'),
(10, 'Home & Garden', 'Gardening, home improvement, repairs', '2025-10-25 05:17:30'),
(11, 'Other', 'Miscellaneous skills and expertise', '2025-10-25 05:17:30');

-- --------------------------------------------------------

--
-- Table structure for table `skill_endorsements`
--

CREATE TABLE `skill_endorsements` (
  `id` int(11) NOT NULL,
  `endorser_id` int(11) NOT NULL,
  `endorsee_id` int(11) NOT NULL,
  `skill_id` int(11) NOT NULL,
  `endorsement_text` text DEFAULT NULL,
  `is_public` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `skill_relationships`
--

CREATE TABLE `skill_relationships` (
  `id` int(11) NOT NULL,
  `skill_id` int(11) NOT NULL,
  `related_skill_id` int(11) NOT NULL,
  `relationship_type` enum('prerequisite','complementary','advanced','alternative') DEFAULT 'complementary',
  `strength` decimal(3,2) DEFAULT 0.50,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `skill_trends`
--

CREATE TABLE `skill_trends` (
  `id` int(11) NOT NULL,
  `skill_category_id` int(11) DEFAULT NULL,
  `trend_score` decimal(5,4) DEFAULT NULL,
  `search_count` int(11) DEFAULT 0,
  `booking_count` int(11) DEFAULT 0,
  `period_start` date NOT NULL,
  `period_end` date NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `latitude` decimal(10,8) DEFAULT NULL,
  `longitude` decimal(11,8) DEFAULT NULL,
  `bio` text DEFAULT NULL,
  `profile_image` varchar(500) DEFAULT NULL,
  `is_verified` tinyint(1) DEFAULT 0,
  `email_verified` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `learning_style` enum('visual','auditory','kinesthetic','reading_writing') DEFAULT NULL,
  `preferred_session_duration` enum('30min','1hour','2hours','flexible') DEFAULT 'flexible',
  `preferred_session_frequency` enum('once','weekly','biweekly','monthly') DEFAULT 'once',
  `skill_goals` text DEFAULT NULL,
  `experience_level` enum('beginner','intermediate','advanced') DEFAULT 'beginner',
  `availability_preferences` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`availability_preferences`)),
  `budget_range_min` decimal(10,2) DEFAULT 0.00,
  `budget_range_max` decimal(10,2) DEFAULT 100.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password_hash`, `phone`, `location`, `latitude`, `longitude`, `bio`, `profile_image`, `is_verified`, `email_verified`, `created_at`, `updated_at`, `learning_style`, `preferred_session_duration`, `preferred_session_frequency`, `skill_goals`, `experience_level`, `availability_preferences`, `budget_range_min`, `budget_range_max`) VALUES
(1, 'Alice Johnson', 'alice@example.com', '.cchHt4Wi.CVYO.CoiH6YEluOV8XJ5Dz0Ik/W8f6ivnKe', '+1234567890', 'New York, NY', 40.71280000, -74.00600000, 'Experienced web developer passionate about teaching coding to beginners.', NULL, 1, 0, '2025-10-25 05:17:34', '2025-10-25 08:07:19', NULL, 'flexible', 'once', NULL, 'beginner', NULL, 0.00, 100.00),
(2, 'Bob Smith', 'bob@example.com', '.cchHt4Wi.CVYO.CoiH6YEluOV8XJ5Dz0Ik/W8f6ivnKe', '+1234567891', 'Brooklyn, NY', 40.67820000, -73.94420000, 'Professional photographer and graphic designer.', NULL, 1, 0, '2025-10-25 05:17:34', '2025-10-25 08:07:19', NULL, 'flexible', 'once', NULL, 'beginner', NULL, 0.00, 100.00),
(3, 'Carol Davis', 'carol@example.com', '.cchHt4Wi.CVYO.CoiH6YEluOV8XJ5Dz0Ik/W8f6ivnKe', '+1234567892', 'Queens, NY', 40.72820000, -73.79490000, 'Native Spanish speaker offering language lessons.', NULL, 0, 0, '2025-10-25 05:17:34', '2025-10-25 08:07:19', NULL, 'flexible', 'once', NULL, 'beginner', NULL, 0.00, 100.00),
(4, 'David Wilson', 'david@example.com', '.cchHt4Wi.CVYO.CoiH6YEluOV8XJ5Dz0Ik/W8f6ivnKe', '+1234567893', 'Manhattan, NY', 40.78310000, -73.97120000, 'Fitness trainer specializing in yoga and meditation.', NULL, 1, 0, '2025-10-25 05:17:34', '2025-10-25 08:07:19', NULL, 'flexible', 'once', NULL, 'beginner', NULL, 0.00, 100.00),
(5, 'Test User', 'test@example.com', '.cchHt4Wi.CVYO.CoiH6YEluOV8XJ5Dz0Ik/W8f6ivnKe', NULL, 'Test City', NULL, NULL, NULL, NULL, 0, 0, '2025-10-25 05:19:55', '2025-10-25 08:07:19', NULL, 'flexible', 'once', NULL, 'beginner', NULL, 0.00, 100.00),
(6, 'Test User', 'testuser@example.com', '.cchHt4Wi.CVYO.CoiH6YEluOV8XJ5Dz0Ik/W8f6ivnKe', NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, '2025-10-25 05:25:45', '2025-10-25 08:07:19', NULL, 'flexible', 'once', NULL, 'beginner', NULL, 0.00, 100.00),
(7, 'A P devendran', 'deva@example.com', '.cchHt4Wi.CVYO.CoiH6YEluOV8XJ5Dz0Ik/W8f6ivnKe', '7904193427', 'chennai', NULL, NULL, 'hi', NULL, 0, 0, '2025-10-25 07:01:44', '2025-10-25 08:07:19', NULL, 'flexible', 'once', NULL, 'beginner', NULL, 0.00, 100.00),
(8, 'S Vikas', 'vikassamvel123@gmail.com', '', '9790801678', 'chennai', NULL, NULL, 'hi', NULL, 0, 0, '2025-10-25 07:28:36', '2025-10-25 14:56:27', NULL, 'flexible', 'once', NULL, 'beginner', NULL, 0.00, 100.00);

-- --------------------------------------------------------

--
-- Table structure for table `user_assessments`
--

CREATE TABLE `user_assessments` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `assessment_type` enum('learning_style','skill_interests','goals') DEFAULT 'learning_style',
  `responses` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`responses`)),
  `results` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`results`)),
  `completed_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user_badges`
--

CREATE TABLE `user_badges` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `badge_type` enum('bronze','silver','gold','platinum','special') NOT NULL,
  `badge_name` varchar(100) NOT NULL,
  `badge_description` text DEFAULT NULL,
  `icon_url` varchar(500) DEFAULT NULL,
  `earned_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user_credits`
--

CREATE TABLE `user_credits` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `balance` decimal(10,2) DEFAULT 0.00,
  `total_earned` decimal(10,2) DEFAULT 0.00,
  `total_spent` decimal(10,2) DEFAULT 0.00,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user_credits`
--

INSERT INTO `user_credits` (`id`, `user_id`, `balance`, `total_earned`, `total_spent`, `created_at`, `updated_at`) VALUES
(1, 1, 150.00, 300.00, 0.00, '2025-10-25 05:17:34', '2025-10-25 05:17:34'),
(2, 2, 200.00, 400.00, 0.00, '2025-10-25 05:17:34', '2025-10-25 05:17:34'),
(3, 3, 50.00, 100.00, 0.00, '2025-10-25 05:17:34', '2025-10-25 05:17:34'),
(4, 4, 75.00, 150.00, 0.00, '2025-10-25 05:17:34', '2025-10-25 05:17:34'),
(5, 7, 110.00, 200.00, 0.00, '2025-10-25 07:16:02', '2025-10-25 07:54:16'),
(6, 5, 100.00, 200.00, 0.00, '2025-10-25 07:18:16', '2025-10-25 07:18:16'),
(7, 6, 100.00, 200.00, 0.00, '2025-10-25 07:18:16', '2025-10-25 07:18:16'),
(8, 8, 310.00, 300.00, 11.00, '2025-10-25 07:31:03', '2025-10-25 07:54:16');

-- --------------------------------------------------------

--
-- Table structure for table `user_reputation_metrics`
--

CREATE TABLE `user_reputation_metrics` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `metric_date` date NOT NULL,
  `trust_score` decimal(3,2) DEFAULT NULL,
  `total_ratings` int(11) DEFAULT 0,
  `average_rating` decimal(3,2) DEFAULT NULL,
  `completion_rate` decimal(5,2) DEFAULT NULL,
  `response_rate` decimal(5,2) DEFAULT NULL,
  `total_endorsements` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user_skill_categories`
--

CREATE TABLE `user_skill_categories` (
  `user_id` int(11) NOT NULL,
  `skill_category_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user_skill_interests`
--

CREATE TABLE `user_skill_interests` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `skill_category_id` int(11) DEFAULT NULL,
  `interest_level` enum('low','medium','high') DEFAULT 'medium',
  `current_proficiency` enum('none','beginner','intermediate','advanced','expert') DEFAULT 'none',
  `target_proficiency` enum('beginner','intermediate','advanced','expert') DEFAULT 'intermediate',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user_skill_interests`
--

INSERT INTO `user_skill_interests` (`id`, `user_id`, `skill_category_id`, `interest_level`, `current_proficiency`, `target_proficiency`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 'high', 'beginner', 'intermediate', '2025-10-25 14:48:51', '2025-10-25 14:48:51'),
(2, 1, 2, 'medium', 'none', 'beginner', '2025-10-25 14:48:51', '2025-10-25 14:48:51');

-- --------------------------------------------------------

--
-- Table structure for table `user_trust_scores`
--

CREATE TABLE `user_trust_scores` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `overall_score` decimal(3,2) DEFAULT 0.00,
  `rating_count` int(11) DEFAULT 0,
  `average_rating` decimal(3,2) DEFAULT 0.00,
  `completion_rate` decimal(5,2) DEFAULT 0.00,
  `response_time_minutes` int(11) DEFAULT 0,
  `total_sessions` int(11) DEFAULT 0,
  `successful_sessions` int(11) DEFAULT 0,
  `last_calculated` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user_trust_scores`
--

INSERT INTO `user_trust_scores` (`id`, `user_id`, `overall_score`, `rating_count`, `average_rating`, `completion_rate`, `response_time_minutes`, `total_sessions`, `successful_sessions`, `last_calculated`) VALUES
(1, 5, 3.00, 0, 0.00, 0.00, 60, 0, 0, '2025-10-25 14:24:41'),
(2, 6, 3.00, 0, 0.00, 0.00, 60, 0, 0, '2025-10-25 14:24:41'),
(3, 7, 3.00, 0, 0.00, 0.00, 60, 0, 0, '2025-10-25 14:24:41'),
(4, 8, 3.00, 0, 0.00, 0.00, 60, 0, 0, '2025-10-25 14:24:41'),
(5, 2, 3.00, 0, 0.00, 0.00, 60, 0, 0, '2025-10-25 14:24:41'),
(6, 1, 3.00, 0, 0.00, 0.00, 60, 0, 0, '2025-10-25 14:24:41'),
(7, 3, 3.00, 0, 0.00, 0.00, 60, 0, 0, '2025-10-25 14:24:41'),
(8, 4, 3.00, 0, 0.00, 0.00, 60, 0, 0, '2025-10-25 14:24:41');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `availability`
--
ALTER TABLE `availability`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_slot` (`user_id`,`day_of_week`,`start_time`,`end_time`);

--
-- Indexes for table `bookings`
--
ALTER TABLE `bookings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `skill_id` (`skill_id`),
  ADD KEY `idx_bookings_student` (`student_id`),
  ADD KEY `idx_bookings_teacher` (`teacher_id`),
  ADD KEY `idx_bookings_date` (`booking_date`);

--
-- Indexes for table `credit_transactions`
--
ALTER TABLE `credit_transactions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `learning_paths`
--
ALTER TABLE `learning_paths`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_learning_paths_user` (`user_id`);

--
-- Indexes for table `learning_path_steps`
--
ALTER TABLE `learning_path_steps`
  ADD PRIMARY KEY (`id`),
  ADD KEY `learning_path_id` (`learning_path_id`),
  ADD KEY `skill_category_id` (`skill_category_id`),
  ADD KEY `skill_id` (`skill_id`);

--
-- Indexes for table `messages`
--
ALTER TABLE `messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `booking_id` (`booking_id`),
  ADD KEY `project_id` (`project_id`),
  ADD KEY `idx_messages_sender` (`sender_id`),
  ADD KEY `idx_messages_receiver` (`receiver_id`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `projects`
--
ALTER TABLE `projects`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_projects_creator` (`creator_id`),
  ADD KEY `idx_projects_location` (`latitude`,`longitude`);

--
-- Indexes for table `project_participants`
--
ALTER TABLE `project_participants`
  ADD PRIMARY KEY (`project_id`,`user_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `provider_compatibility`
--
ALTER TABLE `provider_compatibility`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_compatibility` (`learner_id`,`provider_id`),
  ADD KEY `provider_id` (`provider_id`),
  ADD KEY `idx_provider_compatibility_learner` (`learner_id`),
  ADD KEY `idx_provider_compatibility_score` (`compatibility_score`);

--
-- Indexes for table `reviews`
--
ALTER TABLE `reviews`
  ADD PRIMARY KEY (`id`),
  ADD KEY `reviewer_id` (`reviewer_id`),
  ADD KEY `idx_reviews_reviewee` (`reviewee_id`),
  ADD KEY `moderator_id` (`moderator_id`),
  ADD KEY `idx_reviews_booking` (`booking_id`),
  ADD KEY `idx_reviews_project` (`project_id`),
  ADD KEY `idx_reviews_moderation` (`moderation_status`);

--
-- Indexes for table `review_reports`
--
ALTER TABLE `review_reports`
  ADD PRIMARY KEY (`id`),
  ADD KEY `review_id` (`review_id`),
  ADD KEY `reporter_id` (`reporter_id`),
  ADD KEY `moderator_id` (`moderator_id`),
  ADD KEY `idx_review_reports_status` (`status`);

--
-- Indexes for table `review_votes`
--
ALTER TABLE `review_votes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_vote` (`review_id`,`voter_id`),
  ADD KEY `voter_id` (`voter_id`),
  ADD KEY `idx_review_votes_review` (`review_id`);

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `room_id` (`room_id`),
  ADD KEY `idx_learner` (`learner_id`),
  ADD KEY `idx_provider` (`provider_id`),
  ADD KEY `idx_skill` (`skill_id`),
  ADD KEY `idx_scheduled` (`scheduled_at`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_room` (`room_id`);

--
-- Indexes for table `session_analytics`
--
ALTER TABLE `session_analytics`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_session` (`session_id`),
  ADD KEY `idx_user` (`user_id`),
  ADD KEY `idx_event` (`event_type`);

--
-- Indexes for table `session_files`
--
ALTER TABLE `session_files`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_session` (`session_id`),
  ADD KEY `idx_uploader` (`uploaded_by`),
  ADD KEY `idx_uploaded` (`uploaded_at`);

--
-- Indexes for table `session_messages`
--
ALTER TABLE `session_messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_session` (`session_id`),
  ADD KEY `idx_sender` (`sender_id`),
  ADD KEY `idx_sent` (`sent_at`);

--
-- Indexes for table `session_participants`
--
ALTER TABLE `session_participants`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_participant` (`session_id`,`user_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `session_whiteboard_strokes`
--
ALTER TABLE `session_whiteboard_strokes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_session` (`session_id`),
  ADD KEY `idx_user` (`user_id`);

--
-- Indexes for table `skills`
--
ALTER TABLE `skills`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_skills_user` (`user_id`),
  ADD KEY `idx_skills_category` (`category`);

--
-- Indexes for table `skill_categories`
--
ALTER TABLE `skill_categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `skill_endorsements`
--
ALTER TABLE `skill_endorsements`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_endorsement` (`endorser_id`,`endorsee_id`,`skill_id`),
  ADD KEY `idx_endorsements_endorsee` (`endorsee_id`),
  ADD KEY `idx_endorsements_skill` (`skill_id`);

--
-- Indexes for table `skill_relationships`
--
ALTER TABLE `skill_relationships`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_relationship` (`skill_id`,`related_skill_id`,`relationship_type`),
  ADD KEY `idx_skill_relationships_skill` (`skill_id`),
  ADD KEY `idx_skill_relationships_related` (`related_skill_id`);

--
-- Indexes for table `skill_trends`
--
ALTER TABLE `skill_trends`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_trend` (`skill_category_id`,`period_start`,`period_end`),
  ADD KEY `idx_skill_trends_category` (`skill_category_id`),
  ADD KEY `idx_skill_trends_period` (`period_start`,`period_end`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_users_email` (`email`),
  ADD KEY `idx_users_location` (`latitude`,`longitude`);

--
-- Indexes for table `user_assessments`
--
ALTER TABLE `user_assessments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `user_badges`
--
ALTER TABLE `user_badges`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_badges_user` (`user_id`),
  ADD KEY `idx_badges_type` (`badge_type`);

--
-- Indexes for table `user_credits`
--
ALTER TABLE `user_credits`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_id` (`user_id`);

--
-- Indexes for table `user_reputation_metrics`
--
ALTER TABLE `user_reputation_metrics`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_metric` (`user_id`,`metric_date`),
  ADD KEY `idx_reputation_metrics_date` (`metric_date`);

--
-- Indexes for table `user_skill_categories`
--
ALTER TABLE `user_skill_categories`
  ADD PRIMARY KEY (`user_id`,`skill_category_id`),
  ADD KEY `skill_category_id` (`skill_category_id`);

--
-- Indexes for table `user_skill_interests`
--
ALTER TABLE `user_skill_interests`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_skill` (`user_id`,`skill_category_id`),
  ADD KEY `skill_category_id` (`skill_category_id`),
  ADD KEY `idx_user_skill_interests_user` (`user_id`);

--
-- Indexes for table `user_trust_scores`
--
ALTER TABLE `user_trust_scores`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_id` (`user_id`),
  ADD KEY `idx_trust_scores_score` (`overall_score`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `availability`
--
ALTER TABLE `availability`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `bookings`
--
ALTER TABLE `bookings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `credit_transactions`
--
ALTER TABLE `credit_transactions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `learning_paths`
--
ALTER TABLE `learning_paths`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `learning_path_steps`
--
ALTER TABLE `learning_path_steps`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `messages`
--
ALTER TABLE `messages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `projects`
--
ALTER TABLE `projects`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `provider_compatibility`
--
ALTER TABLE `provider_compatibility`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `reviews`
--
ALTER TABLE `reviews`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `review_reports`
--
ALTER TABLE `review_reports`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `review_votes`
--
ALTER TABLE `review_votes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `sessions`
--
ALTER TABLE `sessions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `session_analytics`
--
ALTER TABLE `session_analytics`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `session_files`
--
ALTER TABLE `session_files`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `session_messages`
--
ALTER TABLE `session_messages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `session_participants`
--
ALTER TABLE `session_participants`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `session_whiteboard_strokes`
--
ALTER TABLE `session_whiteboard_strokes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `skills`
--
ALTER TABLE `skills`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `skill_categories`
--
ALTER TABLE `skill_categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `skill_endorsements`
--
ALTER TABLE `skill_endorsements`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `skill_relationships`
--
ALTER TABLE `skill_relationships`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `skill_trends`
--
ALTER TABLE `skill_trends`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `user_assessments`
--
ALTER TABLE `user_assessments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `user_badges`
--
ALTER TABLE `user_badges`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `user_credits`
--
ALTER TABLE `user_credits`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `user_reputation_metrics`
--
ALTER TABLE `user_reputation_metrics`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `user_skill_interests`
--
ALTER TABLE `user_skill_interests`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `user_trust_scores`
--
ALTER TABLE `user_trust_scores`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `availability`
--
ALTER TABLE `availability`
  ADD CONSTRAINT `availability_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `bookings`
--
ALTER TABLE `bookings`
  ADD CONSTRAINT `bookings_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `bookings_ibfk_2` FOREIGN KEY (`teacher_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `bookings_ibfk_3` FOREIGN KEY (`skill_id`) REFERENCES `skills` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `credit_transactions`
--
ALTER TABLE `credit_transactions`
  ADD CONSTRAINT `credit_transactions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `learning_paths`
--
ALTER TABLE `learning_paths`
  ADD CONSTRAINT `learning_paths_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `learning_path_steps`
--
ALTER TABLE `learning_path_steps`
  ADD CONSTRAINT `learning_path_steps_ibfk_1` FOREIGN KEY (`learning_path_id`) REFERENCES `learning_paths` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `learning_path_steps_ibfk_2` FOREIGN KEY (`skill_category_id`) REFERENCES `skill_categories` (`id`),
  ADD CONSTRAINT `learning_path_steps_ibfk_3` FOREIGN KEY (`skill_id`) REFERENCES `skills` (`id`);

--
-- Constraints for table `messages`
--
ALTER TABLE `messages`
  ADD CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `messages_ibfk_2` FOREIGN KEY (`receiver_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `messages_ibfk_3` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `messages_ibfk_4` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `projects`
--
ALTER TABLE `projects`
  ADD CONSTRAINT `projects_ibfk_1` FOREIGN KEY (`creator_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `project_participants`
--
ALTER TABLE `project_participants`
  ADD CONSTRAINT `project_participants_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `project_participants_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `provider_compatibility`
--
ALTER TABLE `provider_compatibility`
  ADD CONSTRAINT `provider_compatibility_ibfk_1` FOREIGN KEY (`learner_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `provider_compatibility_ibfk_2` FOREIGN KEY (`provider_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `reviews`
--
ALTER TABLE `reviews`
  ADD CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`reviewer_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `reviews_ibfk_2` FOREIGN KEY (`reviewee_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `reviews_ibfk_3` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `reviews_ibfk_4` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `reviews_ibfk_5` FOREIGN KEY (`moderator_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `review_reports`
--
ALTER TABLE `review_reports`
  ADD CONSTRAINT `review_reports_ibfk_1` FOREIGN KEY (`review_id`) REFERENCES `reviews` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `review_reports_ibfk_2` FOREIGN KEY (`reporter_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `review_reports_ibfk_3` FOREIGN KEY (`moderator_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `review_votes`
--
ALTER TABLE `review_votes`
  ADD CONSTRAINT `review_votes_ibfk_1` FOREIGN KEY (`review_id`) REFERENCES `reviews` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `review_votes_ibfk_2` FOREIGN KEY (`voter_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `sessions`
--
ALTER TABLE `sessions`
  ADD CONSTRAINT `sessions_ibfk_1` FOREIGN KEY (`learner_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `sessions_ibfk_2` FOREIGN KEY (`provider_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `sessions_ibfk_3` FOREIGN KEY (`skill_id`) REFERENCES `skills` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `session_analytics`
--
ALTER TABLE `session_analytics`
  ADD CONSTRAINT `session_analytics_ibfk_1` FOREIGN KEY (`session_id`) REFERENCES `sessions` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `session_analytics_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `session_files`
--
ALTER TABLE `session_files`
  ADD CONSTRAINT `session_files_ibfk_1` FOREIGN KEY (`session_id`) REFERENCES `sessions` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `session_files_ibfk_2` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `session_messages`
--
ALTER TABLE `session_messages`
  ADD CONSTRAINT `session_messages_ibfk_1` FOREIGN KEY (`session_id`) REFERENCES `sessions` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `session_messages_ibfk_2` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `session_participants`
--
ALTER TABLE `session_participants`
  ADD CONSTRAINT `session_participants_ibfk_1` FOREIGN KEY (`session_id`) REFERENCES `sessions` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `session_participants_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `session_whiteboard_strokes`
--
ALTER TABLE `session_whiteboard_strokes`
  ADD CONSTRAINT `session_whiteboard_strokes_ibfk_1` FOREIGN KEY (`session_id`) REFERENCES `sessions` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `session_whiteboard_strokes_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `skills`
--
ALTER TABLE `skills`
  ADD CONSTRAINT `skills_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `skill_endorsements`
--
ALTER TABLE `skill_endorsements`
  ADD CONSTRAINT `skill_endorsements_ibfk_1` FOREIGN KEY (`endorser_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `skill_endorsements_ibfk_2` FOREIGN KEY (`endorsee_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `skill_endorsements_ibfk_3` FOREIGN KEY (`skill_id`) REFERENCES `skills` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `skill_relationships`
--
ALTER TABLE `skill_relationships`
  ADD CONSTRAINT `skill_relationships_ibfk_1` FOREIGN KEY (`skill_id`) REFERENCES `skills` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `skill_relationships_ibfk_2` FOREIGN KEY (`related_skill_id`) REFERENCES `skills` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `skill_trends`
--
ALTER TABLE `skill_trends`
  ADD CONSTRAINT `skill_trends_ibfk_1` FOREIGN KEY (`skill_category_id`) REFERENCES `skill_categories` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `user_assessments`
--
ALTER TABLE `user_assessments`
  ADD CONSTRAINT `user_assessments_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `user_badges`
--
ALTER TABLE `user_badges`
  ADD CONSTRAINT `user_badges_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `user_credits`
--
ALTER TABLE `user_credits`
  ADD CONSTRAINT `user_credits_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `user_reputation_metrics`
--
ALTER TABLE `user_reputation_metrics`
  ADD CONSTRAINT `user_reputation_metrics_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `user_skill_categories`
--
ALTER TABLE `user_skill_categories`
  ADD CONSTRAINT `user_skill_categories_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `user_skill_categories_ibfk_2` FOREIGN KEY (`skill_category_id`) REFERENCES `skill_categories` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `user_skill_interests`
--
ALTER TABLE `user_skill_interests`
  ADD CONSTRAINT `user_skill_interests_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `user_skill_interests_ibfk_2` FOREIGN KEY (`skill_category_id`) REFERENCES `skill_categories` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `user_trust_scores`
--
ALTER TABLE `user_trust_scores`
  ADD CONSTRAINT `user_trust_scores_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
