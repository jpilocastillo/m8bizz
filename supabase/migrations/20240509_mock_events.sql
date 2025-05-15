-- Insert 8 diverse marketing events
INSERT INTO public.marketing_events (
    user_id,
    name,
    date,
    location,
    marketing_type,
    topic,
    time,
    age_range,
    mile_radius,
    income_assets,
    status,
    created_at,
    updated_at
) VALUES
-- 1. Recent MBI Mailer
(
    '20e1cf0f-486d-413f-9463-f9da583a84d8',
    'Q2 MBI Mailer Campaign',
    CURRENT_DATE - INTERVAL '15 days',
    'Downtown Area',
    'MBI Mailer',
    'Retirement Planning',
    '10:00 AM',
    '50-65',
    '25',
    '$500k-$1M',
    'active',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
-- 2. Upcoming Seminar
(
    '20e1cf0f-486d-413f-9463-f9da583a84d8',
    'Wealth Management Seminar',
    CURRENT_DATE + INTERVAL '30 days',
    'Grand Hotel Conference Center',
    'Seminar',
    'Wealth Management',
    '2:00 PM',
    '45-65',
    '30',
    '$1M+',
    'active',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
-- 3. Social Media Campaign
(
    '20e1cf0f-486d-413f-9463-f9da583a84d8',
    'LinkedIn Lead Generation',
    CURRENT_DATE - INTERVAL '7 days',
    'Online',
    'LinkedIn Ads',
    'Business Development',
    '9:00 AM',
    '35-55',
    '50',
    '$500k-$1M',
    'active',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
-- 4. Community Event
(
    '20e1cf0f-486d-413f-9463-f9da583a84d8',
    'Financial Wellness Fair',
    CURRENT_DATE + INTERVAL '45 days',
    'Community Center',
    'Community Event',
    'Financial Education',
    '10:00 AM',
    'All Ages',
    '30',
    'All Levels',
    'active',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
-- 5. Workshop
(
    '20e1cf0f-486d-413f-9463-f9da583a84d8',
    'Investment Strategies Workshop',
    CURRENT_DATE - INTERVAL '30 days',
    'Financial Center',
    'Workshop',
    'Investment Planning',
    '1:00 PM',
    '40-65',
    '25',
    '$500k-$1M',
    'active',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
-- 6. Direct Mail
(
    '20e1cf0f-486d-413f-9463-f9da583a84d8',
    'High-Net-Worth Direct Mail',
    CURRENT_DATE - INTERVAL '20 days',
    'Upscale Neighborhoods',
    'Direct Mail',
    'Wealth Management',
    '11:00 AM',
    '45-65',
    '15',
    '$1M+',
    'active',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
-- 7. Google Ads
(
    '20e1cf0f-486d-413f-9463-f9da583a84d8',
    'Digital Lead Generation',
    CURRENT_DATE - INTERVAL '5 days',
    'Online',
    'Google Ads',
    'Financial Planning',
    '8:00 AM',
    '30-50',
    '100',
    '$250k-$500k',
    'active',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
-- 8. Referral Program
(
    '20e1cf0f-486d-413f-9463-f9da583a84d8',
    'Client Referral Initiative',
    CURRENT_DATE + INTERVAL '60 days',
    'All Locations',
    'Referral Program',
    'Client Acquisition',
    '9:00 AM',
    'All Ages',
    'Unlimited',
    'All Levels',
    'active',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Insert corresponding marketing expenses
INSERT INTO public.marketing_expenses (
    event_id,
    advertising_cost,
    food_venue_cost,
    other_costs
)
SELECT 
    id,
    CASE 
        WHEN marketing_type IN ('MBI Mailer', 'Direct Mail') THEN 5000.00
        WHEN marketing_type IN ('LinkedIn Ads', 'Google Ads') THEN 2000.00
        WHEN marketing_type IN ('Seminar', 'Workshop') THEN 3000.00
        WHEN marketing_type IN ('Community Event') THEN 4000.00
        ELSE 1000.00
    END,
    CASE 
        WHEN marketing_type IN ('Seminar', 'Workshop', 'Community Event') THEN 2000.00
        ELSE 0.00
    END,
    CASE 
        WHEN marketing_type IN ('MBI Mailer', 'Direct Mail') THEN 1000.00
        WHEN marketing_type IN ('Seminar', 'Workshop') THEN 500.00
        ELSE 0.00
    END
FROM marketing_events me
WHERE me.user_id = '20e1cf0f-486d-413f-9463-f9da583a84d8';

-- Insert event attendance data
INSERT INTO public.event_attendance (
    event_id,
    registrant_responses,
    confirmations,
    attendees,
    clients_from_event
)
SELECT 
    id,
    CASE 
        WHEN marketing_type IN ('MBI Mailer', 'Direct Mail') THEN 150
        WHEN marketing_type IN ('LinkedIn Ads', 'Google Ads') THEN 75
        WHEN marketing_type IN ('Seminar', 'Workshop') THEN 45
        WHEN marketing_type = 'Community Event' THEN 200
        ELSE 30
    END,
    CASE 
        WHEN marketing_type IN ('MBI Mailer', 'Direct Mail') THEN 120
        WHEN marketing_type IN ('LinkedIn Ads', 'Google Ads') THEN 50
        WHEN marketing_type IN ('Seminar', 'Workshop') THEN 35
        WHEN marketing_type = 'Community Event' THEN 150
        ELSE 20
    END,
    CASE 
        WHEN marketing_type IN ('MBI Mailer', 'Direct Mail') THEN 100
        WHEN marketing_type IN ('LinkedIn Ads', 'Google Ads') THEN 40
        WHEN marketing_type IN ('Seminar', 'Workshop') THEN 30
        WHEN marketing_type = 'Community Event' THEN 120
        ELSE 15
    END,
    CASE 
        WHEN marketing_type IN ('MBI Mailer', 'Direct Mail') THEN 15
        WHEN marketing_type IN ('LinkedIn Ads', 'Google Ads') THEN 8
        WHEN marketing_type IN ('Seminar', 'Workshop') THEN 12
        WHEN marketing_type = 'Community Event' THEN 20
        ELSE 5
    END
FROM marketing_events me
WHERE me.user_id = '20e1cf0f-486d-413f-9463-f9da583a84d8';

-- Insert event appointments data
INSERT INTO public.event_appointments (
    event_id,
    set_at_event,
    set_after_event,
    first_appointment_attended,
    first_appointment_no_shows,
    second_appointment_attended
)
SELECT 
    id,
    CASE 
        WHEN marketing_type IN ('MBI Mailer', 'Direct Mail') THEN 10
        WHEN marketing_type IN ('LinkedIn Ads', 'Google Ads') THEN 5
        WHEN marketing_type IN ('Seminar', 'Workshop') THEN 8
        WHEN marketing_type = 'Community Event' THEN 15
        ELSE 3
    END,
    CASE 
        WHEN marketing_type IN ('MBI Mailer', 'Direct Mail') THEN 8
        WHEN marketing_type IN ('LinkedIn Ads', 'Google Ads') THEN 4
        WHEN marketing_type IN ('Seminar', 'Workshop') THEN 6
        WHEN marketing_type = 'Community Event' THEN 12
        ELSE 2
    END,
    CASE 
        WHEN marketing_type IN ('MBI Mailer', 'Direct Mail') THEN 7
        WHEN marketing_type IN ('LinkedIn Ads', 'Google Ads') THEN 3
        WHEN marketing_type IN ('Seminar', 'Workshop') THEN 5
        WHEN marketing_type = 'Community Event' THEN 10
        ELSE 2
    END,
    CASE 
        WHEN marketing_type IN ('MBI Mailer', 'Direct Mail') THEN 3
        WHEN marketing_type IN ('LinkedIn Ads', 'Google Ads') THEN 2
        WHEN marketing_type IN ('Seminar', 'Workshop') THEN 3
        WHEN marketing_type = 'Community Event' THEN 5
        ELSE 1
    END,
    CASE 
        WHEN marketing_type IN ('MBI Mailer', 'Direct Mail') THEN 5
        WHEN marketing_type IN ('LinkedIn Ads', 'Google Ads') THEN 2
        WHEN marketing_type IN ('Seminar', 'Workshop') THEN 4
        WHEN marketing_type = 'Community Event' THEN 8
        ELSE 1
    END
FROM marketing_events me
WHERE me.user_id = '20e1cf0f-486d-413f-9463-f9da583a84d8';

-- Insert event financial production data
INSERT INTO public.financial_production (
    event_id,
    annuity_premium,
    life_insurance_premium,
    aum,
    financial_planning,
    annuities_sold,
    life_policies_sold,
    annuity_commission,
    life_insurance_commission,
    aum_fees
)
SELECT 
    id,
    CASE 
        WHEN marketing_type IN ('MBI Mailer', 'Direct Mail') THEN 250000.00
        WHEN marketing_type IN ('LinkedIn Ads', 'Google Ads') THEN 150000.00
        WHEN marketing_type IN ('Seminar', 'Workshop') THEN 350000.00
        WHEN marketing_type = 'Community Event' THEN 200000.00
        ELSE 100000.00
    END,
    CASE 
        WHEN marketing_type IN ('MBI Mailer', 'Direct Mail') THEN 100000.00
        WHEN marketing_type IN ('LinkedIn Ads', 'Google Ads') THEN 75000.00
        WHEN marketing_type IN ('Seminar', 'Workshop') THEN 150000.00
        WHEN marketing_type = 'Community Event' THEN 80000.00
        ELSE 50000.00
    END,
    CASE 
        WHEN marketing_type IN ('MBI Mailer', 'Direct Mail') THEN 5000000.00
        WHEN marketing_type IN ('LinkedIn Ads', 'Google Ads') THEN 3000000.00
        WHEN marketing_type IN ('Seminar', 'Workshop') THEN 7500000.00
        WHEN marketing_type = 'Community Event' THEN 4000000.00
        ELSE 2000000.00
    END,
    CASE 
        WHEN marketing_type IN ('MBI Mailer', 'Direct Mail') THEN 50000.00
        WHEN marketing_type IN ('LinkedIn Ads', 'Google Ads') THEN 30000.00
        WHEN marketing_type IN ('Seminar', 'Workshop') THEN 75000.00
        WHEN marketing_type = 'Community Event' THEN 40000.00
        ELSE 20000.00
    END,
    CASE 
        WHEN marketing_type IN ('MBI Mailer', 'Direct Mail') THEN 5
        WHEN marketing_type IN ('LinkedIn Ads', 'Google Ads') THEN 3
        WHEN marketing_type IN ('Seminar', 'Workshop') THEN 8
        WHEN marketing_type = 'Community Event' THEN 4
        ELSE 2
    END,
    CASE 
        WHEN marketing_type IN ('MBI Mailer', 'Direct Mail') THEN 3
        WHEN marketing_type IN ('LinkedIn Ads', 'Google Ads') THEN 2
        WHEN marketing_type IN ('Seminar', 'Workshop') THEN 4
        WHEN marketing_type = 'Community Event' THEN 2
        ELSE 1
    END,
    CASE 
        WHEN marketing_type IN ('MBI Mailer', 'Direct Mail') THEN 25000.00
        WHEN marketing_type IN ('LinkedIn Ads', 'Google Ads') THEN 15000.00
        WHEN marketing_type IN ('Seminar', 'Workshop') THEN 35000.00
        WHEN marketing_type = 'Community Event' THEN 20000.00
        ELSE 10000.00
    END,
    CASE 
        WHEN marketing_type IN ('MBI Mailer', 'Direct Mail') THEN 10000.00
        WHEN marketing_type IN ('LinkedIn Ads', 'Google Ads') THEN 7500.00
        WHEN marketing_type IN ('Seminar', 'Workshop') THEN 15000.00
        WHEN marketing_type = 'Community Event' THEN 8000.00
        ELSE 5000.00
    END,
    CASE 
        WHEN marketing_type IN ('MBI Mailer', 'Direct Mail') THEN 50000.00
        WHEN marketing_type IN ('LinkedIn Ads', 'Google Ads') THEN 30000.00
        WHEN marketing_type IN ('Seminar', 'Workshop') THEN 75000.00
        WHEN marketing_type = 'Community Event' THEN 40000.00
        ELSE 20000.00
    END
FROM marketing_events me
WHERE me.user_id = '20e1cf0f-486d-413f-9463-f9da583a84d8'; 