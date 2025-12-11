-- Add is_visible field to scorecard_metrics table
-- Migration: 20241224000000_add_metric_visibility.sql

-- Add is_visible column to scorecard_metrics table
ALTER TABLE public.scorecard_metrics
ADD COLUMN IF NOT EXISTS is_visible BOOLEAN DEFAULT TRUE;

-- Update all existing metrics to be visible by default
UPDATE public.scorecard_metrics
SET is_visible = TRUE
WHERE is_visible IS NULL;

-- Make the column NOT NULL after setting defaults
ALTER TABLE public.scorecard_metrics
ALTER COLUMN is_visible SET NOT NULL;

-- Add comment to explain the column
COMMENT ON COLUMN public.scorecard_metrics.is_visible IS 'Controls whether this metric is displayed in the monthly statistics for its role. Defaults to true to show all metrics by default.';

