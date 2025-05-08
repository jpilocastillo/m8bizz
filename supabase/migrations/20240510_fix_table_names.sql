-- Drop the old table and its policies
DROP TABLE IF EXISTS event_financial_production CASCADE;

-- Drop old policies if they exist
DROP POLICY IF EXISTS "Users can view their own event financial production" ON financial_production;
DROP POLICY IF EXISTS "Users can insert their own event financial production" ON financial_production;
DROP POLICY IF EXISTS "Users can update their own event financial production" ON financial_production;
DROP POLICY IF EXISTS "Users can delete their own event financial production" ON financial_production; 