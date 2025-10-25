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
SET NAMES utf8mb4;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

--
-- Database: `urban_skill_exchange`
--

-- --------------------------------------------------------

--
-- Table structure for table `forum_topics`
--

CREATE TABLE `forum_topics` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `author_id` int(11) NOT NULL,
  `category` enum('general','skills','projects','help','announcements') DEFAULT 'general',
  `is_pinned` tinyint(1) DEFAULT 0,
  `is_locked` tinyint(1) DEFAULT 0,
  `view_count` int(11) DEFAULT 0,
  `reply_count` int(11) DEFAULT 0,
  `last_reply_at` timestamp NULL DEFAULT NULL,
  `last_reply_user_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `forum_topics`
--

INSERT INTO `forum_topics` (`id`, `title`, `content`, `author_id`, `category`, `is_pinned`, `is_locked`, `view_count`, `reply_count`, `last_reply_at`, `last_reply_user_id`, `created_at`, `updated_at`) VALUES
(1, 'Welcome to SkillNexus Community Forum', 'Welcome to our community discussion forum! This is a place where you can connect with other skill enthusiasts, share your experiences, ask questions, and collaborate on projects. Feel free to introduce yourself and start discussions about skills, learning, and community projects.', 1, 'announcements', 1, 0, 25, 3, '2025-10-25 08:30:00', 2, '2025-10-25 08:00:00', '2025-10-25 08:30:00'),
(2, 'Best practices for online skill sharing sessions', 'I\'ve been doing some online tutoring sessions and wanted to share some tips that have worked well for me. What techniques do you use to keep students engaged during virtual sessions?', 2, 'skills', 0, 0, 15, 2, '2025-10-25 09:15:00', 3, '2025-10-25 08:45:00', '2025-10-25 09:15:00'),
(3, 'Looking for collaborators on community garden project', 'I\'m starting a community garden project in Brooklyn and looking for people interested in gardening, urban farming, or community organizing. We could use skills in landscaping, composting, and community outreach.', 1, 'projects', 0, 0, 8, 1, '2025-10-25 10:00:00', 4, '2025-10-25 09:30:00', '2025-10-25 10:00:00');

-- --------------------------------------------------------

--
-- Table structure for table `forum_replies`
--

CREATE TABLE `forum_replies` (
  `id` int(11) NOT NULL,
  `topic_id` int(11) NOT NULL,
  `content` text NOT NULL,
  `author_id` int(11) NOT NULL,
  `parent_reply_id` int(11) DEFAULT NULL,
  `is_solution` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `forum_replies`
--

INSERT INTO `forum_replies` (`id`, `topic_id`, `content`, `author_id`, `parent_reply_id`, `is_solution`, `created_at`, `updated_at`) VALUES
(1, 1, 'Thanks for creating this forum! I\'m excited to connect with other skill learners and teachers in the community.', 2, NULL, 0, '2025-10-25 08:15:00', '2025-10-25 08:15:00'),
(2, 1, 'Welcome everyone! This platform has already helped me find amazing mentors for my coding journey.', 3, NULL, 0, '2025-10-25 08:20:00', '2025-10-25 08:20:00'),
(3, 1, 'Looking forward to sharing my photography skills and learning from others!', 4, NULL, 0, '2025-10-25 08:30:00', '2025-10-25 08:30:00'),
(4, 2, 'Great question! I use interactive whiteboards and screen sharing extensively. Also, I find that starting with icebreakers and setting clear objectives helps maintain engagement.', 3, NULL, 0, '2025-10-25 09:00:00', '2025-10-25 09:00:00'),
(5, 2, 'I agree with the icebreakers! Also, using breakout rooms for smaller group discussions when teaching larger groups has been very effective.', 4, NULL, 0, '2025-10-25 09:15:00', '2025-10-25 09:15:00'),
(6, 3, 'I\'m interested! I have experience with urban gardening and would love to help organize community workshops.', 4, NULL, 0, '2025-10-25 10:00:00', '2025-10-25 10:00:00');

-- --------------------------------------------------------

--
-- Table structure for table `forum_likes`
--

CREATE TABLE `forum_likes` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `content_type` enum('topic','reply') NOT NULL,
  `content_id` int(11) NOT NULL,
  `like_type` enum('like','dislike') DEFAULT 'like',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `forum_likes`
--

INSERT INTO `forum_likes` (`id`, `user_id`, `content_type`, `content_id`, `like_type`, `created_at`) VALUES
(1, 2, 'topic', 1, 'like', '2025-10-25 08:15:00'),
(2, 3, 'topic', 1, 'like', '2025-10-25 08:20:00'),
(3, 4, 'topic', 1, 'like', '2025-10-25 08:30:00'),
(4, 1, 'reply', 4, 'like', '2025-10-25 09:05:00'),
(5, 2, 'reply', 4, 'like', '2025-10-25 09:10:00');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `forum_topics`
--
ALTER TABLE `forum_topics`
  ADD PRIMARY KEY (`id`),
  ADD KEY `author_id` (`author_id`),
  ADD KEY `last_reply_user_id` (`last_reply_user_id`),
  ADD KEY `idx_forum_topics_category` (`category`),
  ADD KEY `idx_forum_topics_pinned` (`is_pinned`),
  ADD KEY `idx_forum_topics_created` (`created_at`),
  ADD KEY `idx_forum_topics_last_reply` (`last_reply_at`);

--
-- Indexes for table `forum_replies`
--
ALTER TABLE `forum_replies`
  ADD PRIMARY KEY (`id`),
  ADD KEY `topic_id` (`topic_id`),
  ADD KEY `author_id` (`author_id`),
  ADD KEY `parent_reply_id` (`parent_reply_id`),
  ADD KEY `idx_forum_replies_created` (`created_at`);

--
-- Indexes for table `forum_likes`
--
ALTER TABLE `forum_likes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_content` (`user_id`,`content_type`,`content_id`),
  ADD KEY `idx_forum_likes_content` (`content_type`,`content_id`),
  ADD KEY `idx_forum_likes_created` (`created_at`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `forum_topics`
--
ALTER TABLE `forum_topics`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `forum_replies`
--
ALTER TABLE `forum_replies`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `forum_likes`
--
ALTER TABLE `forum_likes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `forum_topics`
--
ALTER TABLE `forum_topics`
  ADD CONSTRAINT `forum_topics_ibfk_1` FOREIGN KEY (`author_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `forum_topics_ibfk_2` FOREIGN KEY (`last_reply_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `forum_replies`
--
ALTER TABLE `forum_replies`
  ADD CONSTRAINT `forum_replies_ibfk_1` FOREIGN KEY (`topic_id`) REFERENCES `forum_topics` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `forum_replies_ibfk_2` FOREIGN KEY (`author_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `forum_replies_ibfk_3` FOREIGN KEY (`parent_reply_id`) REFERENCES `forum_replies` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `forum_likes`
--
ALTER TABLE `forum_likes`
  ADD CONSTRAINT `forum_likes_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

COMMIT;