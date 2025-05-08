-- Add missing columns to financial_production table
ALTER TABLE financial_production
ADD COLUMN IF NOT EXISTS annuity_commission DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS life_insurance_commission DECIMAL(10,2) DEFAULT 0;

-- Update the total calculation to include the new columns
ALTER TABLE financial_production
DROP COLUMN IF EXISTS total;

ALTER TABLE financial_production
ADD COLUMN total DECIMAL(10,2) GENERATED ALWAYS AS (
    COALESCE(annuity_premium, 0) +
    COALESCE(life_insurance_premium, 0) +
    COALESCE(aum, 0) +
    COALESCE(financial_planning, 0) +
    COALESCE(annuity_commission, 0) +
    COALESCE(life_insurance_commission, 0) +
    COALESCE(aum_fees, 0)
) STORED; 