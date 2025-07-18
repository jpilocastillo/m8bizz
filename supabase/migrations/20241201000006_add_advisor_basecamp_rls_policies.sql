-- Add RLS policies for advisor basecamp tables
-- Migration: 20241201000006_add_advisor_basecamp_rls_policies.sql

-- Enable RLS for advisor basecamp tables
ALTER TABLE public.business_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.current_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commission_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_book ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
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

-- Create policies for business_goals table
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

-- Create policies for current_values table
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

-- Create policies for client_metrics table
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

-- Create policies for marketing_campaigns table
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

-- Create policies for commission_rates table
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

-- Create policies for financial_book table
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