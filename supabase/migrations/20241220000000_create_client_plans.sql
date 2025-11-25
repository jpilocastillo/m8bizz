-- Create client_plans table
CREATE TABLE IF NOT EXISTS client_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_name TEXT NOT NULL,
  plan_name TEXT NOT NULL,
  plan_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_client_plans_user_id ON client_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_client_plans_created_at ON client_plans(created_at DESC);

-- Enable Row Level Security
ALTER TABLE client_plans ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own client plans" ON client_plans
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own client plans" ON client_plans
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own client plans" ON client_plans
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own client plans" ON client_plans
  FOR DELETE USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_client_plans_updated_at
  BEFORE UPDATE ON client_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();









