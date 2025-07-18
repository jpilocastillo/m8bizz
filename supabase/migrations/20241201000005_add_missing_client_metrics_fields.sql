-- Add missing fields to client_metrics table
-- Migration: 20241201000005_add_missing_client_metrics_fields.sql

-- Add missing fields to client_metrics table
ALTER TABLE public.client_metrics 
ADD COLUMN IF NOT EXISTS monthly_ideal_prospects decimal(15,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS appointments_per_campaign decimal(15,2) DEFAULT 0;

-- Update existing records to have default values
UPDATE public.client_metrics 
SET monthly_ideal_prospects = 0, appointments_per_campaign = 0 
WHERE monthly_ideal_prospects IS NULL OR appointments_per_campaign IS NULL;

-- Make the new fields NOT NULL after setting defaults
ALTER TABLE public.client_metrics 
ALTER COLUMN monthly_ideal_prospects SET NOT NULL,
ALTER COLUMN appointments_per_campaign SET NOT NULL; 