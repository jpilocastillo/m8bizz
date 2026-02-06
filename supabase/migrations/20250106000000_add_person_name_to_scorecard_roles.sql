-- Add person_name column to scorecard_roles table
-- Migration: 20250106000000_add_person_name_to_scorecard_roles.sql

ALTER TABLE public.scorecard_roles
ADD COLUMN IF NOT EXISTS person_name TEXT;

-- Add comment to column
COMMENT ON COLUMN public.scorecard_roles.person_name IS 'Name of the person in this role';


