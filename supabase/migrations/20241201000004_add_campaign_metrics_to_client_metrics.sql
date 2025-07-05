-- Add campaign metrics to client_metrics table
alter table public.client_metrics add column if not exists monthly_ideal_prospects decimal(10,2);
alter table public.client_metrics add column if not exists appointments_per_campaign decimal(10,2); 