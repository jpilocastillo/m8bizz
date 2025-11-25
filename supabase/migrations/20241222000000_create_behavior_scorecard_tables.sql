-- Create behavior scorecard tables
-- Migration: 20241222000000_create_behavior_scorecard_tables.sql

-- Create scorecard_roles table to define the four roles
CREATE TABLE IF NOT EXISTS public.scorecard_roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role_name TEXT NOT NULL CHECK (role_name IN ('Marketing Position', 'Client Coordinator', 'Office Manager', 'Business Owner')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, role_name)
);

-- Create scorecard_metrics table to define metrics for each role
CREATE TABLE IF NOT EXISTS public.scorecard_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  role_id UUID NOT NULL REFERENCES public.scorecard_roles(id) ON DELETE CASCADE,
  metric_name TEXT NOT NULL,
  metric_type TEXT NOT NULL CHECK (metric_type IN ('count', 'currency', 'percentage', 'time', 'rating_1_5', 'rating_scale')),
  goal_value DECIMAL(15,2),
  is_inverted BOOLEAN DEFAULT FALSE, -- For metrics where lower is better (e.g., processing time, error rate)
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create scorecard_weekly_data table for weekly tracking
CREATE TABLE IF NOT EXISTS public.scorecard_weekly_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  metric_id UUID NOT NULL REFERENCES public.scorecard_metrics(id) ON DELETE CASCADE,
  week_number INTEGER NOT NULL CHECK (week_number >= 1 AND week_number <= 52),
  year INTEGER NOT NULL,
  actual_value DECIMAL(15,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(metric_id, week_number, year)
);

-- Create scorecard_monthly_summaries table for monthly scorecard calculations
CREATE TABLE IF NOT EXISTS public.scorecard_monthly_summaries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  role_id UUID NOT NULL REFERENCES public.scorecard_roles(id) ON DELETE CASCADE,
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  year INTEGER NOT NULL,
  average_grade_percentage DECIMAL(5,2),
  average_grade_letter TEXT CHECK (average_grade_letter IN ('A', 'B', 'C', 'D', 'F')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(role_id, month, year)
);

-- Create scorecard_metric_scores table to store calculated scores for each metric
CREATE TABLE IF NOT EXISTS public.scorecard_metric_scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  monthly_summary_id UUID NOT NULL REFERENCES public.scorecard_monthly_summaries(id) ON DELETE CASCADE,
  metric_id UUID NOT NULL REFERENCES public.scorecard_metrics(id) ON DELETE CASCADE,
  actual_value DECIMAL(15,2) NOT NULL,
  goal_value DECIMAL(15,2) NOT NULL,
  percentage_of_goal DECIMAL(5,2) NOT NULL,
  grade_letter TEXT NOT NULL CHECK (grade_letter IN ('A', 'B', 'C', 'D', 'F')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(monthly_summary_id, metric_id)
);

-- Create company_summaries table for overall company grade
CREATE TABLE IF NOT EXISTS public.company_summaries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  year INTEGER NOT NULL,
  company_average DECIMAL(5,2),
  company_grade TEXT CHECK (company_grade IN ('A', 'B', 'C', 'D', 'F')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, month, year)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_scorecard_roles_user_id ON public.scorecard_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_scorecard_metrics_role_id ON public.scorecard_metrics(role_id);
CREATE INDEX IF NOT EXISTS idx_scorecard_weekly_data_metric_id ON public.scorecard_weekly_data(metric_id);
CREATE INDEX IF NOT EXISTS idx_scorecard_weekly_data_year_week ON public.scorecard_weekly_data(year, week_number);
CREATE INDEX IF NOT EXISTS idx_scorecard_monthly_summaries_role_id ON public.scorecard_monthly_summaries(role_id);
CREATE INDEX IF NOT EXISTS idx_scorecard_monthly_summaries_year_month ON public.scorecard_monthly_summaries(year, month);
CREATE INDEX IF NOT EXISTS idx_scorecard_metric_scores_monthly_summary_id ON public.scorecard_metric_scores(monthly_summary_id);
CREATE INDEX IF NOT EXISTS idx_company_summaries_user_id ON public.company_summaries(user_id);
CREATE INDEX IF NOT EXISTS idx_company_summaries_year_month ON public.company_summaries(year, month);

-- Enable Row Level Security
ALTER TABLE public.scorecard_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scorecard_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scorecard_weekly_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scorecard_monthly_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scorecard_metric_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_summaries ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for scorecard_roles
CREATE POLICY "Users can view their own scorecard roles" ON public.scorecard_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own scorecard roles" ON public.scorecard_roles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own scorecard roles" ON public.scorecard_roles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own scorecard roles" ON public.scorecard_roles
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for scorecard_metrics (through role ownership)
CREATE POLICY "Users can view their own scorecard metrics" ON public.scorecard_metrics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.scorecard_roles
      WHERE scorecard_roles.id = scorecard_metrics.role_id
      AND scorecard_roles.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own scorecard metrics" ON public.scorecard_metrics
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.scorecard_roles
      WHERE scorecard_roles.id = scorecard_metrics.role_id
      AND scorecard_roles.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own scorecard metrics" ON public.scorecard_metrics
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.scorecard_roles
      WHERE scorecard_roles.id = scorecard_metrics.role_id
      AND scorecard_roles.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own scorecard metrics" ON public.scorecard_metrics
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.scorecard_roles
      WHERE scorecard_roles.id = scorecard_metrics.role_id
      AND scorecard_roles.user_id = auth.uid()
    )
  );

