-- Create tables for marketing events system
-- Update existing users to remove approval status
UPDATE auth.users 
SET raw_user_meta_data = raw_user_meta_data - 'approval_status'
WHERE raw_user_meta_data ? 'approval_status';

-- Drop approval_status column from profiles table if it exists
ALTER TABLE IF EXISTS profiles DROP COLUMN IF EXISTS approval_status;

-- Create the marketing events table
CREATE TABLE IF NOT EXISTS marketing_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    date DATE NOT NULL,
    location TEXT NOT NULL,
    marketing_type TEXT NOT NULL,
    topic TEXT NOT NULL,
    time TEXT,
    age_range TEXT,
    mile_radius TEXT,
    income_assets TEXT,
    status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create the marketing expenses table
CREATE TABLE IF NOT EXISTS marketing_expenses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id UUID REFERENCES marketing_events(id) ON DELETE CASCADE,
    advertising_cost DECIMAL(10,2) DEFAULT 0,
    food_venue_cost DECIMAL(10,2) DEFAULT 0,
    other_costs DECIMAL(10,2) DEFAULT 0,
    total_cost DECIMAL(10,2) GENERATED ALWAYS AS (advertising_cost + food_venue_cost + other_costs) STORED,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create the event attendance table
CREATE TABLE IF NOT EXISTS event_attendance (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id UUID REFERENCES marketing_events(id) ON DELETE CASCADE,
    registrant_responses INTEGER DEFAULT 0,
    confirmations INTEGER DEFAULT 0,
    attendees INTEGER DEFAULT 0,
    clients_from_event INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create the event appointments table
CREATE TABLE IF NOT EXISTS event_appointments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id UUID REFERENCES marketing_events(id) ON DELETE CASCADE,
    set_at_event INTEGER DEFAULT 0,
    set_after_event INTEGER DEFAULT 0,
    first_appointment_attended INTEGER DEFAULT 0,
    first_appointment_no_shows INTEGER DEFAULT 0,
    second_appointment_attended INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create the event financial production table
CREATE TABLE IF NOT EXISTS event_financial_production (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id UUID REFERENCES marketing_events(id) ON DELETE CASCADE,
    annuity_premium DECIMAL(10,2) DEFAULT 0,
    life_insurance_premium DECIMAL(10,2) DEFAULT 0,
    aum DECIMAL(10,2) DEFAULT 0,
    financial_planning DECIMAL(10,2) DEFAULT 0,
    annuities_sold INTEGER DEFAULT 0,
    life_policies_sold INTEGER DEFAULT 0,
    annuity_commission DECIMAL(10,2) DEFAULT 0,
    life_insurance_commission DECIMAL(10,2) DEFAULT 0,
    aum_fees DECIMAL(10,2) DEFAULT 0,
    total DECIMAL(10,2) GENERATED ALWAYS AS (annuity_premium + life_insurance_premium + aum + financial_planning) STORED,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own events" ON marketing_events;
DROP POLICY IF EXISTS "Users can insert their own events" ON marketing_events;
DROP POLICY IF EXISTS "Users can update their own events" ON marketing_events;
DROP POLICY IF EXISTS "Users can delete their own events" ON marketing_events;

DROP POLICY IF EXISTS "Users can view their own event expenses" ON marketing_expenses;
DROP POLICY IF EXISTS "Users can insert their own event expenses" ON marketing_expenses;
DROP POLICY IF EXISTS "Users can update their own event expenses" ON marketing_expenses;
DROP POLICY IF EXISTS "Users can delete their own event expenses" ON marketing_expenses;

DROP POLICY IF EXISTS "Users can view their own event attendance" ON event_attendance;
DROP POLICY IF EXISTS "Users can insert their own event attendance" ON event_attendance;
DROP POLICY IF EXISTS "Users can update their own event attendance" ON event_attendance;
DROP POLICY IF EXISTS "Users can delete their own event attendance" ON event_attendance;

DROP POLICY IF EXISTS "Users can view their own event appointments" ON event_appointments;
DROP POLICY IF EXISTS "Users can insert their own event appointments" ON event_appointments;
DROP POLICY IF EXISTS "Users can update their own event appointments" ON event_appointments;
DROP POLICY IF EXISTS "Users can delete their own event appointments" ON event_appointments;

DROP POLICY IF EXISTS "Users can view their own event financial production" ON event_financial_production;
DROP POLICY IF EXISTS "Users can insert their own event financial production" ON event_financial_production;
DROP POLICY IF EXISTS "Users can update their own event financial production" ON event_financial_production;
DROP POLICY IF EXISTS "Users can delete their own event financial production" ON event_financial_production;

-- Enable RLS
ALTER TABLE marketing_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_financial_production ENABLE ROW LEVEL SECURITY;

-- Marketing events policies
CREATE POLICY "Users can view their own events"
    ON marketing_events FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own events"
    ON marketing_events FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own events"
    ON marketing_events FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own events"
    ON marketing_events FOR DELETE
    USING (auth.uid() = user_id);

-- Marketing expenses policies
CREATE POLICY "Users can view their own event expenses"
    ON marketing_expenses FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM marketing_events
        WHERE marketing_events.id = marketing_expenses.event_id
        AND marketing_events.user_id = auth.uid()
    ));

