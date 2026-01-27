-- Add aum_fees column to event_clients table
-- Migration: 20250105000002_add_aum_fees_to_event_clients.sql

alter table public.event_clients
    add column if not exists aum_fees decimal(10,2) default 0;

