-- Add basecamp_access column to profiles for Advisor Basecamp access control
alter table public.profiles add column if not exists basecamp_access boolean default false; 