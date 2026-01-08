-- Fix RLS policies for scorecard_metrics table
-- Migration: 20250102000001_fix_scorecard_metrics_rls.sql

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own scorecard metrics" ON public.scorecard_metrics;
DROP POLICY IF EXISTS "Users can insert their own scorecard metrics" ON public.scorecard_metrics;
DROP POLICY IF EXISTS "Users can update their own scorecard metrics" ON public.scorecard_metrics;
DROP POLICY IF EXISTS "Users can delete their own scorecard metrics" ON public.scorecard_metrics;

-- Ensure RLS is enabled
ALTER TABLE public.scorecard_metrics ENABLE ROW LEVEL SECURITY;

-- Recreate RLS policies for scorecard_metrics
-- Users can view metrics for roles they own
CREATE POLICY "Users can view their own scorecard metrics" ON public.scorecard_metrics
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.scorecard_roles
      WHERE scorecard_roles.id = scorecard_metrics.role_id
      AND scorecard_roles.user_id = auth.uid()
    )
  );

-- Users can insert metrics for roles they own
CREATE POLICY "Users can insert their own scorecard metrics" ON public.scorecard_metrics
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.scorecard_roles
      WHERE scorecard_roles.id = scorecard_metrics.role_id
      AND scorecard_roles.user_id = auth.uid()
    )
  );

-- Users can update metrics for roles they own
CREATE POLICY "Users can update their own scorecard metrics" ON public.scorecard_metrics
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.scorecard_roles
      WHERE scorecard_roles.id = scorecard_metrics.role_id
      AND scorecard_roles.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.scorecard_roles
      WHERE scorecard_roles.id = scorecard_metrics.role_id
      AND scorecard_roles.user_id = auth.uid()
    )
  );

-- Users can delete metrics for roles they own
CREATE POLICY "Users can delete their own scorecard metrics" ON public.scorecard_metrics
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.scorecard_roles
      WHERE scorecard_roles.id = scorecard_metrics.role_id
      AND scorecard_roles.user_id = auth.uid()
    )
  );



