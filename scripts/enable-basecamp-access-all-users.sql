-- Enable basecamp access for all users in Supabase
-- This script updates the basecamp_access column to true for all existing users

-- First, let's check the current state of basecamp access
SELECT 
    id,
    email,
    full_name,
    basecamp_access,
    role,
    created_at
FROM public.profiles 
ORDER BY created_at DESC;

-- Update all users to have basecamp access
UPDATE public.profiles 
SET 
    basecamp_access = true,
    updated_at = timezone('utc'::text, now())
WHERE basecamp_access IS NULL OR basecamp_access = false;

-- Verify the update
SELECT 
    COUNT(*) as total_users,
    COUNT(CASE WHEN basecamp_access = true THEN 1 END) as users_with_basecamp_access,
    COUNT(CASE WHEN basecamp_access = false THEN 1 END) as users_without_basecamp_access
FROM public.profiles;

-- Show updated users
SELECT 
    id,
    email,
    full_name,
    basecamp_access,
    role,
    updated_at
FROM public.profiles 
WHERE basecamp_access = true
ORDER BY updated_at DESC;
