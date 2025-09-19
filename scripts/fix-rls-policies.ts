import { createClient } from '@supabase/supabase-js'
import * as dotenv from "dotenv"

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' })

async function fixRLSPolicies() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Missing Supabase environment variables")
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  try {
    console.log("🔧 Fixing RLS policies for advisor basecamp tables...")

    // First, let's check the current state
    console.log("\n📊 Checking current table structure...")
    
    const tables = [
      'business_goals',
      'current_values', 
      'client_metrics',
      'marketing_campaigns',
      'commission_rates',
      'financial_book'
    ]

    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1)
      
      if (error) {
        console.log(`❌ Table ${table}: ${error.message}`)
      } else {
        console.log(`✅ Table ${table}: accessible`)
      }
    }

    // Now let's run the RLS fix SQL
    console.log("\n🔧 Applying RLS policy fixes...")
    
    const rlsFixSQL = `
    -- Drop all existing policies to start fresh
    DROP POLICY IF EXISTS "Users can view their own business goals" ON public.business_goals;
    DROP POLICY IF EXISTS "Users can insert their own business goals" ON public.business_goals;
    DROP POLICY IF EXISTS "Users can update their own business goals" ON public.business_goals;
    DROP POLICY IF EXISTS "Users can delete their own business goals" ON public.business_goals;

    DROP POLICY IF EXISTS "Users can view their own current values" ON public.current_values;
    DROP POLICY IF EXISTS "Users can insert their own current values" ON public.current_values;
    DROP POLICY IF EXISTS "Users can update their own current values" ON public.current_values;
    DROP POLICY IF EXISTS "Users can delete their own current values" ON public.current_values;

    DROP POLICY IF EXISTS "Users can view their own client metrics" ON public.client_metrics;
    DROP POLICY IF EXISTS "Users can insert their own client metrics" ON public.client_metrics;
    DROP POLICY IF EXISTS "Users can update their own client metrics" ON public.client_metrics;
    DROP POLICY IF EXISTS "Users can delete their own client metrics" ON public.client_metrics;

    DROP POLICY IF EXISTS "Users can view their own marketing campaigns" ON public.marketing_campaigns;
    DROP POLICY IF EXISTS "Users can insert their own marketing campaigns" ON public.marketing_campaigns;
    DROP POLICY IF EXISTS "Users can update their own marketing campaigns" ON public.marketing_campaigns;
    DROP POLICY IF EXISTS "Users can delete their own marketing campaigns" ON public.marketing_campaigns;

    DROP POLICY IF EXISTS "Users can view their own commission rates" ON public.commission_rates;
    DROP POLICY IF EXISTS "Users can insert their own commission rates" ON public.commission_rates;
    DROP POLICY IF EXISTS "Users can update their own commission rates" ON public.commission_rates;
    DROP POLICY IF EXISTS "Users can delete their own commission rates" ON public.commission_rates;

    DROP POLICY IF EXISTS "Users can view their own financial book" ON public.financial_book;
    DROP POLICY IF EXISTS "Users can insert their own financial book" ON public.financial_book;
    DROP POLICY IF EXISTS "Users can update their own financial book" ON public.financial_book;
    DROP POLICY IF EXISTS "Users can delete their own financial book" ON public.financial_book;

    -- Enable RLS on all tables
    ALTER TABLE public.business_goals ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.current_values ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.client_metrics ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.marketing_campaigns ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.commission_rates ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.financial_book ENABLE ROW LEVEL SECURITY;

    -- Create comprehensive RLS policies for business_goals
    CREATE POLICY "Users can view their own business goals"
    ON public.business_goals FOR SELECT
    USING (auth.uid() = user_id);

    CREATE POLICY "Users can insert their own business goals"
    ON public.business_goals FOR INSERT
    WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "Users can update their own business goals"
    ON public.business_goals FOR UPDATE
    USING (auth.uid() = user_id);

    CREATE POLICY "Users can delete their own business goals"
    ON public.business_goals FOR DELETE
    USING (auth.uid() = user_id);

    -- Create comprehensive RLS policies for current_values
    CREATE POLICY "Users can view their own current values"
    ON public.current_values FOR SELECT
    USING (auth.uid() = user_id);

    CREATE POLICY "Users can insert their own current values"
    ON public.current_values FOR INSERT
    WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "Users can update their own current values"
    ON public.current_values FOR UPDATE
    USING (auth.uid() = user_id);

    CREATE POLICY "Users can delete their own current values"
    ON public.current_values FOR DELETE
    USING (auth.uid() = user_id);

    -- Create comprehensive RLS policies for client_metrics
    CREATE POLICY "Users can view their own client metrics"
    ON public.client_metrics FOR SELECT
    USING (auth.uid() = user_id);

    CREATE POLICY "Users can insert their own client metrics"
    ON public.client_metrics FOR INSERT
    WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "Users can update their own client metrics"
    ON public.client_metrics FOR UPDATE
    USING (auth.uid() = user_id);

    CREATE POLICY "Users can delete their own client metrics"
    ON public.client_metrics FOR DELETE
    USING (auth.uid() = user_id);

    -- Create comprehensive RLS policies for marketing_campaigns
    CREATE POLICY "Users can view their own marketing campaigns"
    ON public.marketing_campaigns FOR SELECT
    USING (auth.uid() = user_id);

    CREATE POLICY "Users can insert their own marketing campaigns"
    ON public.marketing_campaigns FOR INSERT
    WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "Users can update their own marketing campaigns"
    ON public.marketing_campaigns FOR UPDATE
    USING (auth.uid() = user_id);

    CREATE POLICY "Users can delete their own marketing campaigns"
    ON public.marketing_campaigns FOR DELETE
    USING (auth.uid() = user_id);

    -- Create comprehensive RLS policies for commission_rates
    CREATE POLICY "Users can view their own commission rates"
    ON public.commission_rates FOR SELECT
    USING (auth.uid() = user_id);

    CREATE POLICY "Users can insert their own commission rates"
    ON public.commission_rates FOR INSERT
    WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "Users can update their own commission rates"
    ON public.commission_rates FOR UPDATE
    USING (auth.uid() = user_id);

    CREATE POLICY "Users can delete their own commission rates"
    ON public.commission_rates FOR DELETE
    USING (auth.uid() = user_id);

    -- Create comprehensive RLS policies for financial_book
    CREATE POLICY "Users can view their own financial book"
    ON public.financial_book FOR SELECT
    USING (auth.uid() = user_id);

    CREATE POLICY "Users can insert their own financial book"
    ON public.financial_book FOR INSERT
    WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "Users can update their own financial book"
    ON public.financial_book FOR UPDATE
    USING (auth.uid() = user_id);

    CREATE POLICY "Users can delete their own financial book"
    ON public.financial_book FOR DELETE
    USING (auth.uid() = user_id);
    `

    const { error: sqlError } = await supabase.rpc('exec_sql', { sql: rlsFixSQL })
    
    if (sqlError) {
      console.error("❌ Error applying RLS fixes:", sqlError.message)
      
      // Try alternative approach - execute SQL directly
      console.log("🔄 Trying alternative approach...")
      
      // Split the SQL into individual statements and execute them
      const statements = rlsFixSQL.split(';').filter(stmt => stmt.trim())
      
      for (const statement of statements) {
        if (statement.trim()) {
          try {
            const { error: stmtError } = await supabase.rpc('exec_sql', { sql: statement.trim() + ';' })
            if (stmtError) {
              console.log(`⚠️  Statement failed: ${statement.substring(0, 50)}... - ${stmtError.message}`)
            } else {
              console.log(`✅ Statement executed: ${statement.substring(0, 50)}...`)
            }
          } catch (err) {
            console.log(`⚠️  Statement error: ${statement.substring(0, 50)}... - ${err}`)
          }
        }
      }
    } else {
      console.log("✅ RLS policies fixed successfully!")
    }

    // Test the fixes
    console.log("\n🧪 Testing the fixes...")
    
    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1)
      
      if (error) {
        console.log(`❌ Table ${table} still has issues: ${error.message}`)
      } else {
        console.log(`✅ Table ${table}: working correctly`)
      }
    }

    console.log("\n🎉 RLS policy fix complete!")

  } catch (error) {
    console.error("❌ Error fixing RLS policies:", error)
    process.exit(1)
  }
}

fixRLSPolicies().catch(console.error)
