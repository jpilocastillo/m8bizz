# Supabase Setup for Missing Money Reports and Business Behavior Scorecards

This document provides instructions for setting up the Supabase database tables for Missing Money Reports and Business Behavior Scorecards.

## Prerequisites

- Access to your Supabase project dashboard
- SQL Editor access in Supabase

## Migration Files

The following migration files need to be applied:

1. **Missing Money Reports**: `supabase/migrations/20241221000000_create_missing_money_reports.sql`
2. **Behavior Scorecards**: `supabase/migrations/20241222000000_create_behavior_scorecard_tables.sql`

## Setup Instructions

### Option 1: Using Supabase Dashboard (Recommended)

1. Log in to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of each migration file
4. Paste and run each migration in order:
   - First: `20241221000000_create_missing_money_reports.sql`
   - Second: `20241222000000_create_behavior_scorecard_tables.sql`
5. Verify the tables were created by checking the **Table Editor**

### Option 2: Using Supabase CLI

If you have Supabase CLI installed:

```bash
# Link to your project (if not already linked)
supabase link --project-ref your-project-ref

# Apply migrations
supabase db push
```

## Verification

After running the migrations, verify the setup:

### Missing Money Reports

Check that the following table exists:
- `public.missing_money_reports`

Verify RLS policies:
- Users can view their own missing money reports
- Users can insert their own missing money reports
- Users can update their own missing money reports
- Users can delete their own missing money reports

### Behavior Scorecards

Check that the following tables exist:
- `public.scorecard_roles`
- `public.scorecard_metrics`
- `public.scorecard_weekly_data`
- `public.scorecard_monthly_summaries`
- `public.scorecard_metric_scores`
- `public.company_summaries`

All tables should have RLS enabled with appropriate policies.

## Troubleshooting

### If tables already exist

The migrations use `CREATE TABLE IF NOT EXISTS`, so they're safe to run multiple times. However, if you need to recreate them:

1. Drop the tables (be careful - this will delete data!)
2. Re-run the migrations

### If RLS policies fail

Make sure the `update_updated_at_column()` function exists. It should be created in the initial schema migration, but if it's missing, the behavior scorecard migration will create it.

### Common Issues

1. **Permission errors**: Make sure you're running migrations as a database admin
2. **Function not found**: The `update_updated_at_column()` function should be created automatically, but if it's missing, check the initial schema migration
3. **RLS blocking access**: Verify that RLS policies are correctly set up and that users are authenticated

## Testing

After setup, test the functionality:

1. **Missing Money Reports**:
   - Navigate to `/tools/missing-money` or `/tools/client-missing-money-report`
   - Try creating and saving a report
   - Verify data persists after refresh

2. **Behavior Scorecards**:
   - Navigate to `/tools/behavior-scorecard`
   - Create roles and metrics
   - Add weekly data
   - Verify monthly summaries are calculated

## Support

If you encounter issues:
1. Check the Supabase logs in the dashboard
2. Verify your database connection settings
3. Ensure all migrations have been applied in order
4. Check that RLS policies are correctly configured





























