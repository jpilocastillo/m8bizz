-- Add year field to advisor basecamp tables to support multiple years of data
-- Migration: 20250101000000_add_year_to_advisor_basecamp_tables.sql

-- Add year column to business_goals table
ALTER TABLE public.business_goals 
ADD COLUMN IF NOT EXISTS year integer NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE);

-- Drop the old unique constraint on user_id
ALTER TABLE public.business_goals 
DROP CONSTRAINT IF EXISTS business_goals_user_id_key;

-- Add new unique constraint on (user_id, year)
ALTER TABLE public.business_goals 
ADD CONSTRAINT business_goals_user_id_year_unique UNIQUE (user_id, year);

-- Add year column to current_values table
ALTER TABLE public.current_values 
ADD COLUMN IF NOT EXISTS year integer NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE);

-- Drop the old unique constraint on user_id
ALTER TABLE public.current_values 
DROP CONSTRAINT IF EXISTS current_values_user_id_key;

-- Add new unique constraint on (user_id, year)
ALTER TABLE public.current_values 
ADD CONSTRAINT current_values_user_id_year_unique UNIQUE (user_id, year);

-- Add year column to client_metrics table
ALTER TABLE public.client_metrics 
ADD COLUMN IF NOT EXISTS year integer NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE);

-- Drop the old unique constraint on user_id
ALTER TABLE public.client_metrics 
DROP CONSTRAINT IF EXISTS client_metrics_user_id_key;

-- Add new unique constraint on (user_id, year)
ALTER TABLE public.client_metrics 
ADD CONSTRAINT client_metrics_user_id_year_unique UNIQUE (user_id, year);

-- Add year column to commission_rates table
ALTER TABLE public.commission_rates 
ADD COLUMN IF NOT EXISTS year integer NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE);

-- Drop the old unique constraint on user_id
ALTER TABLE public.commission_rates 
DROP CONSTRAINT IF EXISTS commission_rates_user_id_key;

-- Add new unique constraint on (user_id, year)
ALTER TABLE public.commission_rates 
ADD CONSTRAINT commission_rates_user_id_year_unique UNIQUE (user_id, year);

-- Add year column to financial_book table
ALTER TABLE public.financial_book 
ADD COLUMN IF NOT EXISTS year integer NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE);

-- Drop the old unique constraint on user_id
ALTER TABLE public.financial_book 
DROP CONSTRAINT IF EXISTS financial_book_user_id_key;

-- Add new unique constraint on (user_id, year)
ALTER TABLE public.financial_book 
ADD CONSTRAINT financial_book_user_id_year_unique UNIQUE (user_id, year);

-- Add year column to financial_options table (if it exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'financial_options') THEN
        ALTER TABLE public.financial_options 
        ADD COLUMN IF NOT EXISTS year integer NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE);

        -- Drop the old unique constraint on user_id if it exists
        ALTER TABLE public.financial_options 
        DROP CONSTRAINT IF EXISTS financial_options_user_id_key;

        -- Add new unique constraint on (user_id, year)
        ALTER TABLE public.financial_options 
        ADD CONSTRAINT financial_options_user_id_year_unique UNIQUE (user_id, year);
    END IF;
END $$;

-- Add indexes for better performance with year filtering
CREATE INDEX IF NOT EXISTS idx_business_goals_user_id_year ON public.business_goals(user_id, year);
CREATE INDEX IF NOT EXISTS idx_current_values_user_id_year ON public.current_values(user_id, year);
CREATE INDEX IF NOT EXISTS idx_client_metrics_user_id_year ON public.client_metrics(user_id, year);
CREATE INDEX IF NOT EXISTS idx_commission_rates_user_id_year ON public.commission_rates(user_id, year);
CREATE INDEX IF NOT EXISTS idx_financial_book_user_id_year ON public.financial_book(user_id, year);

-- Add index for financial_options if table exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'financial_options') THEN
        CREATE INDEX IF NOT EXISTS idx_financial_options_user_id_year ON public.financial_options(user_id, year);
    END IF;
END $$;

