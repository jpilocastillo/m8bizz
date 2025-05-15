-- First, ensure we have the user ID
DO $$
DECLARE
    user_id UUID := '00000000-0000-0000-0000-000000000000'; -- Replace with actual UUID
BEGIN
    -- Insert 10 varied marketing events
    INSERT INTO marketing_events (
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
    -- 1. MBI Mailer Campaign
    (
        user_id,
        'Q1 MBI Mailer Campaign',
        CURRENT_DATE - INTERVAL '30 days',
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
    -- 2. Facebook Ads Campaign
    (
        user_id,
        'Social Media Lead Generation',
        CURRENT_DATE + INTERVAL '15 days',
        'Online',
        'Facebook Ads',
        'Investment Strategies',
        '9:00 AM',
        '35-55',
        '50',
        '$250k-$500k',
        'active',
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ),
    -- 3. Seminar Event
    (
        user_id,
        'Retirement Planning Workshop',
        CURRENT_DATE - INTERVAL '45 days',
        'Community Center',
        'Seminar',
        'Retirement Planning',
        '2:00 PM',
        '55-70',
        '30',
        '$1M+',
        'active',
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ),
    -- 4. Networking Event
    (
        user_id,
        'Business Networking Mixer',
        CURRENT_DATE + INTERVAL '60 days',
        'Grand Hotel',
        'Networking',
        'Business Growth',
        '6:00 PM',
        '40-60',
        '20',
        '$500k-$1M',
        'active',
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ),
    -- 5. Direct Mail Campaign
    (
        user_id,
        'High-Net-Worth Direct Mail',
        CURRENT_DATE - INTERVAL '15 days',
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
    -- 6. Google Ads Campaign
    (
        user_id,
        'Digital Lead Generation',
        CURRENT_DATE - INTERVAL '7 days',
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
    -- 7. Referral Program
    (
        user_id,
        'Client Referral Initiative',
        CURRENT_DATE + INTERVAL '30 days',
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
    ),
    -- 8. Workshop Series
    (
        user_id,
        'Investment Strategies Workshop',
        CURRENT_DATE - INTERVAL '90 days',
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
    -- 9. Community Event
    (
        user_id,
        'Financial Wellness Fair',
        CURRENT_DATE - INTERVAL '120 days',
        'City Hall',
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
    -- 10. LinkedIn Campaign
    (
        user_id,
        'Professional Network Outreach',
        CURRENT_DATE - INTERVAL '20 days',
        'Online',
        'LinkedIn Ads',
        'Business Development',
        '8:00 AM',
        '35-55',
        '75',
        '$500k-$1M',
        'active',
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    );

    -- Insert corresponding marketing expenses
    INSERT INTO marketing_expenses (
        event_id,
        advertising_cost,
        food_venue_cost,
        other_costs
    )
    SELECT 
        id,
        CASE 
            WHEN marketing_type IN ('MBI Mailer', 'Direct Mail') THEN 5000.00
            WHEN marketing_type IN ('Facebook Ads', 'Google Ads', 'LinkedIn Ads') THEN 2000.00
            WHEN marketing_type IN ('Seminar', 'Workshop') THEN 3000.00
            WHEN marketing_type IN ('Networking', 'Community Event') THEN 4000.00
            ELSE 1000.00
        END,
        CASE 
            WHEN marketing_type IN ('Seminar', 'Workshop', 'Networking', 'Community Event') THEN 2000.00
            ELSE 0.00
        END,
        CASE 
            WHEN marketing_type IN ('MBI Mailer', 'Direct Mail') THEN 1000.00
            WHEN marketing_type IN ('Seminar', 'Workshop') THEN 500.00
            ELSE 0.00
        END
    FROM marketing_events me
    WHERE me.user_id = user_id;

    -- Insert event attendance data
    INSERT INTO event_attendance (
        event_id,
        registrant_responses,
        confirmations,
        attendees,
        clients_from_event
    )
    SELECT 
        id,
        CASE 
            WHEN marketing_type IN ('MBI Mailer', 'Direct Mail') THEN 250
            WHEN marketing_type IN ('Facebook Ads', 'Google Ads', 'LinkedIn Ads') THEN 150
            WHEN marketing_type IN ('Seminar', 'Workshop') THEN 100
            WHEN marketing_type IN ('Networking', 'Community Event') THEN 80
            ELSE 50
        END,
        CASE 
            WHEN marketing_type IN ('MBI Mailer', 'Direct Mail') THEN 200
            WHEN marketing_type IN ('Facebook Ads', 'Google Ads', 'LinkedIn Ads') THEN 120
            WHEN marketing_type IN ('Seminar', 'Workshop') THEN 85
            WHEN marketing_type IN ('Networking', 'Community Event') THEN 65
            ELSE 40
        END,
        CASE 
            WHEN marketing_type IN ('MBI Mailer', 'Direct Mail') THEN 180
            WHEN marketing_type IN ('Facebook Ads', 'Google Ads', 'LinkedIn Ads') THEN 100
            WHEN marketing_type IN ('Seminar', 'Workshop') THEN 75
            WHEN marketing_type IN ('Networking', 'Community Event') THEN 60
            ELSE 35
        END,
        CASE 
            WHEN marketing_type IN ('MBI Mailer', 'Direct Mail') THEN 45
            WHEN marketing_type IN ('Facebook Ads', 'Google Ads', 'LinkedIn Ads') THEN 25
            WHEN marketing_type IN ('Seminar', 'Workshop') THEN 20
            WHEN marketing_type IN ('Networking', 'Community Event') THEN 15
            ELSE 10
        END
    FROM marketing_events me
    WHERE me.user_id = user_id;

    -- Insert event appointments data
    INSERT INTO event_appointments (
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
            WHEN marketing_type IN ('MBI Mailer', 'Direct Mail') THEN 35
            WHEN marketing_type IN ('Facebook Ads', 'Google Ads', 'LinkedIn Ads') THEN 20
            WHEN marketing_type IN ('Seminar', 'Workshop') THEN 15
            WHEN marketing_type IN ('Networking', 'Community Event') THEN 12
            ELSE 8
        END,
        CASE 
            WHEN marketing_type IN ('MBI Mailer', 'Direct Mail') THEN 15
            WHEN marketing_type IN ('Facebook Ads', 'Google Ads', 'LinkedIn Ads') THEN 10
            WHEN marketing_type IN ('Seminar', 'Workshop') THEN 8
            WHEN marketing_type IN ('Networking', 'Community Event') THEN 6
            ELSE 4
        END,
        CASE 
            WHEN marketing_type IN ('MBI Mailer', 'Direct Mail') THEN 30
            WHEN marketing_type IN ('Facebook Ads', 'Google Ads', 'LinkedIn Ads') THEN 18
            WHEN marketing_type IN ('Seminar', 'Workshop') THEN 13
            WHEN marketing_type IN ('Networking', 'Community Event') THEN 10
            ELSE 7
        END,
        CASE 
            WHEN marketing_type IN ('MBI Mailer', 'Direct Mail') THEN 5
            WHEN marketing_type IN ('Facebook Ads', 'Google Ads', 'LinkedIn Ads') THEN 2
            WHEN marketing_type IN ('Seminar', 'Workshop') THEN 2
            WHEN marketing_type IN ('Networking', 'Community Event') THEN 2
            ELSE 1
        END,
        CASE 
            WHEN marketing_type IN ('MBI Mailer', 'Direct Mail') THEN 25
            WHEN marketing_type IN ('Facebook Ads', 'Google Ads', 'LinkedIn Ads') THEN 15
            WHEN marketing_type IN ('Seminar', 'Workshop') THEN 10
            WHEN marketing_type IN ('Networking', 'Community Event') THEN 8
            ELSE 5
        END
    FROM marketing_events me
    WHERE me.user_id = user_id;

    -- Insert financial production data
    INSERT INTO event_financial_production (
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
            WHEN marketing_type IN ('MBI Mailer', 'Direct Mail') THEN 500000.00
            WHEN marketing_type IN ('Facebook Ads', 'Google Ads', 'LinkedIn Ads') THEN 250000.00
            WHEN marketing_type IN ('Seminar', 'Workshop') THEN 350000.00
            WHEN marketing_type IN ('Networking', 'Community Event') THEN 200000.00
            ELSE 150000.00
        END,
        CASE 
            WHEN marketing_type IN ('MBI Mailer', 'Direct Mail') THEN 300000.00
            WHEN marketing_type IN ('Facebook Ads', 'Google Ads', 'LinkedIn Ads') THEN 150000.00
            WHEN marketing_type IN ('Seminar', 'Workshop') THEN 200000.00
            WHEN marketing_type IN ('Networking', 'Community Event') THEN 100000.00
            ELSE 75000.00
        END,
        CASE 
            WHEN marketing_type IN ('MBI Mailer', 'Direct Mail') THEN 2000000.00
            WHEN marketing_type IN ('Facebook Ads', 'Google Ads', 'LinkedIn Ads') THEN 1000000.00
            WHEN marketing_type IN ('Seminar', 'Workshop') THEN 1500000.00
            WHEN marketing_type IN ('Networking', 'Community Event') THEN 800000.00
            ELSE 500000.00
        END,
        CASE 
            WHEN marketing_type IN ('MBI Mailer', 'Direct Mail') THEN 25000.00
            WHEN marketing_type IN ('Facebook Ads', 'Google Ads', 'LinkedIn Ads') THEN 15000.00
            WHEN marketing_type IN ('Seminar', 'Workshop') THEN 20000.00
            WHEN marketing_type IN ('Networking', 'Community Event') THEN 10000.00
            ELSE 5000.00
        END,
        CASE 
            WHEN marketing_type IN ('MBI Mailer', 'Direct Mail') THEN 5
            WHEN marketing_type IN ('Facebook Ads', 'Google Ads', 'LinkedIn Ads') THEN 3
            WHEN marketing_type IN ('Seminar', 'Workshop') THEN 4
            WHEN marketing_type IN ('Networking', 'Community Event') THEN 2
            ELSE 1
        END,
        CASE 
            WHEN marketing_type IN ('MBI Mailer', 'Direct Mail') THEN 3
            WHEN marketing_type IN ('Facebook Ads', 'Google Ads', 'LinkedIn Ads') THEN 2
            WHEN marketing_type IN ('Seminar', 'Workshop') THEN 2
            WHEN marketing_type IN ('Networking', 'Community Event') THEN 1
            ELSE 1
        END,
        CASE 
            WHEN marketing_type IN ('MBI Mailer', 'Direct Mail') THEN 25000.00
            WHEN marketing_type IN ('Facebook Ads', 'Google Ads', 'LinkedIn Ads') THEN 12500.00
            WHEN marketing_type IN ('Seminar', 'Workshop') THEN 17500.00
            WHEN marketing_type IN ('Networking', 'Community Event') THEN 10000.00
            ELSE 7500.00
        END,
        CASE 
            WHEN marketing_type IN ('MBI Mailer', 'Direct Mail') THEN 15000.00
            WHEN marketing_type IN ('Facebook Ads', 'Google Ads', 'LinkedIn Ads') THEN 7500.00
            WHEN marketing_type IN ('Seminar', 'Workshop') THEN 10000.00
            WHEN marketing_type IN ('Networking', 'Community Event') THEN 5000.00
            ELSE 3750.00
        END,
        CASE 
            WHEN marketing_type IN ('MBI Mailer', 'Direct Mail') THEN 20000.00
            WHEN marketing_type IN ('Facebook Ads', 'Google Ads', 'LinkedIn Ads') THEN 10000.00
            WHEN marketing_type IN ('Seminar', 'Workshop') THEN 15000.00
            WHEN marketing_type IN ('Networking', 'Community Event') THEN 8000.00
            ELSE 5000.00
        END
    FROM marketing_events me
    WHERE me.user_id = user_id;
END $$; 