import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/types/supabase'

type ClientPlan = Database['public']['Tables']['client_plans']['Row']
type ClientPlanInsert = Database['public']['Tables']['client_plans']['Insert']
type ClientPlanUpdate = Database['public']['Tables']['client_plans']['Update']

export interface PlanData {
  clientData: {
    name: string
    totalAmount: number
    riskTolerance: 'conservative' | 'moderate' | 'aggressive'
    timeHorizon: number
    retirementAge: number
    incomeStartAge: number
    taxableFunds: number
    taxDeferredFunds: number
    taxFreeFunds: number
    taxBracket: number
    currentMonthlyIncome: number
    desiredMonthlyIncome: number
    annualPaymentNeeded: number
    inflationRate: number
    incomeSources: Array<{
      id: string
      name: string
      amount: number
    }>
    clientGoals: Array<{
      id: string
      goal: string
      priority: 'high' | 'medium' | 'low'
      timeframe: string
      estimatedCost: number
    }>
  }
  buckets: Array<{
    id: string
    name: string
    percentage: number
    amount: number
    color: string
    icon: string
    description: string
    growthStage: string
    timeframe: string
    investmentType: string
    premiumAmount: number
    interestRate: number
    delayPeriod: number
    paymentDelayPeriod: number
    incomePeriods: number
    annuityLabel?: string
    riskTolerance: 'conservative' | 'moderate' | 'aggressive'
    lifetimeIncomeType?: 'single' | 'joint'
    ageBasedPayoutPercent?: number
  }>
  calculationResults: Record<string, {
    estimatedPremium: number
    futureValue: number
    annuityPayment: number
    incomeGap: number
    afterTaxIncome: number
    incomeSolve: number
  }>
}

export class ClientPlanService {
  private supabase = createClient()

  async savePlan(planData: PlanData, clientName: string, planName: string): Promise<{ success: boolean; error?: string; planId?: string }> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser()
      
      if (!user) {
        return { success: false, error: 'User not authenticated' }
      }

      const planInsert: ClientPlanInsert = {
        user_id: user.id,
        client_name: clientName,
        plan_name: planName,
        plan_data: planData as any
      }

      const { data, error } = await this.supabase
        .from('client_plans')
        .insert(planInsert)
        .select()
        .single()

      if (error) {
        console.error('Error saving plan:', error)
        return { success: false, error: error.message }
      }

      return { success: true, planId: data.id }
    } catch (error) {
      console.error('Error saving plan:', error)
      return { success: false, error: 'Failed to save plan' }
    }
  }

  async getPlans(): Promise<{ success: boolean; plans?: ClientPlan[]; error?: string }> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser()
      
      if (!user) {
        return { success: false, error: 'User not authenticated' }
      }

      const { data, error } = await this.supabase
        .from('client_plans')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching plans:', error)
        return { success: false, error: error.message }
      }

      return { success: true, plans: data || [] }
    } catch (error) {
      console.error('Error fetching plans:', error)
      return { success: false, error: 'Failed to fetch plans' }
    }
  }

  async getPlan(planId: string): Promise<{ success: boolean; plan?: ClientPlan; error?: string }> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser()
      
      if (!user) {
        return { success: false, error: 'User not authenticated' }
      }

      const { data, error } = await this.supabase
        .from('client_plans')
        .select('*')
        .eq('id', planId)
        .eq('user_id', user.id)
        .single()

      if (error) {
        console.error('Error fetching plan:', error)
        return { success: false, error: error.message }
      }

      return { success: true, plan: data }
    } catch (error) {
      console.error('Error fetching plan:', error)
      return { success: false, error: 'Failed to fetch plan' }
    }
  }

  async updatePlan(planId: string, planData: PlanData, clientName?: string, planName?: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser()
      
      if (!user) {
        return { success: false, error: 'User not authenticated' }
      }

      const updateData: ClientPlanUpdate = {
        plan_data: planData as any
      }

      if (clientName) updateData.client_name = clientName
      if (planName) updateData.plan_name = planName

      const { error } = await this.supabase
        .from('client_plans')
        .update(updateData)
        .eq('id', planId)
        .eq('user_id', user.id)

      if (error) {
        console.error('Error updating plan:', error)
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      console.error('Error updating plan:', error)
      return { success: false, error: 'Failed to update plan' }
    }
  }

  async deletePlan(planId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser()
      
      if (!user) {
        return { success: false, error: 'User not authenticated' }
      }

      const { error } = await this.supabase
        .from('client_plans')
        .delete()
        .eq('id', planId)
        .eq('user_id', user.id)

      if (error) {
        console.error('Error deleting plan:', error)
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      console.error('Error deleting plan:', error)
      return { success: false, error: 'Failed to delete plan' }
    }
  }
}

export const clientPlanService = new ClientPlanService()
