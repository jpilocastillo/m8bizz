-- Add marketing_audience column to marketing_events table
ALTER TABLE public.marketing_events
ADD COLUMN marketing_audience integer;

-- Add comment to explain the column
COMMENT ON COLUMN public.marketing_events.marketing_audience IS 'Total number of people in the marketing audience for this event'; 