-- Create advisor basecamp tables for user-specific data
-- Migration: 20241201000002_create_advisor_basecamp_tables.sql

-- Create business_goals table
create table if not exists public.business_goals (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    business_goal decimal(15,2) not null,
    aum_goal decimal(15,2) not null,
    aum_goal_percentage decimal(5,2) not null,
    annuity_goal decimal(15,2) not null,
    annuity_goal_percentage decimal(5,2) not null,
    life_target_goal decimal(15,2) not null,
    life_target_goal_percentage decimal(5,2) not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(user_id)
);

-- Create current_values table
create table if not exists public.current_values (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    current_aum decimal(15,2) not null,
    current_annuity decimal(15,2) not null,
    current_life_production decimal(15,2) not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(user_id)
);

-- Create client_metrics table
create table if not exists public.client_metrics (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    avg_annuity_size decimal(15,2) not null,
    avg_aum_size decimal(15,2) not null,
    avg_net_worth_needed decimal(15,2) not null,
    appointment_attrition decimal(5,2) not null,
    avg_close_ratio decimal(5,2) not null,
    annuity_closed integer not null,
    aum_accounts integer not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(user_id)
);

-- Create marketing_campaigns table
create table if not exists public.marketing_campaigns (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    name text not null,
    budget decimal(10,2) not null,
    events integer not null,
    leads integer not null,
    status text check (status in ('Active', 'Planned', 'Completed', 'Paused')) not null,
    cost_per_lead decimal(10,2),
    cost_per_client decimal(10,2),
    food_costs decimal(10,2),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create commission_rates table
create table if not exists public.commission_rates (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    planning_fee_rate decimal(10,2) not null,
    planning_fees_count decimal(10,2) not null,
    annuity_commission decimal(5,2) not null,
    aum_commission decimal(5,2) not null,
    life_commission decimal(5,2) not null,
    trail_income_percentage decimal(5,2) not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(user_id)
);

-- Create financial_book table for storing book values
create table if not exists public.financial_book (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    annuity_book_value decimal(15,2) not null,
    aum_book_value decimal(15,2) not null,
    qualified_money_value decimal(15,2) not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(user_id)
);

-- Enable Row Level Security
alter table public.business_goals enable row level security;
alter table public.current_values enable row level security;
alter table public.client_metrics enable row level security;
alter table public.marketing_campaigns enable row level security;
alter table public.commission_rates enable row level security;
alter table public.financial_book enable row level security;

-- Create RLS policies for business_goals
create policy "Users can view their own business goals"
    on public.business_goals for select
    using (auth.uid() = user_id);

create policy "Users can insert their own business goals"
    on public.business_goals for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own business goals"
    on public.business_goals for update
    using (auth.uid() = user_id);

create policy "Users can delete their own business goals"
    on public.business_goals for delete
    using (auth.uid() = user_id);

-- Create RLS policies for current_values
create policy "Users can view their own current values"
    on public.current_values for select
    using (auth.uid() = user_id);

create policy "Users can insert their own current values"
    on public.current_values for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own current values"
    on public.current_values for update
    using (auth.uid() = user_id);

create policy "Users can delete their own current values"
    on public.current_values for delete
    using (auth.uid() = user_id);

-- Create RLS policies for client_metrics
create policy "Users can view their own client metrics"
    on public.client_metrics for select
    using (auth.uid() = user_id);

create policy "Users can insert their own client metrics"
    on public.client_metrics for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own client metrics"
    on public.client_metrics for update
    using (auth.uid() = user_id);

create policy "Users can delete their own client metrics"
    on public.client_metrics for delete
    using (auth.uid() = user_id);

-- Create RLS policies for marketing_campaigns
create policy "Users can view their own marketing campaigns"
    on public.marketing_campaigns for select
    using (auth.uid() = user_id);

create policy "Users can insert their own marketing campaigns"
    on public.marketing_campaigns for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own marketing campaigns"
    on public.marketing_campaigns for update
    using (auth.uid() = user_id);

create policy "Users can delete their own marketing campaigns"
    on public.marketing_campaigns for delete
    using (auth.uid() = user_id);

-- Create RLS policies for commission_rates
create policy "Users can view their own commission rates"
    on public.commission_rates for select
    using (auth.uid() = user_id);

create policy "Users can insert their own commission rates"
    on public.commission_rates for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own commission rates"
    on public.commission_rates for update
    using (auth.uid() = user_id);

create policy "Users can delete their own commission rates"
    on public.commission_rates for delete
    using (auth.uid() = user_id);

-- Create RLS policies for financial_book
create policy "Users can view their own financial book"
    on public.financial_book for select
    using (auth.uid() = user_id);

create policy "Users can insert their own financial book"
    on public.financial_book for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own financial book"
    on public.financial_book for update
    using (auth.uid() = user_id);

create policy "Users can delete their own financial book"
    on public.financial_book for delete
    using (auth.uid() = user_id);

-- Create indexes for better performance
create index idx_business_goals_user_id on public.business_goals(user_id);
create index idx_current_values_user_id on public.current_values(user_id);
create index idx_client_metrics_user_id on public.client_metrics(user_id);
create index idx_marketing_campaigns_user_id on public.marketing_campaigns(user_id);
create index idx_marketing_campaigns_status on public.marketing_campaigns(status);
create index idx_commission_rates_user_id on public.commission_rates(user_id);
create index idx_financial_book_user_id on public.financial_book(user_id);

-- Create function to update updated_at timestamp
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = timezone('utc'::text, now());
    return new;
end;
$$ language plpgsql;

-- Create triggers for updated_at
create trigger update_business_goals_updated_at
    before update on public.business_goals
    for each row execute procedure public.update_updated_at_column();

create trigger update_current_values_updated_at
    before update on public.current_values
    for each row execute procedure public.update_updated_at_column();

create trigger update_client_metrics_updated_at
    before update on public.client_metrics
    for each row execute procedure public.update_updated_at_column();

create trigger update_marketing_campaigns_updated_at
    before update on public.marketing_campaigns
    for each row execute procedure public.update_updated_at_column();

create trigger update_commission_rates_updated_at
    before update on public.commission_rates
    for each row execute procedure public.update_updated_at_column();

create trigger update_financial_book_updated_at
    before update on public.financial_book
    for each row execute procedure public.update_updated_at_column(); 