-- Migration to add timezone and recurring booking support
-- Run this script to update existing databases

USE urban_skill_exchange;

-- Add timezone column to bookings table
ALTER TABLE bookings ADD COLUMN timezone VARCHAR(50) AFTER notes;

-- Add recurring booking columns
ALTER TABLE bookings ADD COLUMN is_recurring BOOLEAN DEFAULT FALSE AFTER timezone;
ALTER TABLE bookings ADD COLUMN recurrence_pattern ENUM('daily', 'weekly', 'monthly') AFTER is_recurring;
ALTER TABLE bookings ADD COLUMN recurrence_end_date DATE AFTER recurrence_pattern;

-- Update existing bookings to have default timezone
UPDATE bookings SET timezone = 'America/New_York' WHERE timezone IS NULL;

-- Add index for recurring bookings
CREATE INDEX idx_bookings_recurring ON bookings(is_recurring, recurrence_pattern);