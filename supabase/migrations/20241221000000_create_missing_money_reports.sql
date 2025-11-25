-- Create missing_money_reports table
-- Migration: 20241221000000_create_missing_money_reports.sql

CREATE TABLE IF NOT EXISTS public.missing_money_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  cost_centers JSONB NOT NULL DEFAULT '[]'::jsonb,
  one_year_total DECIMAL(15,2) DEFAULT 0,
  five_year_total DECIMAL(15,2) DEFAULT 0,
  ten_year_total DECIMAL(15,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_missing_money_reports_user_id ON public.missing_money_reports(user_id);

-- Enable Row Level Security
ALTER TABLE public.missing_money_reports ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own missing money reports" ON public.missing_money_reports
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own missing money reports" ON public.missing_money_reports
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own missing money reports" ON public.missing_money_reports
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own missing money reports" ON public.missing_money_reports
  FOR DELETE USING (auth.uid() = user_id);

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_missing_money_reports_updated_at
  BEFORE UPDATE ON public.missing_money_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();