-- Create RLS policies for scorecard_weekly_data (through metric ownership)
CREATE POLICY "Users can view their own weekly data" ON public.scorecard_weekly_data
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.scorecard_metrics
      JOIN public.scorecard_roles ON scorecard_roles.id = scorecard_metrics.role_id
      WHERE scorecard_metrics.id = scorecard_weekly_data.metric_id
      AND scorecard_roles.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own weekly data" ON public.scorecard_weekly_data
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.scorecard_metrics
      JOIN public.scorecard_roles ON scorecard_roles.id = scorecard_metrics.role_id
      WHERE scorecard_metrics.id = scorecard_weekly_data.metric_id
      AND scorecard_roles.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own weekly data" ON public.scorecard_weekly_data
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.scorecard_metrics
      JOIN public.scorecard_roles ON scorecard_roles.id = scorecard_metrics.role_id
      WHERE scorecard_metrics.id = scorecard_weekly_data.metric_id
      AND scorecard_roles.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own weekly data" ON public.scorecard_weekly_data
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.scorecard_metrics
      JOIN public.scorecard_roles ON scorecard_roles.id = scorecard_metrics.role_id
      WHERE scorecard_metrics.id = scorecard_weekly_data.metric_id
      AND scorecard_roles.user_id = auth.uid()
    )
  );

-- Create RLS policies for scorecard_monthly_summaries
CREATE POLICY "Users can view their own monthly summaries" ON public.scorecard_monthly_summaries
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.scorecard_roles
      WHERE scorecard_roles.id = scorecard_monthly_summaries.role_id
      AND scorecard_roles.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own monthly summaries" ON public.scorecard_monthly_summaries
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.scorecard_roles
      WHERE scorecard_roles.id = scorecard_monthly_summaries.role_id
      AND scorecard_roles.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own monthly summaries" ON public.scorecard_monthly_summaries
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.scorecard_roles
      WHERE scorecard_roles.id = scorecard_monthly_summaries.role_id
      AND scorecard_roles.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own monthly summaries" ON public.scorecard_monthly_summaries
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.scorecard_roles
      WHERE scorecard_roles.id = scorecard_monthly_summaries.role_id
      AND scorecard_roles.user_id = auth.uid()
    )
  );

-- Create RLS policies for scorecard_metric_scores
CREATE POLICY "Users can view their own metric scores" ON public.scorecard_metric_scores
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.scorecard_monthly_summaries
      JOIN public.scorecard_roles ON scorecard_roles.id = scorecard_monthly_summaries.role_id
      WHERE scorecard_monthly_summaries.id = scorecard_metric_scores.monthly_summary_id
      AND scorecard_roles.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own metric scores" ON public.scorecard_metric_scores
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.scorecard_monthly_summaries
      JOIN public.scorecard_roles ON scorecard_roles.id = scorecard_monthly_summaries.role_id
      WHERE scorecard_monthly_summaries.id = scorecard_metric_scores.monthly_summary_id
      AND scorecard_roles.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own metric scores" ON public.scorecard_metric_scores
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.scorecard_monthly_summaries
      JOIN public.scorecard_roles ON scorecard_roles.id = scorecard_monthly_summaries.role_id
      WHERE scorecard_monthly_summaries.id = scorecard_metric_scores.monthly_summary_id
      AND scorecard_roles.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own metric scores" ON public.scorecard_metric_scores
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.scorecard_monthly_summaries
      JOIN public.scorecard_roles ON scorecard_roles.id = scorecard_monthly_summaries.role_id
      WHERE scorecard_monthly_summaries.id = scorecard_metric_scores.monthly_summary_id
      AND scorecard_roles.user_id = auth.uid()
    )
  );

-- Create RLS policies for company_summaries
CREATE POLICY "Users can view their own company summaries" ON public.company_summaries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own company summaries" ON public.company_summaries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own company summaries" ON public.company_summaries
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own company summaries" ON public.company_summaries
  FOR DELETE USING (auth.uid() = user_id);

-- Create trigger function to update updated_at (if it doesn't exist)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_scorecard_roles_updated_at
  BEFORE UPDATE ON public.scorecard_roles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scorecard_metrics_updated_at
  BEFORE UPDATE ON public.scorecard_metrics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scorecard_weekly_data_updated_at
  BEFORE UPDATE ON public.scorecard_weekly_data
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scorecard_monthly_summaries_updated_at
  BEFORE UPDATE ON public.scorecard_monthly_summaries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scorecard_metric_scores_updated_at
  BEFORE UPDATE ON public.scorecard_metric_scores
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_company_summaries_updated_at
  BEFORE UPDATE ON public.company_summaries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();





