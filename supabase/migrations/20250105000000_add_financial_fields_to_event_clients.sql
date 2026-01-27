-- Add financial fields to event_clients table
-- Migration: 20250105000000_add_financial_fields_to_event_clients.sql

-- Add new financial fields
alter table public.event_clients
    add column if not exists annuity_commission decimal(10,2) default 0,
    add column if not exists annuity_commission_percentage decimal(5,2),
    add column if not exists aum_fee_percentage decimal(5,2),
    add column if not exists life_insurance_commission decimal(10,2) default 0,
    add column if not exists life_insurance_commission_percentage decimal(5,2);

-- Rename financial_planning_amount to financial_planning_fee
do $$
begin
    if exists (
        select 1 from information_schema.columns 
        where table_schema = 'public' 
        and table_name = 'event_clients' 
        and column_name = 'financial_planning_amount'
    ) then
        alter table public.event_clients 
        rename column financial_planning_amount to financial_planning_fee;
    end if;
end $$;

