-- Add frequency and total_cost_of_event columns to marketing_campaigns table

-- Add frequency column
ALTER TABLE public.marketing_campaigns 
ADD COLUMN IF NOT EXISTS frequency text CHECK (frequency IN ('Monthly', 'Quarterly', 'Semi-Annual', 'Annual'));

-- Add total_cost_of_event column
ALTER TABLE public.marketing_campaigns 
ADD COLUMN IF NOT EXISTS total_cost_of_event decimal(10,2);

-- Add comment for documentation
COMMENT ON COLUMN public.marketing_campaigns.frequency IS 'Campaign frequency: Monthly, Quarterly, Semi-Annual, or Annual';
COMMENT ON COLUMN public.marketing_campaigns.total_cost_of_event IS 'Auto-calculated: (budget + food_costs) / events';

