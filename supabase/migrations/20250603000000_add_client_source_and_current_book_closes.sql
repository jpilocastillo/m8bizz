-- Add client_source to event_clients: 'new' = new client from event, 'current_book' = existing client / business from current book
ALTER TABLE public.event_clients
  ADD COLUMN IF NOT EXISTS client_source text DEFAULT 'new';

COMMENT ON COLUMN public.event_clients.client_source IS 'new = new client from event; current_book = existing client / business from current book';

-- Add current_book_closes to monthly_data_entries for advisor basecamp (count of closes from existing clients, not new clients)
ALTER TABLE public.monthly_data_entries
  ADD COLUMN IF NOT EXISTS current_book_closes integer NOT NULL DEFAULT 0;

COMMENT ON COLUMN public.monthly_data_entries.current_book_closes IS 'Number of closes from existing/current book clients (not counted as new clients)';
