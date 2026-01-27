-- Migrate financial_production data to event_clients as aggregated records
-- Migration: 20250105000001_migrate_financial_production.sql

-- Insert aggregated client records for events with financial_production data
insert into public.event_clients (
    event_id,
    client_name,
    close_date,
    annuity_premium,
    annuity_commission,
    annuity_commission_percentage,
    life_insurance_premium,
    life_insurance_commission,
    life_insurance_commission_percentage,
    aum_amount,
    aum_fee_percentage,
    financial_planning_fee,
    notes
)
select 
    e.id as event_id,
    'Aggregated Financial Data - ' || e.name as client_name,
    e.date as close_date,
    coalesce(fp.annuity_premium, 0) as annuity_premium,
    coalesce(fp.annuity_commission, 0) as annuity_commission,
    case 
        when fp.annuity_premium > 0 and fp.annuity_commission > 0 
        then (fp.annuity_commission / fp.annuity_premium) * 100
        else null
    end as annuity_commission_percentage,
    coalesce(fp.life_insurance_premium, 0) as life_insurance_premium,
    coalesce(fp.life_insurance_commission, 0) as life_insurance_commission,
    case 
        when fp.life_insurance_premium > 0 and fp.life_insurance_commission > 0 
        then (fp.life_insurance_commission / fp.life_insurance_premium) * 100
        else null
    end as life_insurance_commission_percentage,
    coalesce(fp.aum, 0) as aum_amount,
    case 
        when fp.aum > 0 and fp.aum_fees > 0 
        then (fp.aum_fees / fp.aum) * 100
        else null
    end as aum_fee_percentage,
    coalesce(fp.financial_planning, 0) as financial_planning_fee,
    'Migrated from event-level financial data on ' || to_char(timezone('utc'::text, now()), 'YYYY-MM-DD HH24:MI:SS UTC') || '. You can split this into individual client records if needed.' as notes
from public.marketing_events e
inner join public.financial_production fp on fp.event_id = e.id
where not exists (
    -- Only create if an aggregated record doesn't already exist for this event
    select 1 from public.event_clients ec
    where ec.event_id = e.id
    and ec.client_name like 'Aggregated Financial Data - %'
)
and (
    -- Only migrate if there's actual financial data
    fp.annuity_premium > 0 
    or fp.life_insurance_premium > 0 
    or fp.aum > 0 
    or fp.financial_planning > 0
    or fp.annuity_commission > 0
    or fp.life_insurance_commission > 0
    or fp.aum_fees > 0
);

