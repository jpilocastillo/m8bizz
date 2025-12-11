-- Create financial_options table for storing financial options percentages and rates
create table if not exists public.financial_options (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    -- Option 1 - Annuity Book Percentages
    surrender_percent decimal(5,2) not null,
    income_rider_percent decimal(5,2) not null,
    free_withdrawal_percent decimal(5,2) not null,
    life_insurance_percent decimal(5,2) not null,
    -- Option 2 - AUM Book Percentages
    life_strategy1_percent decimal(5,2) not null,
    life_strategy2_percent decimal(5,2) not null,
    -- Option 3 - Qualified Money Percentages
    ira_to_7702_percent decimal(5,2) not null,
    approval_rate_percent decimal(5,2) not null,
    -- Option 1 - Annuity Book Rates
    surrender_rate decimal(5,2) not null,
    income_rider_rate decimal(5,2) not null,
    free_withdrawal_rate decimal(5,2) not null,
    life_insurance_rate decimal(5,2) not null,
    -- Option 2 - AUM Book Rates
    life_strategy1_rate decimal(5,2) not null,
    life_strategy2_rate decimal(5,2) not null,
    -- Option 3 - Qualified Money Rates
    ira_to_7702_rate decimal(5,2) not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(user_id)
);

-- Enable Row Level Security
alter table public.financial_options enable row level security;

-- Create RLS policies for financial_options
create policy "Users can view their own financial options"
    on public.financial_options for select
    using (auth.uid() = user_id);

create policy "Users can insert their own financial options"
    on public.financial_options for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own financial options"
    on public.financial_options for update
    using (auth.uid() = user_id);

create policy "Users can delete their own financial options"
    on public.financial_options for delete
    using (auth.uid() = user_id);

