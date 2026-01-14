-- Fix RLS policies for scorecard_monthly_summaries and company_summaries
-- Migration: 20250103000000_fix_monthly_summaries_rls.sql

-- Drop existing policies
DROP POLICY IF EXISTS "Users can insert their own monthly summaries" ON public.scorecard_monthly_summaries;
DROP POLICY IF EXISTS "Users can update their own monthly summaries" ON public.scorecard_monthly_summaries;

-- Recreate INSERT policy with a simpler check that works better with Supabase
CREATE POLICY "Users can insert their own monthly summaries" ON public.scorecard_monthly_summaries
  FOR INSERT WITH CHECK (
    role_id IN (
      SELECT id FROM public.scorecard_roles
      WHERE user_id = auth.uid()
    )
  );

-- Recreate UPDATE policy
CREATE POLICY "Users can update their own monthly summaries" ON public.scorecard_monthly_summaries
  FOR UPDATE USING (
    role_id IN (
      SELECT id FROM public.scorecard_roles
      WHERE user_id = auth.uid()
    )
  );

-- Drop and recreate company_summaries INSERT policy (should be fine, but let's ensure it works)
DROP POLICY IF EXISTS "Users can insert their own company summaries" ON public.company_summaries;
DROP POLICY IF EXISTS "Users can update their own company summaries" ON public.company_summaries;

CREATE POLICY "Users can insert their own company summaries" ON public.company_summaries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own company summaries" ON public.company_summaries
  FOR UPDATE USING (auth.uid() = user_id);

