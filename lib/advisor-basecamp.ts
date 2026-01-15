import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'

export interface BusinessGoals {
  id?: string
  user_id?: string
  year: number
  business_goal: number
  aum_goal: number
  aum_goal_percentage: number
  annuity_goal: number
  annuity_goal_percentage: number
  life_target_goal: number
  life_target_goal_percentage: number
  created_at?: string
  updated_at?: string
}

export interface CurrentValues {
  id?: string
  user_id?: string
  year: number
  current_aum: number
  current_annuity: number
  current_life_production: number
  created_at?: string
  updated_at?: string
}

export interface ClientMetrics {
  id?: string
  user_id?: string
  year: number
  avg_annuity_size: number
  avg_aum_size: number
  avg_net_worth_needed: number
  appointment_attrition: number
  avg_close_ratio: number
  annuity_closed: number
  aum_accounts: number
  clients_needed: number
  monthly_ideal_prospects: number
  appointments_per_campaign: number
  created_at?: string
  updated_at?: string
}

export interface MarketingCampaign {
  id?: string
  user_id?: string
  name: string
  budget: number
  events: number
  leads: number
  status: 'Active' | 'Planned' | 'Completed' | 'Paused'
  frequency?: 'Monthly' | 'Quarterly' | 'Semi-Annual' | 'Annual'
  cost_per_lead?: number
  cost_per_client?: number
  total_cost_of_event?: number
  food_costs?: number
  created_at?: string
  updated_at?: string
}

export interface CommissionRates {
  id?: string
  user_id?: string
  year: number
  planning_fee_rate: number
  planning_fees_count: number
  annuity_commission: number
  aum_commission: number
  life_commission: number
  trail_income_percentage: number
  created_at?: string
  updated_at?: string
}

export interface FinancialBook {
  id?: string
  user_id?: string
  year: number
  annuity_book_value: number
  aum_book_value: number
  qualified_money_value: number
  created_at?: string
  updated_at?: string
}

export interface FinancialOptions {
  id?: string
  user_id?: string
  year: number
  surrender_percent: number
  income_rider_percent: number
  free_withdrawal_percent: number
  life_insurance_percent: number
  life_strategy1_percent: number
  life_strategy2_percent: number
  ira_to_7702_percent: number
  approval_rate_percent: number
  surrender_rate: number
  income_rider_rate: number
  free_withdrawal_rate: number
  life_insurance_rate: number
  life_strategy1_rate: number
  life_strategy2_rate: number
  ira_to_7702_rate: number
  created_at?: string
  updated_at?: string
}

export interface MonthlyDataEntry {
  id?: string
  user_id?: string
  month_year: string // Format: "YYYY-MM"
  new_clients: number
  new_appointments: number
  new_leads: number
  annuity_sales: number
  aum_sales: number
  life_sales: number
  marketing_expenses: number
  notes?: string
  created_at?: string
  updated_at?: string
}

export interface AdvisorBasecampData {
  businessGoals?: BusinessGoals | null
  currentValues?: CurrentValues | null
  clientMetrics?: ClientMetrics | null
  campaigns: MarketingCampaign[]
  commissionRates?: CommissionRates | null
  financialBook?: FinancialBook | null
  financialOptions?: FinancialOptions | null
  monthlyDataEntries?: MonthlyDataEntry[]
}

class AdvisorBasecampService {
  private supabase = createClient()

  // Business Goals
  async getBusinessGoals(user: User, year: number): Promise<BusinessGoals | null> {
    const { data, error } = await this.supabase
      .from('business_goals')
      .select('*')
      .eq('user_id', user.id)
      .eq('year', year)
      .maybeSingle()

    if (error) {
      console.error('Error fetching business goals:', error)
      return null
    }

    return data
  }

