-- Verification script for Missing Money Reports and Behavior Scorecard setup
-- Run this in Supabase SQL Editor to verify your setup

-- Check Missing Money Reports table
SELECT 
  'Missing Money Reports Table' as check_name,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'missing_money_reports')
    THEN '✓ EXISTS'
    ELSE '✗ MISSING'
  END as status;

-- Check Missing Money Reports RLS
SELECT 
  'Missing Money Reports RLS' as check_name,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname = 'public' 
      AND tablename = 'missing_money_reports'
    )
    THEN '✓ ENABLED'
    ELSE '✗ MISSING'
  END as status;

-- Check Behavior Scorecard tables
SELECT 
  'Scorecard Roles Table' as check_name,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'scorecard_roles')
    THEN '✓ EXISTS'
    ELSE '✗ MISSING'
  END as status;

SELECT 
  'Scorecard Metrics Table' as check_name,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'scorecard_metrics')
    THEN '✓ EXISTS'
    ELSE '✗ MISSING'
  END as status;

SELECT 
  'Scorecard Weekly Data Table' as check_name,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'scorecard_weekly_data')
    THEN '✓ EXISTS'
    ELSE '✗ MISSING'
  END as status;

SELECT 
  'Scorecard Monthly Summaries Table' as check_name,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'scorecard_monthly_summaries')
    THEN '✓ EXISTS'
    ELSE '✗ MISSING'
  END as status;

SELECT 
  'Scorecard Metric Scores Table' as check_name,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'scorecard_metric_scores')
    THEN '✓ EXISTS'
    ELSE '✗ MISSING'
  END as status;

SELECT 
  'Company Summaries Table' as check_name,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'company_summaries')
    THEN '✓ EXISTS'
    ELSE '✗ MISSING'
  END as status;

-- Check update_updated_at_column function
SELECT 
  'update_updated_at_column Function' as check_name,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_proc p
      JOIN pg_namespace n ON p.pronamespace = n.oid
      WHERE n.nspname = 'public' 
      AND p.proname = 'update_updated_at_column'
    )
    THEN '✓ EXISTS'
    ELSE '✗ MISSING'
  END as status;

-- Check RLS is enabled on all tables
SELECT 
  tablename as table_name,
  CASE 
    WHEN rowsecurity THEN '✓ ENABLED'
    ELSE '✗ DISABLED'
  END as rls_status
FROM pg_tables t
JOIN pg_class c ON c.relname = t.tablename
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
AND tablename IN (
  'missing_money_reports',
  'scorecard_roles',
  'scorecard_metrics',
  'scorecard_weekly_data',
  'scorecard_monthly_summaries',
  'scorecard_metric_scores',
  'company_summaries'
)
ORDER BY tablename;

-- Count RLS policies for each table
SELECT 
  tablename,
  COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN (
  'missing_money_reports',
  'scorecard_roles',
  'scorecard_metrics',
  'scorecard_weekly_data',
  'scorecard_monthly_summaries',
  'scorecard_metric_scores',
  'company_summaries'
)
GROUP BY tablename
ORDER BY tablename;


























