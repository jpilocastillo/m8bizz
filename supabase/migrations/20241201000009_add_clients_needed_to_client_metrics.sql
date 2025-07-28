-- Add clients_needed field to client_metrics table
-- This field will store the calculated value: (# of AUM accounts + # of annuity closed) / 2

ALTER TABLE public.client_metrics 
ADD COLUMN clients_needed integer;

-- Update existing records to calculate clients_needed
UPDATE public.client_metrics 
SET clients_needed = (aum_accounts + annuity_closed) / 2 
WHERE clients_needed IS NULL;

-- Make the column NOT NULL after updating existing records
ALTER TABLE public.client_metrics 
ALTER COLUMN clients_needed SET NOT NULL; 