  async upsertBusinessGoals(user: User, goals: BusinessGoals): Promise<BusinessGoals | null> {
    try {
      // First check if a record exists for this user and year
      const { data: existing } = await this.supabase
        .from('business_goals')
        .select('id')
        .eq('user_id', user.id)
        .eq('year', goals.year)
        .maybeSingle()

      if (existing) {
        // Update existing record
        const { data, error } = await this.supabase
          .from('business_goals')
          .update({
            ...goals,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id)
          .eq('year', goals.year)
          .select()
          .single()

        if (error) {
          console.error('Error updating business goals:', error)
          return null
        }

        return data
      } else {
        // Insert new record
        const { data, error } = await this.supabase
          .from('business_goals')
          .insert({
            user_id: user.id,
            ...goals
          })
          .select()
          .single()

        if (error) {
          console.error('Error inserting business goals:', error)
          return null
        }

        return data
      }
    } catch (error) {
      console.error('Error in upsertBusinessGoals:', error)
      return null
    }
  }

  // Current Values
  async getCurrentValues(user: User, year: number): Promise<CurrentValues | null> {
    const { data, error } = await this.supabase
      .from('current_values')
      .select('*')
      .eq('user_id', user.id)
      .eq('year', year)
      .maybeSingle()

    if (error) {
      console.error('Error fetching current values:', error)
      return null
    }

    return data
  }

  async upsertCurrentValues(user: User, values: CurrentValues): Promise<CurrentValues | null> {
    try {
      // First check if a record exists for this user and year
      const { data: existing } = await this.supabase
        .from('current_values')
        .select('id')
        .eq('user_id', user.id)
        .eq('year', values.year)
        .maybeSingle()

      if (existing) {
        // Update existing record
        const { data, error } = await this.supabase
          .from('current_values')
          .update({
            ...values,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id)
          .eq('year', values.year)
          .select()
          .single()

        if (error) {
          console.error('Error updating current values:', error)
          return null
        }

        return data
      } else {
        // Insert new record
        const { data, error } = await this.supabase
          .from('current_values')
          .insert({
            user_id: user.id,
            ...values
          })
          .select()
          .single()

        if (error) {
          console.error('Error inserting current values:', error)
          return null
        }

        return data
      }
    } catch (error) {
      console.error('Error in upsertCurrentValues:', error)
      return null
    }
  }

  // Client Metrics
  async getClientMetrics(user: User, year: number): Promise<ClientMetrics | null> {
    const { data, error } = await this.supabase
      .from('client_metrics')
      .select('*')
      .eq('user_id', user.id)
      .eq('year', year)
      .maybeSingle()

    if (error) {
      console.error('Error fetching client metrics:', error)
      return null
    }

    return data
  }

  async upsertClientMetrics(user: User, metrics: ClientMetrics): Promise<ClientMetrics | null> {
    try {
      // First check if a record exists for this user and year
      const { data: existing } = await this.supabase
        .from('client_metrics')
        .select('id')
        .eq('user_id', user.id)
        .eq('year', metrics.year)
        .maybeSingle()

      if (existing) {
        // Update existing record
        const { data, error } = await this.supabase
          .from('client_metrics')
          .update({
            ...metrics,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id)
          .eq('year', metrics.year)
          .select()
          .single()

        if (error) {
          console.error('Error updating client metrics:', error)
          return null
        }

        return data
      } else {
        // Insert new record
        const { data, error } = await this.supabase
          .from('client_metrics')
          .insert({
            user_id: user.id,
            ...metrics
          })
          .select()
          .single()

        if (error) {
          console.error('Error inserting client metrics:', error)
          return null
        }

        return data
      }
    } catch (error) {
      console.error('Error in upsertClientMetrics:', error)
      return null
    }
  }

  // Marketing Campaigns
  async getMarketingCampaigns(user: User): Promise<MarketingCampaign[]> {
    const { data, error } = await this.supabase
      .from('marketing_campaigns')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching marketing campaigns:', error)
      return []
    }

    return data || []
  }

  async createMarketingCampaign(user: User, campaign: Omit<MarketingCampaign, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<MarketingCampaign | null> {
    const { data, error } = await this.supabase
      .from('marketing_campaigns')
      .insert({
        user_id: user.id,
        ...campaign
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating marketing campaign:', error)
      return null
    }

    return data
  }

  async updateMarketingCampaign(user: User, id: string, campaign: Partial<MarketingCampaign>): Promise<MarketingCampaign | null> {
    const { data, error } = await this.supabase
      .from('marketing_campaigns')
      .update(campaign)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating marketing campaign:', error)
      return null
    }

    return data
  }

  async deleteMarketingCampaign(user: User, id: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('marketing_campaigns')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error deleting marketing campaign:', error)
      return false
    }

    return true
  }

  // Commission Rates
  async getCommissionRates(user: User, year: number): Promise<CommissionRates | null> {
    const { data, error } = await this.supabase
      .from('commission_rates')
      .select('*')
      .eq('user_id', user.id)
      .eq('year', year)
      .maybeSingle()

    if (error) {
      console.error('Error fetching commission rates:', error)
      return null
    }

    return data
  }

  async upsertCommissionRates(user: User, rates: CommissionRates): Promise<CommissionRates | null> {
    try {
      // First check if a record exists for this user and year
      const { data: existing } = await this.supabase
        .from('commission_rates')
        .select('id')
        .eq('user_id', user.id)
        .eq('year', rates.year)
        .maybeSingle()

      if (existing) {
        // Update existing record
        const { data, error } = await this.supabase
          .from('commission_rates')
          .update({
            ...rates,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id)
          .eq('year', rates.year)
          .select()
          .single()

        if (error) {
          console.error('Error updating commission rates:', error)
          return null
        }

        return data
      } else {
        // Insert new record
        const { data, error } = await this.supabase
          .from('commission_rates')
          .insert({
            user_id: user.id,
            ...rates
          })
          .select()
          .single()

        if (error) {
          console.error('Error inserting commission rates:', error)
          return null
        }

        return data
      }
    } catch (error) {
      console.error('Error in upsertCommissionRates:', error)
      return null
    }
  }

  // Financial Book
  async getFinancialBook(user: User, year: number): Promise<FinancialBook | null> {
    const { data, error } = await this.supabase
      .from('financial_book')
      .select('*')
      .eq('user_id', user.id)
      .eq('year', year)
      .maybeSingle()

    if (error) {
      console.error('Error fetching financial book:', error)
      return null
    }

    return data
  }

  async upsertFinancialBook(user: User, book: FinancialBook): Promise<FinancialBook | null> {
    try {
      // First check if a record exists for this user and year
      const { data: existing } = await this.supabase
        .from('financial_book')
        .select('id')
        .eq('user_id', user.id)
        .eq('year', book.year)
        .maybeSingle()

      if (existing) {
        // Update existing record
        const { data, error } = await this.supabase
          .from('financial_book')
          .update({
            ...book,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id)
          .eq('year', book.year)
          .select()
          .single()

        if (error) {
          console.error('Error updating financial book:', error)
          return null
        }

        return data
      } else {
        // Insert new record
        const { data, error } = await this.supabase
          .from('financial_book')
          .insert({
            user_id: user.id,
            ...book
          })
          .select()
          .single()

        if (error) {
          console.error('Error inserting financial book:', error)
          return null
        }

        return data
      }
    } catch (error) {
      console.error('Error in upsertFinancialBook:', error)
      return null
    }
  }

  // Financial Options
  async getFinancialOptions(user: User, year: number): Promise<FinancialOptions | null> {
    const { data, error } = await this.supabase
      .from('financial_options')
      .select('*')
      .eq('user_id', user.id)
      .eq('year', year)
      .maybeSingle()

    if (error) {
      console.error('Error fetching financial options:', error)
      return null
    }

    return data
  }

  async upsertFinancialOptions(user: User, options: FinancialOptions): Promise<FinancialOptions | null> {
    try {
      // First check if a record exists for this user and year
      const { data: existing } = await this.supabase
        .from('financial_options')
        .select('id')
        .eq('user_id', user.id)
        .eq('year', options.year)
        .maybeSingle()

      if (existing) {
        // Update existing record
        const { data, error } = await this.supabase
          .from('financial_options')
          .update({
            ...options,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id)
          .eq('year', options.year)
          .select()
          .single()

        if (error) {
          console.error('Error updating financial options:', error)
          return null
        }

        return data
      } else {
        // Insert new record
        const { data, error } = await this.supabase
          .from('financial_options')
          .insert({
            user_id: user.id,
            ...options
          })
          .select()
          .single()

        if (error) {
          console.error('Error inserting financial options:', error)
          return null
        }

        return data
      }
    } catch (error) {
      console.error('Error in upsertFinancialOptions:', error)
      return null
    }
  }

  // Monthly Data Entries
  async getMonthlyDataEntries(user: User): Promise<MonthlyDataEntry[]> {
    const { data, error } = await this.supabase
      .from('monthly_data_entries')
      .select('*')
      .eq('user_id', user.id)
      .order('month_year', { ascending: false })

    if (error) {
      console.error('Error fetching monthly data entries:', error)
      return []
    }

    return data || []
  }

  async createMonthlyDataEntry(user: User, entry: Omit<MonthlyDataEntry, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<{ data: MonthlyDataEntry | null; error: string | null }> {
    try {
      // Validate required fields
      if (!entry.month_year) {
        return { data: null, error: 'Month and year are required' }
      }
      if (entry.new_clients === undefined || entry.new_clients < 0 || isNaN(entry.new_clients)) {
        return { data: null, error: 'Invalid new_clients value: must be a valid non-negative number' }
      }
      if (entry.new_appointments === undefined || entry.new_appointments < 0 || isNaN(entry.new_appointments)) {
        return { data: null, error: 'Invalid new_appointments value: must be a valid non-negative number' }
      }
      if (entry.new_leads === undefined || entry.new_leads < 0 || isNaN(entry.new_leads)) {
        return { data: null, error: 'Invalid new_leads value: must be a valid non-negative number' }
      }
      if (entry.annuity_sales === undefined || entry.annuity_sales < 0 || isNaN(entry.annuity_sales)) {
        return { data: null, error: 'Invalid annuity_sales value: must be a valid non-negative number' }
      }
      if (entry.aum_sales === undefined || entry.aum_sales < 0 || isNaN(entry.aum_sales)) {
        return { data: null, error: 'Invalid aum_sales value: must be a valid non-negative number' }
      }
      if (entry.life_sales === undefined || entry.life_sales < 0 || isNaN(entry.life_sales)) {
        return { data: null, error: 'Invalid life_sales value: must be a valid non-negative number' }
      }
      if (entry.marketing_expenses === undefined || entry.marketing_expenses < 0 || isNaN(entry.marketing_expenses)) {
        return { data: null, error: 'Invalid marketing_expenses value: must be a valid non-negative number' }
      }

      // Check if an entry already exists for this month_year
      const { data: existingEntry } = await this.supabase
        .from('monthly_data_entries')
        .select('id')
        .eq('user_id', user.id)
        .eq('month_year', entry.month_year)
        .single()

      // If entry exists, update it instead of creating a new one
      if (existingEntry) {
        console.log('Entry already exists for this month, updating instead:', existingEntry.id)
        return await this.updateMonthlyDataEntry(user, existingEntry.id, entry)
      }

      const { data, error } = await this.supabase
        .from('monthly_data_entries')
        .insert({
          user_id: user.id,
          month_year: entry.month_year,
          new_clients: entry.new_clients,
          new_appointments: entry.new_appointments,
          new_leads: entry.new_leads,
          annuity_sales: entry.annuity_sales,
          aum_sales: entry.aum_sales,
          life_sales: entry.life_sales,
          marketing_expenses: entry.marketing_expenses,
          notes: entry.notes || null
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating monthly data entry:', error)
        // Handle 409 conflict specifically
        if (error.code === '23505' || error.message?.includes('unique') || error.message?.includes('duplicate')) {
          // Try to find and update the existing entry
          const { data: existing } = await this.supabase
            .from('monthly_data_entries')
            .select('id')
            .eq('user_id', user.id)
            .eq('month_year', entry.month_year)
            .single()
          
          if (existing) {
            console.log('Found existing entry, updating instead:', existing.id)
            return await this.updateMonthlyDataEntry(user, existing.id, entry)
          }
          return { data: null, error: `An entry for ${entry.month_year} already exists. Please edit the existing entry instead.` }
        }
        return { data: null, error: error.message || 'Failed to create monthly data entry' }
      }

      return { data, error: null }
    } catch (error) {
      console.error('Error in createMonthlyDataEntry:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      return { data: null, error: errorMessage }
    }
  }

  async updateMonthlyDataEntry(user: User, id: string, entry: Partial<MonthlyDataEntry>): Promise<{ data: MonthlyDataEntry | null; error: string | null }> {
    try {
      // Build update object with only provided fields
      const updateData: any = {
        updated_at: new Date().toISOString()
      }

      if (entry.month_year !== undefined) updateData.month_year = entry.month_year
      if (entry.new_clients !== undefined) {
        if (entry.new_clients < 0) {
          return { data: null, error: 'Invalid new_clients value: must be non-negative' }
        }
        updateData.new_clients = entry.new_clients
      }
      if (entry.new_appointments !== undefined) {
        if (entry.new_appointments < 0) {
          return { data: null, error: 'Invalid new_appointments value: must be non-negative' }
        }
        updateData.new_appointments = entry.new_appointments
      }
      if (entry.new_leads !== undefined) {
        if (entry.new_leads < 0) {
          return { data: null, error: 'Invalid new_leads value: must be non-negative' }
        }
        updateData.new_leads = entry.new_leads
      }
      if (entry.annuity_sales !== undefined) {
        if (entry.annuity_sales < 0) {
          return { data: null, error: 'Invalid annuity_sales value: must be non-negative' }
        }
        updateData.annuity_sales = entry.annuity_sales
      }
      if (entry.aum_sales !== undefined) {
        if (entry.aum_sales < 0) {
          return { data: null, error: 'Invalid aum_sales value: must be non-negative' }
        }
        updateData.aum_sales = entry.aum_sales
      }
      if (entry.life_sales !== undefined) {
        if (entry.life_sales < 0) {
          return { data: null, error: 'Invalid life_sales value: must be non-negative' }
        }
        updateData.life_sales = entry.life_sales
      }
      if (entry.marketing_expenses !== undefined) {
        if (entry.marketing_expenses < 0) {
          return { data: null, error: 'Invalid marketing_expenses value: must be non-negative' }
        }
        updateData.marketing_expenses = entry.marketing_expenses
      }
      if (entry.notes !== undefined) updateData.notes = entry.notes || null

      const { data, error } = await this.supabase
        .from('monthly_data_entries')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) {
        console.error('Error updating monthly data entry:', error)
        return { data: null, error: error.message || 'Failed to update monthly data entry' }
      }

      return { data, error: null }
    } catch (error) {
      console.error('Error in updateMonthlyDataEntry:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      return { data: null, error: errorMessage }
    }
  }

  async deleteMonthlyDataEntry(user: User, id: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('monthly_data_entries')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) {
        console.error('Error deleting monthly data entry:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error in deleteMonthlyDataEntry:', error)
      return false
    }
  }

  // Get all advisor basecamp data for a user and year
  async getAllAdvisorBasecampData(user: User, year: number): Promise<AdvisorBasecampData> {
    const [
      businessGoals,
      currentValues,
      clientMetrics,
      campaigns,
      commissionRates,
      financialBook,
      financialOptions,
      monthlyDataEntries
    ] = await Promise.all([
      this.getBusinessGoals(user, year),
      this.getCurrentValues(user, year),
      this.getClientMetrics(user, year),
      this.getMarketingCampaigns(user),
      this.getCommissionRates(user, year),
      this.getFinancialBook(user, year),
      this.getFinancialOptions(user, year),
      this.getMonthlyDataEntries(user)
    ])

    return {
      businessGoals,
      currentValues,
      clientMetrics,
      campaigns,
      commissionRates,
      financialBook,
      financialOptions,
      monthlyDataEntries
    }
  }

  // Get available years for a user
  async getAvailableYears(user: User): Promise<number[]> {
    const { data, error } = await this.supabase
      .from('business_goals')
      .select('year')
      .eq('user_id', user.id)
      .order('year', { ascending: false })

    if (error) {
      console.error('Error fetching available years:', error)
      return [new Date().getFullYear()]
    }

    const years = data?.map(row => row.year).filter((year, index, self) => self.indexOf(year) === index) || []
    return years.length > 0 ? years : [new Date().getFullYear()]
  }

  // Save all advisor basecamp data
  async saveAllAdvisorBasecampData(user: User, data: AdvisorBasecampData): Promise<boolean> {
    try {
      console.log('Starting to save all advisor basecamp data for user:', user.id)
      
      // Save all data sequentially to avoid race conditions
      if (data.businessGoals) {
        console.log('Saving business goals...')
        const savedGoals = await this.upsertBusinessGoals(user, data.businessGoals)
        if (!savedGoals) {
          console.error('Failed to save business goals')
          return false
        }
      }

      if (data.currentValues) {
        console.log('Saving current values...')
        const savedValues = await this.upsertCurrentValues(user, data.currentValues)
        if (!savedValues) {
          console.error('Failed to save current values')
          return false
        }
      }

      if (data.clientMetrics) {
        console.log('Saving client metrics...')
        const savedMetrics = await this.upsertClientMetrics(user, data.clientMetrics)
        if (!savedMetrics) {
          console.error('Failed to save client metrics')
          return false
        }
      }

      if (data.commissionRates) {
        console.log('Saving commission rates...')
        const savedRates = await this.upsertCommissionRates(user, data.commissionRates)
        if (!savedRates) {
          console.error('Failed to save commission rates')
          return false
        }
      }

      if (data.financialBook) {
        console.log('Saving financial book...')
        const savedBook = await this.upsertFinancialBook(user, data.financialBook)
        if (!savedBook) {
          console.error('Failed to save financial book')
          return false
        }
      }

      if (data.financialOptions) {
        console.log('Saving financial options...')
        const savedOptions = await this.upsertFinancialOptions(user, data.financialOptions)
        if (!savedOptions) {
          console.error('Failed to save financial options')
          return false
        }
      }

      // Handle campaigns separately since they're an array
      // Always delete existing campaigns first, then create new ones (even if empty array)
      console.log('Saving campaigns...')
      const existingCampaigns = await this.getMarketingCampaigns(user)
      console.log('Existing campaigns to delete:', existingCampaigns.length)
      for (const campaign of existingCampaigns) {
        await this.deleteMarketingCampaign(user, campaign.id!)
      }

      // Then create new ones if provided
      if (data.campaigns && data.campaigns.length > 0) {
        console.log('Creating new campaigns:', data.campaigns.length)
        for (const campaign of data.campaigns) {
          const savedCampaign = await this.createMarketingCampaign(user, campaign)
          if (!savedCampaign) {
            console.error('Failed to save campaign:', campaign.name)
            return false
          }
        }
      } else {
        console.log('No campaigns to save (empty array)')
      }

      console.log('All advisor basecamp data saved successfully')
      return true
    } catch (error) {
      console.error('Error saving all advisor basecamp data:', error)
      return false
    }
  }
}

export const advisorBasecampService = new AdvisorBasecampService() 