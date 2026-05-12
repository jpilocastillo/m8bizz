-- Addresses Supabase linter: function_search_path_mutable (0011) and
-- public_bucket_allows_listing (0025) for storage bucket `avatars`.

-- -----------------------------------------------------------------------------
-- 1. Pin search_path on trigger / auth helpers (prevents search_path hijacking)
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path TO public
AS $$
BEGIN
  NEW.updated_at := timezone('utc'::text, now());
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_event_clients_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path TO public
AS $$
BEGIN
  NEW.updated_at := timezone('utc'::text, now());
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.email
  );
  RETURN NEW;
END;
$$;

-- Created only in some projects (not in repo migrations); set search_path if present.
DO $$
DECLARE
  r record;
BEGIN
  FOR r IN
    SELECT pg_get_function_identity_arguments(p.oid) AS args
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' AND p.proname = 'is_sr_advisor'
  LOOP
    EXECUTE format('ALTER FUNCTION public.is_sr_advisor(%s) SET search_path TO public', r.args);
  END LOOP;
END $$;

-- -----------------------------------------------------------------------------
-- 2. Avatars bucket: drop broad SELECT on storage.objects (enables bucket listing).
-- Public bucket files remain reachable via public object URLs without this policy.
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;