CREATE POLICY "Users can insert their own event expenses"
    ON marketing_expenses FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM marketing_events
        WHERE marketing_events.id = marketing_expenses.event_id
        AND marketing_events.user_id = auth.uid()
    ));

CREATE POLICY "Users can update their own event expenses"
    ON marketing_expenses FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM marketing_events
        WHERE marketing_events.id = marketing_expenses.event_id
        AND marketing_events.user_id = auth.uid()
    ));

CREATE POLICY "Users can delete their own event expenses"
    ON marketing_expenses FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM marketing_events
        WHERE marketing_events.id = marketing_expenses.event_id
        AND marketing_events.user_id = auth.uid()
    ));

-- Event attendance policies
CREATE POLICY "Users can view their own event attendance"
    ON event_attendance FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM marketing_events
        WHERE marketing_events.id = event_attendance.event_id
        AND marketing_events.user_id = auth.uid()
    ));

CREATE POLICY "Users can insert their own event attendance"
    ON event_attendance FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM marketing_events
        WHERE marketing_events.id = event_attendance.event_id
        AND marketing_events.user_id = auth.uid()
    ));

CREATE POLICY "Users can update their own event attendance"
    ON event_attendance FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM marketing_events
        WHERE marketing_events.id = event_attendance.event_id
        AND marketing_events.user_id = auth.uid()
    ));

CREATE POLICY "Users can delete their own event attendance"
    ON event_attendance FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM marketing_events
        WHERE marketing_events.id = event_attendance.event_id
        AND marketing_events.user_id = auth.uid()
    ));

-- Event appointments policies
CREATE POLICY "Users can view their own event appointments"
    ON event_appointments FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM marketing_events
        WHERE marketing_events.id = event_appointments.event_id
        AND marketing_events.user_id = auth.uid()
    ));

CREATE POLICY "Users can insert their own event appointments"
    ON event_appointments FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM marketing_events
        WHERE marketing_events.id = event_appointments.event_id
        AND marketing_events.user_id = auth.uid()
    ));

CREATE POLICY "Users can update their own event appointments"
    ON event_appointments FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM marketing_events
        WHERE marketing_events.id = event_appointments.event_id
        AND marketing_events.user_id = auth.uid()
    ));

CREATE POLICY "Users can delete their own event appointments"
    ON event_appointments FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM marketing_events
        WHERE marketing_events.id = event_appointments.event_id
        AND marketing_events.user_id = auth.uid()
    ));

-- Event financial production policies
CREATE POLICY "Users can view their own event financial production"
    ON event_financial_production FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM marketing_events
        WHERE marketing_events.id = event_financial_production.event_id
        AND marketing_events.user_id = auth.uid()
    ));

CREATE POLICY "Users can insert their own event financial production"
    ON event_financial_production FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM marketing_events
        WHERE marketing_events.id = event_financial_production.event_id
        AND marketing_events.user_id = auth.uid()
    ));

CREATE POLICY "Users can update their own event financial production"
    ON event_financial_production FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM marketing_events
        WHERE marketing_events.id = event_financial_production.event_id
        AND marketing_events.user_id = auth.uid()
    ));

CREATE POLICY "Users can delete their own event financial production"
    ON event_financial_production FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM marketing_events
        WHERE marketing_events.id = event_financial_production.event_id
        AND marketing_events.user_id = auth.uid()
    ));

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_marketing_events_updated_at ON marketing_events;
DROP TRIGGER IF EXISTS update_marketing_expenses_updated_at ON marketing_expenses;
DROP TRIGGER IF EXISTS update_event_attendance_updated_at ON event_attendance;
DROP TRIGGER IF EXISTS update_event_appointments_updated_at ON event_appointments;
DROP TRIGGER IF EXISTS update_event_financial_production_updated_at ON event_financial_production;

-- Create triggers for updated_at
CREATE TRIGGER update_marketing_events_updated_at
    BEFORE UPDATE ON marketing_events
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_marketing_expenses_updated_at
    BEFORE UPDATE ON marketing_expenses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_event_attendance_updated_at
    BEFORE UPDATE ON event_attendance
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_event_appointments_updated_at
    BEFORE UPDATE ON event_appointments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_event_financial_production_updated_at
    BEFORE UPDATE ON event_financial_production
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 