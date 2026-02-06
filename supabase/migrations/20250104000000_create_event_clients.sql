-- Create event_clients table to track individual clients and their closed deals per event
-- Migration: 20250104000000_create_event_clients.sql

create table if not exists public.event_clients (
    id uuid default uuid_generate_v4() primary key,
    event_id uuid references public.marketing_events(id) on delete cascade not null,
    client_name text not null,
    close_date date not null,
    annuity_premium decimal(10,2) default 0,
    life_insurance_premium decimal(10,2) default 0,
    aum_amount decimal(10,2) default 0,
    financial_planning_amount decimal(10,2) default 0,
    notes text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create indexes for better query performance
create index if not exists idx_event_clients_event_id on public.event_clients(event_id);
create index if not exists idx_event_clients_close_date on public.event_clients(close_date);
create index if not exists idx_event_clients_user_id on public.event_clients(event_id);

-- Enable Row Level Security
alter table public.event_clients enable row level security;

-- Drop existing policies if they exist
drop policy if exists "Users can view clients for their own events" on public.event_clients;
drop policy if exists "Users can insert clients for their own events" on public.event_clients;
drop policy if exists "Users can update clients for their own events" on public.event_clients;
drop policy if exists "Users can delete clients for their own events" on public.event_clients;

-- Create RLS policies
create policy "Users can view clients for their own events"
    on public.event_clients for select
    using (
        exists (
            select 1 from public.marketing_events
            where id = event_clients.event_id
            and user_id = auth.uid()
        )
    );

create policy "Users can insert clients for their own events"
    on public.event_clients for insert
    with check (
        exists (
            select 1 from public.marketing_events
            where id = event_clients.event_id
            and user_id = auth.uid()
        )
    );

create policy "Users can update clients for their own events"
    on public.event_clients for update
    using (
        exists (
            select 1 from public.marketing_events
            where id = event_clients.event_id
            and user_id = auth.uid()
        )
    );

create policy "Users can delete clients for their own events"
    on public.event_clients for delete
    using (
        exists (
            select 1 from public.marketing_events
            where id = event_clients.event_id
            and user_id = auth.uid()
        )
    );

-- Create function to update updated_at timestamp
create or replace function update_event_clients_updated_at()
returns trigger as $$
begin
    new.updated_at = timezone('utc'::text, now());
    return new;
end;
$$ language plpgsql;

-- Create trigger to automatically update updated_at
drop trigger if exists update_event_clients_updated_at on public.event_clients;
create trigger update_event_clients_updated_at
    before update on public.event_clients
    for each row
    execute function update_event_clients_updated_at();






