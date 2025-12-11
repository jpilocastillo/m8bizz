-- Clear business behavior scorecard data for jazminpilo@gmail.com
-- This script deletes all scorecard-related data for the specified user

DO $$
DECLARE
  target_user_id UUID;
BEGIN
  -- Find the user_id for jazminpilo@gmail.com
  SELECT id INTO target_user_id
  FROM auth.users
  WHERE email = 'jazminpilo@gmail.com';

  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'User with email jazminpilo@gmail.com not found';
  END IF;

  RAISE NOTICE 'Found user_id: %', target_user_id;

  -- Delete company summaries (direct user_id reference)
  DELETE FROM public.company_summaries
  WHERE user_id = target_user_id;

  RAISE NOTICE 'Deleted company summaries';

  -- Delete scorecard roles (this will cascade delete metrics, weekly data, monthly summaries, and metric scores)
  DELETE FROM public.scorecard_roles
  WHERE user_id = target_user_id;

  RAISE NOTICE 'Deleted scorecard roles and all related data (cascaded)';

  RAISE NOTICE 'Successfully cleared all business behavior scorecard data for jazminpilo@gmail.com';
END $$;

