-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own events" ON public.marketing_events;
DROP POLICY IF EXISTS "Users can insert their own events" ON public.marketing_events;
DROP POLICY IF EXISTS "Users can update their own events" ON public.marketing_events;
DROP POLICY IF EXISTS "Users can delete their own events" ON public.marketing_events;
DROP POLICY IF EXISTS "Users can view expenses for their events" ON public.marketing_expenses;
DROP POLICY IF EXISTS "Users can insert expenses for their events" ON public.marketing_expenses;
DROP POLICY IF EXISTS "Users can update expenses for their events" ON public.marketing_expenses;
DROP POLICY IF EXISTS "Users can delete expenses for their events" ON public.marketing_expenses;
DROP POLICY IF EXISTS "Users can view attendance for their events" ON public.event_attendance;
DROP POLICY IF EXISTS "Users can insert attendance for their events" ON public.event_attendance;
DROP POLICY IF EXISTS "Users can update attendance for their events" ON public.event_attendance;
DROP POLICY IF EXISTS "Users can delete attendance for their events" ON public.event_attendance;
DROP POLICY IF EXISTS "Users can view appointments for their events" ON public.event_appointments;
DROP POLICY IF EXISTS "Users can insert appointments for their events" ON public.event_appointments;
DROP POLICY IF EXISTS "Users can update appointments for their events" ON public.event_appointments;
DROP POLICY IF EXISTS "Users can delete appointments for their events" ON public.event_appointments;
DROP POLICY IF EXISTS "Users can view financial data for their events" ON public.financial_production;
DROP POLICY IF EXISTS "Users can insert financial data for their events" ON public.financial_production;
DROP POLICY IF EXISTS "Users can update financial data for their events" ON public.financial_production;
DROP POLICY IF EXISTS "Users can delete financial data for their events" ON public.financial_production;

-- Enable Row Level Security for all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_production ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles table
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id);

-- Create policies for marketing_events table
CREATE POLICY "Users can view their own events"
ON public.marketing_events FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own events"
ON public.marketing_events FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own events"
ON public.marketing_events FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own events"
ON public.marketing_events FOR DELETE
USING (auth.uid() = user_id);

-- Create policies for marketing_expenses table
CREATE POLICY "Users can view expenses for their events"
ON public.marketing_expenses FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.marketing_events
        WHERE marketing_events.id = marketing_expenses.event_id
        AND marketing_events.user_id = auth.uid()
    )
);

CREATE POLICY "Users can insert expenses for their events"
ON public.marketing_expenses FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.marketing_events
        WHERE marketing_events.id = marketing_expenses.event_id
        AND marketing_events.user_id = auth.uid()
    )
);

CREATE POLICY "Users can update expenses for their events"
ON public.marketing_expenses FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.marketing_events
        WHERE marketing_events.id = marketing_expenses.event_id
        AND marketing_events.user_id = auth.uid()
    )
);

CREATE POLICY "Users can delete expenses for their events"
ON public.marketing_expenses FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM public.marketing_events
        WHERE marketing_events.id = marketing_expenses.event_id
        AND marketing_events.user_id = auth.uid()
    )
);

-- Create policies for event_attendance table
CREATE POLICY "Users can view attendance for their events"
ON public.event_attendance FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.marketing_events
        WHERE marketing_events.id = event_attendance.event_id
        AND marketing_events.user_id = auth.uid()
    )
);

CREATE POLICY "Users can insert attendance for their events"
ON public.event_attendance FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.marketing_events
        WHERE marketing_events.id = event_attendance.event_id
        AND marketing_events.user_id = auth.uid()
    )
);

CREATE POLICY "Users can update attendance for their events"
ON public.event_attendance FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.marketing_events
        WHERE marketing_events.id = event_attendance.event_id
        AND marketing_events.user_id = auth.uid()
    )
);

CREATE POLICY "Users can delete attendance for their events"
ON public.event_attendance FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM public.marketing_events
        WHERE marketing_events.id = event_attendance.event_id
        AND marketing_events.user_id = auth.uid()
    )
);

-- Create policies for event_appointments table
CREATE POLICY "Users can view appointments for their events"
ON public.event_appointments FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.marketing_events
        WHERE marketing_events.id = event_appointments.event_id
        AND marketing_events.user_id = auth.uid()
    )
);

CREATE POLICY "Users can insert appointments for their events"
ON public.event_appointments FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.marketing_events
        WHERE marketing_events.id = event_appointments.event_id
        AND marketing_events.user_id = auth.uid()
    )
);

CREATE POLICY "Users can update appointments for their events"
ON public.event_appointments FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.marketing_events
        WHERE marketing_events.id = event_appointments.event_id
        AND marketing_events.user_id = auth.uid()
    )
);

CREATE POLICY "Users can delete appointments for their events"
ON public.event_appointments FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM public.marketing_events
        WHERE marketing_events.id = event_appointments.event_id
        AND marketing_events.user_id = auth.uid()
    )
);

-- Create policies for financial_production table
CREATE POLICY "Users can view financial data for their events"
ON public.financial_production FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.marketing_events
        WHERE marketing_events.id = financial_production.event_id
        AND marketing_events.user_id = auth.uid()
    )
);

CREATE POLICY "Users can insert financial data for their events"
ON public.financial_production FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.marketing_events
        WHERE marketing_events.id = financial_production.event_id
        AND marketing_events.user_id = auth.uid()
    )
);

CREATE POLICY "Users can update financial data for their events"
ON public.financial_production FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.marketing_events
        WHERE marketing_events.id = financial_production.event_id
        AND marketing_events.user_id = auth.uid()
    )
);

CREATE POLICY "Users can delete financial data for their events"
ON public.financial_production FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM public.marketing_events
        WHERE marketing_events.id = financial_production.event_id
        AND marketing_events.user_id = auth.uid()
    )
); 