-- Fix RLS policies for advisor basecamp tables
-- This script ensures all RLS policies are correctly set up

-- First, let's check if the tables exist and have the right structure
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name IN ('business_goals', 'current_values', 'client_metrics', 'marketing_campaigns', 'commission_rates', 'financial_book')
ORDER BY table_name, ordinal_position;

-- Check if RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('business_goals', 'current_values', 'client_metrics', 'marketing_campaigns', 'commission_rates', 'financial_book');

-- Check existing policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('business_goals', 'current_values', 'client_metrics', 'marketing_campaigns', 'commission_rates', 'financial_book')
ORDER BY tablename, policyname;

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Users can view their own business goals" ON public.business_goals;
DROP POLICY IF EXISTS "Users can insert their own business goals" ON public.business_goals;
DROP POLICY IF EXISTS "Users can update their own business goals" ON public.business_goals;
DROP POLICY IF EXISTS "Users can delete their own business goals" ON public.business_goals;

DROP POLICY IF EXISTS "Users can view their own current values" ON public.current_values;
DROP POLICY IF EXISTS "Users can insert their own current values" ON public.current_values;
DROP POLICY IF EXISTS "Users can update their own current values" ON public.current_values;
DROP POLICY IF EXISTS "Users can delete their own current values" ON public.current_values;

DROP POLICY IF EXISTS "Users can view their own client metrics" ON public.client_metrics;
DROP POLICY IF EXISTS "Users can insert their own client metrics" ON public.client_metrics;
DROP POLICY IF EXISTS "Users can update their own client metrics" ON public.client_metrics;
DROP POLICY IF EXISTS "Users can delete their own client metrics" ON public.client_metrics;

DROP POLICY IF EXISTS "Users can view their own marketing campaigns" ON public.marketing_campaigns;
DROP POLICY IF EXISTS "Users can insert their own marketing campaigns" ON public.marketing_campaigns;
DROP POLICY IF EXISTS "Users can update their own marketing campaigns" ON public.marketing_campaigns;
DROP POLICY IF EXISTS "Users can delete their own marketing campaigns" ON public.marketing_campaigns;

DROP POLICY IF EXISTS "Users can view their own commission rates" ON public.commission_rates;
DROP POLICY IF EXISTS "Users can insert their own commission rates" ON public.commission_rates;
DROP POLICY IF EXISTS "Users can update their own commission rates" ON public.commission_rates;
DROP POLICY IF EXISTS "Users can delete their own commission rates" ON public.commission_rates;

DROP POLICY IF EXISTS "Users can view their own financial book" ON public.financial_book;
DROP POLICY IF EXISTS "Users can insert their own financial book" ON public.financial_book;
DROP POLICY IF EXISTS "Users can update their own financial book" ON public.financial_book;
DROP POLICY IF EXISTS "Users can delete their own financial book" ON public.financial_book;

-- Enable RLS on all tables
ALTER TABLE public.business_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.current_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commission_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_book ENABLE ROW LEVEL SECURITY;

-- Create comprehensive RLS policies for business_goals
CREATE POLICY "Users can view their own business goals"
ON public.business_goals FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own business goals"
ON public.business_goals FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own business goals"
ON public.business_goals FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own business goals"
ON public.business_goals FOR DELETE
USING (auth.uid() = user_id);

-- Create comprehensive RLS policies for current_values
CREATE POLICY "Users can view their own current values"
ON public.current_values FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own current values"
ON public.current_values FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own current values"
ON public.current_values FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own current values"
ON public.current_values FOR DELETE
USING (auth.uid() = user_id);

-- Create comprehensive RLS policies for client_metrics
CREATE POLICY "Users can view their own client metrics"
ON public.client_metrics FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own client metrics"
ON public.client_metrics FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own client metrics"
ON public.client_metrics FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own client metrics"
ON public.client_metrics FOR DELETE
USING (auth.uid() = user_id);

-- Create comprehensive RLS policies for marketing_campaigns
CREATE POLICY "Users can view their own marketing campaigns"
ON public.marketing_campaigns FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own marketing campaigns"
ON public.marketing_campaigns FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own marketing campaigns"
ON public.marketing_campaigns FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own marketing campaigns"
ON public.marketing_campaigns FOR DELETE
USING (auth.uid() = user_id);

-- Create comprehensive RLS policies for commission_rates
CREATE POLICY "Users can view their own commission rates"
ON public.commission_rates FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own commission rates"
ON public.commission_rates FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own commission rates"
ON public.commission_rates FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own commission rates"
ON public.commission_rates FOR DELETE
USING (auth.uid() = user_id);

-- Create comprehensive RLS policies for financial_book
CREATE POLICY "Users can view their own financial book"
ON public.financial_book FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own financial book"
ON public.financial_book FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own financial book"
ON public.financial_book FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own financial book"
ON public.financial_book FOR DELETE
USING (auth.uid() = user_id);

-- Verify the policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('business_goals', 'current_values', 'client_metrics', 'marketing_campaigns', 'commission_rates', 'financial_book')
ORDER BY tablename, policyname;
