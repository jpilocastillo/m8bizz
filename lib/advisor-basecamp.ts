import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'

export interface BusinessGoals {
  id?: string
  user_id?: string
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
  current_aum: number
  current_annuity: number
  current_life_production: number
  created_at?: string
  updated_at?: string
}

export interface ClientMetrics {
  id?: string
  user_id?: string
  avg_annuity_size: number
  avg_aum_size: number
  avg_net_worth_needed: number
  appointment_attrition: number
  avg_close_ratio: number
  annuity_closed: number
  aum_accounts: number
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
  cost_per_lead?: number
  cost_per_client?: number
  food_costs?: number
  created_at?: string
  updated_at?: string
}

export interface CommissionRates {
  id?: string
  user_id?: string
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
  annuity_book_value: number
  aum_book_value: number
  qualified_money_value: number
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
  monthlyDataEntries?: MonthlyDataEntry[]
}

class AdvisorBasecampService {
  private supabase = createClient()

  // Business Goals
  async getBusinessGoals(user: User): Promise<BusinessGoals | null> {
    const { data, error } = await this.supabase
      .from('business_goals')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error) {
      console.error('Error fetching business goals:', error)
      return null
    }

    return data
  }

  async upsertBusinessGoals(user: User, goals: BusinessGoals): Promise<BusinessGoals | null> {
    try {
      // First check if a record exists for this user
      const { data: existing } = await this.supabase
        .from('business_goals')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (existing) {
        // Update existing record
        const { data, error } = await this.supabase
          .from('business_goals')
          .update({
            ...goals,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id)
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
  async getCurrentValues(user: User): Promise<CurrentValues | null> {
    const { data, error } = await this.supabase
      .from('current_values')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error) {
      console.error('Error fetching current values:', error)
      return null
    }

    return data
  }

  async upsertCurrentValues(user: User, values: CurrentValues): Promise<CurrentValues | null> {
    try {
      // First check if a record exists for this user
      const { data: existing } = await this.supabase
        .from('current_values')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (existing) {
        // Update existing record
        const { data, error } = await this.supabase
          .from('current_values')
          .update({
            ...values,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id)
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
  async getClientMetrics(user: User): Promise<ClientMetrics | null> {
    const { data, error } = await this.supabase
      .from('client_metrics')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error) {
      console.error('Error fetching client metrics:', error)
      return null
    }

    return data
  }

  async upsertClientMetrics(user: User, metrics: ClientMetrics): Promise<ClientMetrics | null> {
    try {
      // First check if a record exists for this user
      const { data: existing } = await this.supabase
        .from('client_metrics')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (existing) {
        // Update existing record
        const { data, error } = await this.supabase
          .from('client_metrics')
          .update({
            ...metrics,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id)
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
  async getCommissionRates(user: User): Promise<CommissionRates | null> {
    const { data, error } = await this.supabase
      .from('commission_rates')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error) {
      console.error('Error fetching commission rates:', error)
      return null
    }

    return data
  }

  async upsertCommissionRates(user: User, rates: CommissionRates): Promise<CommissionRates | null> {
    try {
      // First check if a record exists for this user
      const { data: existing } = await this.supabase
        .from('commission_rates')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (existing) {
        // Update existing record
        const { data, error } = await this.supabase
          .from('commission_rates')
          .update({
            ...rates,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id)
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
  async getFinancialBook(user: User): Promise<FinancialBook | null> {
    const { data, error } = await this.supabase
      .from('financial_book')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error) {
      console.error('Error fetching financial book:', error)
      return null
    }

    return data
  }

  async upsertFinancialBook(user: User, book: FinancialBook): Promise<FinancialBook | null> {
    try {
      // First check if a record exists for this user
      const { data: existing } = await this.supabase
        .from('financial_book')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (existing) {
        // Update existing record
        const { data, error } = await this.supabase
          .from('financial_book')
          .update({
            ...book,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id)
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

  async createMonthlyDataEntry(user: User, entry: Omit<MonthlyDataEntry, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<MonthlyDataEntry | null> {
    try {
      const { data, error } = await this.supabase
        .from('monthly_data_entries')
        .insert({
          user_id: user.id,
          ...entry
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating monthly data entry:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error in createMonthlyDataEntry:', error)
      return null
    }
  }

  async updateMonthlyDataEntry(user: User, id: string, entry: Partial<MonthlyDataEntry>): Promise<MonthlyDataEntry | null> {
    try {
      const { data, error } = await this.supabase
        .from('monthly_data_entries')
        .update({
          ...entry,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) {
        console.error('Error updating monthly data entry:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error in updateMonthlyDataEntry:', error)
      return null
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

  // Get all advisor basecamp data for a user
  async getAllAdvisorBasecampData(user: User): Promise<AdvisorBasecampData> {
    const [
      businessGoals,
      currentValues,
      clientMetrics,
      campaigns,
      commissionRates,
      financialBook,
      monthlyDataEntries
    ] = await Promise.all([
      this.getBusinessGoals(user),
      this.getCurrentValues(user),
      this.getClientMetrics(user),
      this.getMarketingCampaigns(user),
      this.getCommissionRates(user),
      this.getFinancialBook(user),
      this.getMonthlyDataEntries(user)
    ])

    return {
      businessGoals,
      currentValues,
      clientMetrics,
      campaigns,
      commissionRates,
      financialBook,
      monthlyDataEntries
    }
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

      // Handle campaigns separately since they're an array
      if (data.campaigns && data.campaigns.length > 0) {
        console.log('Saving campaigns...')
        // First, delete existing campaigns
        const existingCampaigns = await this.getMarketingCampaigns(user)
        for (const campaign of existingCampaigns) {
          await this.deleteMarketingCampaign(user, campaign.id!)
        }

        // Then create new ones
        for (const campaign of data.campaigns) {
          const savedCampaign = await this.createMarketingCampaign(user, campaign)
          if (!savedCampaign) {
            console.error('Failed to save campaign:', campaign.name)
            return false
          }
        }
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