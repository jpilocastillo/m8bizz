-- Enable RLS on public.commission_percentages (Supabase linter: exposed tables must use RLS).
-- Table may have been created outside tracked migrations; branch on columns when present.

DO $$
DECLARE
  owner_col text;
BEGIN
  IF to_regclass('public.commission_percentages') IS NULL THEN
    RAISE NOTICE 'commission_percentages: table not found, skipping';
    RETURN;
  END IF;

  ALTER TABLE public.commission_percentages ENABLE ROW LEVEL SECURITY;

  DROP POLICY IF EXISTS "Users can view their own commission percentages" ON public.commission_percentages;
  DROP POLICY IF EXISTS "Users can insert their own commission percentages" ON public.commission_percentages;
  DROP POLICY IF EXISTS "Users can update their own commission percentages" ON public.commission_percentages;
  DROP POLICY IF EXISTS "Users can delete their own commission percentages" ON public.commission_percentages;
  DROP POLICY IF EXISTS "Signed-in users can read commission percentages" ON public.commission_percentages;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'commission_percentages' AND column_name = 'user_id'
  ) THEN
    owner_col := 'user_id';
  ELSIF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'commission_percentages' AND column_name = 'profile_id'
  ) THEN
    owner_col := 'profile_id';
  END IF;

  IF owner_col IS NOT NULL THEN
    EXECUTE format(
      $p$
      CREATE POLICY "Users can view their own commission percentages"
      ON public.commission_percentages FOR SELECT
      USING (auth.uid() = %I)
      $p$, owner_col
    );
    EXECUTE format(
      $p$
      CREATE POLICY "Users can insert their own commission percentages"
      ON public.commission_percentages FOR INSERT
      WITH CHECK (auth.uid() = %I)
      $p$, owner_col
    );
    EXECUTE format(
      $p$
      CREATE POLICY "Users can update their own commission percentages"
      ON public.commission_percentages FOR UPDATE
      USING (auth.uid() = %I)
      WITH CHECK (auth.uid() = %I)
      $p$, owner_col, owner_col
    );
    EXECUTE format(
      $p$
      CREATE POLICY "Users can delete their own commission percentages"
      ON public.commission_percentages FOR DELETE
      USING (auth.uid() = %I)
      $p$, owner_col
    );
  ELSE
    -- No owner column: allow signed-in users to read only; writes via service role / SQL editor.
    CREATE POLICY "Signed-in users can read commission percentages"
    ON public.commission_percentages FOR SELECT
    USING (auth.uid() IS NOT NULL);
  END IF;
END $$;
