-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Create profiles table that will be automatically populated when a user signs up
create table public.profiles (
    id uuid references auth.users on delete cascade not null primary key,
    full_name text,
    email text unique,
    company text,
    role text default 'user',
    approval_status text default 'pending',
    approval_date timestamp with time zone,
    marketing_goal text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create marketing_events table
create table public.marketing_events (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    name text not null,
    date date not null,
    location text not null,
    marketing_type text not null,
    topic text not null,
    time time,
    age_range text,
    mile_radius text,
    income_assets text,
    status text default 'active',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create marketing_expenses table
create table public.marketing_expenses (
    id uuid default uuid_generate_v4() primary key,
    event_id uuid references public.marketing_events(id) on delete cascade not null,
    advertising_cost decimal(10,2) default 0,
    food_venue_cost decimal(10,2) default 0,
    other_costs decimal(10,2) default 0,
    total_cost decimal(10,2) generated always as (advertising_cost + food_venue_cost + other_costs) stored,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create event_attendance table
create table public.event_attendance (
    id uuid default uuid_generate_v4() primary key,
    event_id uuid references public.marketing_events(id) on delete cascade not null,
    registrant_responses integer default 0,
    confirmations integer default 0,
    attendees integer default 0,
    clients_from_event integer default 0,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create event_appointments table
create table public.event_appointments (
    id uuid default uuid_generate_v4() primary key,
    event_id uuid references public.marketing_events(id) on delete cascade not null,
    set_at_event integer default 0,
    set_after_event integer default 0,
    first_appointment_attended integer default 0,
    first_appointment_no_shows integer default 0,
    second_appointment_attended integer default 0,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create financial_production table
create table public.financial_production (
    id uuid default uuid_generate_v4() primary key,
    event_id uuid references public.marketing_events(id) on delete cascade not null,
    annuity_premium decimal(10,2) default 0,
    life_insurance_premium decimal(10,2) default 0,
    aum decimal(10,2) default 0,
    financial_planning decimal(10,2) default 0,
    annuities_sold integer default 0,
    life_policies_sold integer default 0,
    aum_fees decimal(10,2) default 0,
    total decimal(10,2) generated always as (
        annuity_premium + 
        life_insurance_premium + 
        aum + 
        financial_planning + 
        aum_fees
    ) stored,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
    insert into public.profiles (id, full_name, email)
    values (
        new.id,
        new.raw_user_meta_data->>'full_name',
        new.email
    );
    return new;
end;
$$ language plpgsql security definer;

-- Create trigger for new user signup
create trigger on_auth_user_created
    after insert on auth.users
    for each row execute procedure public.handle_new_user();

-- Create RLS (Row Level Security) policies
alter table public.profiles enable row level security;
alter table public.marketing_events enable row level security;
alter table public.marketing_expenses enable row level security;
alter table public.event_attendance enable row level security;
alter table public.event_appointments enable row level security;
alter table public.financial_production enable row level security;

-- Profiles policies
create policy "Users can view their own profile"
    on public.profiles for select
    using (auth.uid() = id);

create policy "Users can update their own profile"
    on public.profiles for update
    using (auth.uid() = id);

-- Marketing events policies
create policy "Users can view their own events"
    on public.marketing_events for select
    using (auth.uid() = user_id);

create policy "Users can create their own events"
    on public.marketing_events for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own events"
    on public.marketing_events for update
    using (auth.uid() = user_id);

create policy "Users can delete their own events"
    on public.marketing_events for delete
    using (auth.uid() = user_id);

-- Marketing expenses policies
create policy "Users can view their own event expenses"
    on public.marketing_expenses for select
    using (
        exists (
            select 1 from public.marketing_events
            where id = marketing_expenses.event_id
            and user_id = auth.uid()
        )
    );

create policy "Users can manage their own event expenses"
    on public.marketing_expenses for all
    using (
        exists (
            select 1 from public.marketing_events
            where id = marketing_expenses.event_id
            and user_id = auth.uid()
        )
    );

-- Event attendance policies
create policy "Users can view their own event attendance"
    on public.event_attendance for select
    using (
        exists (
            select 1 from public.marketing_events
            where id = event_attendance.event_id
            and user_id = auth.uid()
        )
    );

create policy "Users can manage their own event attendance"
    on public.event_attendance for all
    using (
        exists (
            select 1 from public.marketing_events
            where id = event_attendance.event_id
            and user_id = auth.uid()
        )
    );

-- Event appointments policies
create policy "Users can view their own event appointments"
    on public.event_appointments for select
    using (
        exists (
            select 1 from public.marketing_events
            where id = event_appointments.event_id
            and user_id = auth.uid()
        )
    );

create policy "Users can manage their own event appointments"
    on public.event_appointments for all
    using (
        exists (
            select 1 from public.marketing_events
            where id = event_appointments.event_id
            and user_id = auth.uid()
        )
    );

-- Financial production policies
create policy "Users can view their own financial production"
    on public.financial_production for select
    using (
        exists (
            select 1 from public.marketing_events
            where id = financial_production.event_id
            and user_id = auth.uid()
        )
    );

create policy "Users can manage their own financial production"
    on public.financial_production for all
    using (
        exists (
            select 1 from public.marketing_events
            where id = financial_production.event_id
            and user_id = auth.uid()
        )
    );

-- Create indexes for better query performance
create index idx_marketing_events_user_id on public.marketing_events(user_id);
create index idx_marketing_events_date on public.marketing_events(date);
create index idx_marketing_expenses_event_id on public.marketing_expenses(event_id);
create index idx_event_attendance_event_id on public.event_attendance(event_id);
create index idx_event_appointments_event_id on public.event_appointments(event_id);
create index idx_financial_production_event_id on public.financial_production(event_id); 