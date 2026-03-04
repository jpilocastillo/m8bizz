-- Add cultivation-specific fields for Current Clients / Cultivation event type
ALTER TABLE public.marketing_events
  ADD COLUMN IF NOT EXISTS cultivation_activity_type text,
  ADD COLUMN IF NOT EXISTS cultivation_client_touches integer,
  ADD COLUMN IF NOT EXISTS cultivation_notes text;

COMMENT ON COLUMN public.marketing_events.cultivation_activity_type IS 'Type of cultivation activity: Client check-in, Review meeting, etc.';
COMMENT ON COLUMN public.marketing_events.cultivation_client_touches IS 'Number of clients or touches for this cultivation activity';
COMMENT ON COLUMN public.marketing_events.cultivation_notes IS 'Optional notes for cultivation activity';
