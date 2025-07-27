-- Create monthly data entries table for tracking monthly performance
-- Migration: 20241201000007_create_monthly_data_entries.sql

create table if not exists public.monthly_data_entries (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    month_year text not null, -- Format: "YYYY-MM"
    current_aum decimal(15,2) not null,
    current_annuity decimal(15,2) not null,
    current_life_production decimal(15,2) not null,
    new_clients integer not null,
    new_appointments integer not null,
    new_leads integer not null,
    annuity_sales decimal(15,2) not null,
    aum_sales decimal(15,2) not null,
    life_sales decimal(15,2) not null,
    planning_fees decimal(10,2) not null,
    marketing_expenses decimal(10,2) not null,
    notes text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(user_id, month_year)
);

-- Add RLS policies for monthly_data_entries
alter table public.monthly_data_entries enable row level security;

-- Users can only see their own monthly data entries
create policy "Users can view own monthly data entries" on public.monthly_data_entries
    for select using (auth.uid() = user_id);

-- Users can insert their own monthly data entries
create policy "Users can insert own monthly data entries" on public.monthly_data_entries
    for insert with check (auth.uid() = user_id);

-- Users can update their own monthly data entries
create policy "Users can update own monthly data entries" on public.monthly_data_entries
    for update using (auth.uid() = user_id);

-- Users can delete their own monthly data entries
create policy "Users can delete own monthly data entries" on public.monthly_data_entries
    for delete using (auth.uid() = user_id);

-- Create index for faster queries
create index idx_monthly_data_entries_user_month on public.monthly_data_entries(user_id, month_year); 