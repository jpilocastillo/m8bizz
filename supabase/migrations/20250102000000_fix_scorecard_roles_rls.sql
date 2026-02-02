-- Fix RLS policies for scorecard_roles table
-- Migration: 20250102000000_fix_scorecard_roles_rls.sql

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own scorecard roles" ON public.scorecard_roles;
DROP POLICY IF EXISTS "Users can insert their own scorecard roles" ON public.scorecard_roles;
DROP POLICY IF EXISTS "Users can update their own scorecard roles" ON public.scorecard_roles;
DROP POLICY IF EXISTS "Users can delete their own scorecard roles" ON public.scorecard_roles;

-- Ensure RLS is enabled
ALTER TABLE public.scorecard_roles ENABLE ROW LEVEL SECURITY;

-- Recreate RLS policies for scorecard_roles
CREATE POLICY "Users can view their own scorecard roles" ON public.scorecard_roles
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own scorecard roles" ON public.scorecard_roles
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own scorecard roles" ON public.scorecard_roles
  FOR UPDATE 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own scorecard roles" ON public.scorecard_roles
  FOR DELETE 
  USING (auth.uid() = user_id);











