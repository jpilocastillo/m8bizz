-- Migration: Add not_qualified column to event_appointments table
-- Date: 2024-12-01
-- Description: Adds a not_qualified column to track prospects who are not qualified for appointments

-- Add the not_qualified column to event_appointments table
ALTER TABLE event_appointments 
ADD COLUMN IF NOT EXISTS not_qualified INTEGER DEFAULT 0;

-- Add a comment to document the new column
COMMENT ON COLUMN event_appointments.not_qualified IS 'Number of prospects who are not qualified for appointments';

-- Update any existing records to have a default value of 0
UPDATE event_appointments 
SET not_qualified = 0 
WHERE not_qualified IS NULL; 