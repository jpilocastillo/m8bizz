-- Remove current and planning fields from monthly data entries
-- Migration: 20241201000008_remove_current_and_planning_fields.sql

-- Remove the columns that are no longer needed
alter table public.monthly_data_entries drop column if exists current_aum;
alter table public.monthly_data_entries drop column if exists current_annuity;
alter table public.monthly_data_entries drop column if exists current_life_production;
alter table public.monthly_data_entries drop column if exists planning_fees; 