-- Fix RLS policies for scorecard_weekly_data table
-- Migration: 20250102000002_fix_scorecard_weekly_data_rls.sql

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own scorecard weekly data" ON public.scorecard_weekly_data;
DROP POLICY IF EXISTS "Users can insert their own scorecard weekly data" ON public.scorecard_weekly_data;
DROP POLICY IF EXISTS "Users can update their own scorecard weekly data" ON public.scorecard_weekly_data;
DROP POLICY IF EXISTS "Users can delete their own scorecard weekly data" ON public.scorecard_weekly_data;

-- Ensure RLS is enabled
ALTER TABLE public.scorecard_weekly_data ENABLE ROW LEVEL SECURITY;

-- Recreate RLS policies for scorecard_weekly_data
-- Users can view weekly data for metrics in roles they own
CREATE POLICY "Users can view their own scorecard weekly data" ON public.scorecard_weekly_data
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.scorecard_metrics
      JOIN public.scorecard_roles ON scorecard_roles.id = scorecard_metrics.role_id
      WHERE scorecard_metrics.id = scorecard_weekly_data.metric_id
      AND scorecard_roles.user_id = auth.uid()
    )
  );

-- Users can insert weekly data for metrics in roles they own
CREATE POLICY "Users can insert their own scorecard weekly data" ON public.scorecard_weekly_data
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.scorecard_metrics
      JOIN public.scorecard_roles ON scorecard_roles.id = scorecard_metrics.role_id
      WHERE scorecard_metrics.id = scorecard_weekly_data.metric_id
      AND scorecard_roles.user_id = auth.uid()
    )
  );

-- Users can update weekly data for metrics in roles they own
CREATE POLICY "Users can update their own scorecard weekly data" ON public.scorecard_weekly_data
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.scorecard_metrics
      JOIN public.scorecard_roles ON scorecard_roles.id = scorecard_metrics.role_id
      WHERE scorecard_metrics.id = scorecard_weekly_data.metric_id
      AND scorecard_roles.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.scorecard_metrics
      JOIN public.scorecard_roles ON scorecard_roles.id = scorecard_metrics.role_id
      WHERE scorecard_metrics.id = scorecard_weekly_data.metric_id
      AND scorecard_roles.user_id = auth.uid()
    )
  );

-- Users can delete weekly data for metrics in roles they own
CREATE POLICY "Users can delete their own scorecard weekly data" ON public.scorecard_weekly_data
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.scorecard_metrics
      JOIN public.scorecard_roles ON scorecard_roles.id = scorecard_metrics.role_id
      WHERE scorecard_metrics.id = scorecard_weekly_data.metric_id
      AND scorecard_roles.user_id = auth.uid()
    )
  );










