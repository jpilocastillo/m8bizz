import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/types/supabase'
import type { MissingMoneyData, CostCenter } from '@/app/tools/missing-money/page'

type MissingMoneyReport = Database['public']['Tables']['missing_money_reports']['Row']
type MissingMoneyReportInsert = Database['public']['Tables']['missing_money_reports']['Insert']
type MissingMoneyReportUpdate = Database['public']['Tables']['missing_money_reports']['Update']

export class MissingMoneyService {
  private supabase = createClient()

  async getMissingMoneyReport(): Promise<{ success: boolean; data?: MissingMoneyData; error?: string }> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser()
      
      if (!user) {
        return { success: false, error: 'User not authenticated' }
      }

      const { data, error } = await this.supabase
        .from('missing_money_reports')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()

      if (error) {
        console.error('Error fetching missing money report:', error)
        return { success: false, error: error.message }
      }

      if (!data) {
        // Return default data if no report exists
        return { 
          success: true, 
          data: {
            costCenters: [],
            oneYearTotal: 0,
            fiveYearTotal: 0,
            tenYearTotal: 0
          }
        }
      }

      // Transform database data to MissingMoneyData format
      const missingMoneyData: MissingMoneyData = {
        costCenters: (data.cost_centers as any) || [],
        oneYearTotal: Number(data.one_year_total) || 0,
        fiveYearTotal: Number(data.five_year_total) || 0,
        tenYearTotal: Number(data.ten_year_total) || 0
      }

      return { success: true, data: missingMoneyData }
    } catch (error) {
      console.error('Error fetching missing money report:', error)
      return { success: false, error: 'Failed to fetch missing money report' }
    }
  }

  async saveMissingMoneyReport(data: MissingMoneyData): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser()
      
      if (!user) {
        return { success: false, error: 'User not authenticated' }
      }

      // Check if report exists
      const { data: existing } = await this.supabase
        .from('missing_money_reports')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle()

      const reportData: MissingMoneyReportInsert | MissingMoneyReportUpdate = {
        user_id: user.id,
        cost_centers: data.costCenters as any,
        one_year_total: data.oneYearTotal,
        five_year_total: data.fiveYearTotal,
        ten_year_total: data.tenYearTotal
      }

      if (existing) {
        // Update existing report
        const { error } = await this.supabase
          .from('missing_money_reports')
          .update(reportData)
          .eq('user_id', user.id)

        if (error) {
          console.error('Error updating missing money report:', error)
          return { success: false, error: error.message }
        }
      } else {
        // Insert new report
        const { error } = await this.supabase
          .from('missing_money_reports')
          .insert(reportData as MissingMoneyReportInsert)

        if (error) {
          console.error('Error creating missing money report:', error)
          return { success: false, error: error.message }
        }
      }

      return { success: true }
    } catch (error) {
      console.error('Error saving missing money report:', error)
      return { success: false, error: 'Failed to save missing money report' }
    }
  }
}

export const missingMoneyService = new MissingMoneyService()

