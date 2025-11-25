import { createClient } from "@supabase/supabase-js"
import * as dotenv from "dotenv"

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' })
// Also try from parent directory if running from scripts folder
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  dotenv.config({ path: '../.env.local' })
}

interface CostCenter {
  id: string
  name: string
  current: number
  proposed: number
  color: string
}

async function populateMissingMoneyReport() {
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

  const userEmail = "jazminpilo@gmail.com"

  try {
    console.log(`Looking for user: ${userEmail}`)

    // Get user by email
    const { data: { users }, error: userError } = await supabase.auth.admin.listUsers()
    
    if (userError) {
      console.error("Error listing users:", userError.message)
      process.exit(1)
    }

    const user = users.find(u => u.email === userEmail)
    
    if (!user) {
      console.error(`User with email ${userEmail} not found`)
      process.exit(1)
    }

    console.log(`✅ Found user: ${user.email} (${user.id})`)

    // Create sample cost centers with realistic data
    const costCenterColors = [
      "#16a34a", "#ea580c", "#dc2626", "#9333ea", "#a3a3a3", 
      "#f97316", "#6b7280", "#3b82f6", "#8b5cf6", "#ec4899",
      "#14b8a6", "#f59e0b", "#ef4444", "#6366f1", "#10b981"
    ]

    const sampleCostCenters: CostCenter[] = [
      {
        id: `cost-center-${Date.now()}-1`,
        name: "Office Rent & Utilities",
        current: 125000,
        proposed: 95000,
        color: costCenterColors[0]
      },
      {
        id: `cost-center-${Date.now()}-2`,
        name: "Marketing & Advertising",
        current: 85000,
        proposed: 65000,
        color: costCenterColors[1]
      },
      {
        id: `cost-center-${Date.now()}-3`,
        name: "Software Subscriptions",
        current: 45000,
        proposed: 32000,
        color: costCenterColors[2]
      },
      {
        id: `cost-center-${Date.now()}-4`,
        name: "Professional Services",
        current: 95000,
        proposed: 75000,
        color: costCenterColors[3]
      },
      {
        id: `cost-center-${Date.now()}-5`,
        name: "Employee Benefits",
        current: 180000,
        proposed: 150000,
        color: costCenterColors[4]
      },
      {
        id: `cost-center-${Date.now()}-6`,
        name: "Travel & Entertainment",
        current: 35000,
        proposed: 25000,
        color: costCenterColors[5]
      },
      {
        id: `cost-center-${Date.now()}-7`,
        name: "Insurance Premiums",
        current: 42000,
        proposed: 35000,
        color: costCenterColors[6]
      },
      {
        id: `cost-center-${Date.now()}-8`,
        name: "Equipment & Maintenance",
        current: 28000,
        proposed: 20000,
        color: costCenterColors[7]
      },
      {
        id: `cost-center-${Date.now()}-9`,
        name: "Training & Development",
        current: 22000,
        proposed: 18000,
        color: costCenterColors[8]
      },
      {
        id: `cost-center-${Date.now()}-10`,
        name: "Miscellaneous Expenses",
        current: 15000,
        proposed: 10000,
        color: costCenterColors[9]
      }
    ]

    // Calculate totals
    const oneYearTotal = sampleCostCenters.reduce((sum, center) => {
      const difference = center.proposed - center.current
      return sum + difference
    }, 0)
    
    const fiveYearTotal = oneYearTotal * 5
    const tenYearTotal = oneYearTotal * 10

    console.log(`\n📊 Sample Data Summary:`)
    console.log(`   Cost Centers: ${sampleCostCenters.length}`)
    console.log(`   1 Year Total: $${oneYearTotal.toLocaleString()}`)
    console.log(`   5 Year Total: $${fiveYearTotal.toLocaleString()}`)
    console.log(`   10 Year Total: $${tenYearTotal.toLocaleString()}`)

    // Check if report already exists
    const { data: existingReport, error: checkError } = await supabase
      .from('missing_money_reports')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (checkError) {
      console.error("Error checking for existing report:", checkError.message)
      process.exit(1)
    }

    const reportData = {
      user_id: user.id,
      cost_centers: sampleCostCenters as any,
      one_year_total: oneYearTotal,
      five_year_total: fiveYearTotal,
      ten_year_total: tenYearTotal
    }

    if (existingReport) {
      // Update existing report
      console.log("\n📝 Updating existing missing money report...")
      const { error: updateError } = await supabase
        .from('missing_money_reports')
        .update(reportData)
        .eq('user_id', user.id)

      if (updateError) {
        console.error("Error updating missing money report:", updateError.message)
        process.exit(1)
      }

      console.log("✅ Missing money report updated successfully!")
    } else {
      // Insert new report
      console.log("\n📝 Creating new missing money report...")
      const { error: insertError } = await supabase
        .from('missing_money_reports')
        .insert(reportData)

      if (insertError) {
        console.error("Error creating missing money report:", insertError.message)
        process.exit(1)
      }

      console.log("✅ Missing money report created successfully!")
    }

    console.log("\n✅ Sample data populated successfully!")
    console.log(`\nCost Centers added:`)
    sampleCostCenters.forEach((center, index) => {
      const difference = center.proposed - center.current
      const savings = Math.abs(difference)
      console.log(`   ${index + 1}. ${center.name}`)
      console.log(`      Current: $${center.current.toLocaleString()}`)
      console.log(`      Proposed: $${center.proposed.toLocaleString()}`)
      console.log(`      Potential Savings: $${savings.toLocaleString()}/year`)
    })

  } catch (error) {
    console.error("Error populating missing money report:", error)
    process.exit(1)
  }
}

populateMissingMoneyReport().catch(console.error)

