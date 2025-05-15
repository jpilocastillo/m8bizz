-- Delete all marketing expenses for the user
DELETE FROM public.marketing_expenses
WHERE event_id IN (
    SELECT id FROM public.marketing_events 
    WHERE user_id = '20e1cf0f-486d-413f-9463-f9da583a84d8'
);

-- Delete all event attendance data for the user
DELETE FROM public.event_attendance
WHERE event_id IN (
    SELECT id FROM public.marketing_events 
    WHERE user_id = '20e1cf0f-486d-413f-9463-f9da583a84d8'
);

-- Delete all event financial production data for the user
DELETE FROM public.event_financial_production
WHERE event_id IN (
    SELECT id FROM public.marketing_events 
    WHERE user_id = '20e1cf0f-486d-413f-9463-f9da583a84d8'
);

-- Delete all marketing events for the user
DELETE FROM public.marketing_events
WHERE user_id = '20e1cf0f-486d-413f-9463-f9da583a84d8';

-- Delete the profile
DELETE FROM public.profiles
WHERE id = '20e1cf0f-486d-413f-9463-f9da583a84d8';

-- Delete the user from auth.users
DELETE FROM auth.users
WHERE id = '20e1cf0f-486d-413f-9463-f9da583a84d8'; 