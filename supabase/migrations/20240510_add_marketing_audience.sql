-- Add marketing_audience column to marketing_events table
ALTER TABLE public.marketing_events ADD COLUMN marketing_audience integer;

-- Add comment to explain the purpose of the column
COMMENT ON COLUMN public.marketing_events.marketing_audience IS 'The total size of the marketing audience for this event'; 