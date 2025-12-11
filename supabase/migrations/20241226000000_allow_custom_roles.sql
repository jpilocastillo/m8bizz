-- Allow custom roles in scorecard_roles table
-- Migration: 20241226000000_allow_custom_roles.sql

-- Drop the CHECK constraint that limits role_name to specific values
-- PostgreSQL may name it differently, so we'll try common patterns
ALTER TABLE public.scorecard_roles 
DROP CONSTRAINT IF EXISTS scorecard_roles_role_name_check;

-- Also try the table_column_check pattern
DO $$
DECLARE
    constraint_name text;
BEGIN
    -- Find any CHECK constraint on role_name column
    SELECT conname INTO constraint_name
    FROM pg_constraint
    WHERE conrelid = 'public.scorecard_roles'::regclass
    AND contype = 'c'
    AND pg_get_constraintdef(oid) LIKE '%role_name%IN%'
    LIMIT 1;

    -- Drop the constraint if found
    IF constraint_name IS NOT NULL THEN
        EXECUTE format('ALTER TABLE public.scorecard_roles DROP CONSTRAINT %I', constraint_name);
    END IF;
END $$;

