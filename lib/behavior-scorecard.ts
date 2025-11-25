import { createClient } from '@/lib/supabase/client'

export type ScorecardRole = 'Marketing Position' | 'Client Coordinator' | 'Office Manager' | 'Business Owner'

export type MetricType = 'count' | 'currency' | 'percentage' | 'time' | 'rating_1_5' | 'rating_scale'

export type Grade = 'A' | 'B' | 'C' | 'D' | 'F'

export interface ScorecardMetric {
  id: string
  roleId: string
  metricName: string
  metricType: MetricType
  goalValue: number
  isInverted: boolean
  displayOrder: number
}

export interface WeeklyData {
  id: string
  metricId: string
  weekNumber: number
  year: number
  actualValue: number
}

export interface MetricScore {
  metricId: string
  metricName: string
  metricType: MetricType
  goalValue: number
  actualValue: number
  percentageOfGoal: number
  grade: Grade
}

export interface RoleScorecard {
  roleId: string
  roleName: ScorecardRole
  metrics: MetricScore[]
  averageGradePercentage: number
  averageGrade: Grade
}

export interface CompanySummary {
  companyAverage: number
  companyGrade: Grade
  roleScorecards: RoleScorecard[]
}

export type PeriodType = 'month' | 'quarter' | 'year'

export interface MonthlyScorecardData {
  month?: number
  quarter?: number
  year: number
  periodType: PeriodType
  roleScorecards: RoleScorecard[]
  companySummary: CompanySummary
}

// Default metrics configuration based on Excel structure
const DEFAULT_METRICS: Record<ScorecardRole, Array<{
  metricName: string
  metricType: MetricType
  goalValue: number
  isInverted: boolean
  displayOrder: number
}>> = {
  'Marketing Position': [
    { metricName: 'Seminar Calls', metricType: 'count', goalValue: 300, isInverted: false, displayOrder: 1 },
    { metricName: 'Sales Calls', metricType: 'count', goalValue: 400, isInverted: false, displayOrder: 2 },
    { metricName: 'Care Bear Calls', metricType: 'count', goalValue: 80, isInverted: false, displayOrder: 3 },
    { metricName: 'Social Media Posts', metricType: 'count', goalValue: 12, isInverted: false, displayOrder: 4 },
    { metricName: 'Emails Sent to Prospects', metricType: 'count', goalValue: 15, isInverted: false, displayOrder: 5 },
    { metricName: 'Emails Sent Existing', metricType: 'count', goalValue: 15, isInverted: false, displayOrder: 6 },
    { metricName: 'Appointments Booked', metricType: 'count', goalValue: 24, isInverted: false, displayOrder: 7 },
    { metricName: 'Appointments Attended', metricType: 'count', goalValue: 20, isInverted: false, displayOrder: 8 },
  ],
  'Client Coordinator': [
    { metricName: 'Annuity Processing Time', metricType: 'time', goalValue: 30, isInverted: true, displayOrder: 1 },
    { metricName: 'Life Processing Time', metricType: 'time', goalValue: 60, isInverted: true, displayOrder: 2 },
    { metricName: 'AUM Processing Time', metricType: 'time', goalValue: 30, isInverted: true, displayOrder: 3 },
    { metricName: 'Error Rate', metricType: 'percentage', goalValue: 10, isInverted: true, displayOrder: 4 },
    { metricName: 'Feedback Rate', metricType: 'rating_1_5', goalValue: 5, isInverted: false, displayOrder: 5 },
    { metricName: 'Client Response Time', metricType: 'rating_1_5', goalValue: 5, isInverted: false, displayOrder: 6 },
    { metricName: 'Note Accuracy', metricType: 'rating_1_5', goalValue: 5, isInverted: false, displayOrder: 7 },
    { metricName: 'Client Satisfaction', metricType: 'rating_1_5', goalValue: 5, isInverted: false, displayOrder: 8 },
  ],
  'Office Manager': [
    { metricName: 'Project Management', metricType: 'rating_1_5', goalValue: 5, isInverted: false, displayOrder: 1 },
    { metricName: 'Budget Management', metricType: 'rating_1_5', goalValue: 5, isInverted: false, displayOrder: 2 },
    { metricName: 'Compliance', metricType: 'rating_1_5', goalValue: 5, isInverted: false, displayOrder: 3 },
    { metricName: 'Employee Satisfaction', metricType: 'rating_1_5', goalValue: 5, isInverted: false, displayOrder: 4 },
    { metricName: 'Office Communication', metricType: 'rating_1_5', goalValue: 5, isInverted: false, displayOrder: 5 },
    { metricName: 'Innovation and Improvement', metricType: 'rating_1_5', goalValue: 5, isInverted: false, displayOrder: 6 },
    { metricName: 'Employee Tracking', metricType: 'rating_1_5', goalValue: 5, isInverted: false, displayOrder: 7 },
    { metricName: 'Conflict Resolution', metricType: 'rating_1_5', goalValue: 5, isInverted: false, displayOrder: 8 },
  ],
  'Business Owner': [
    { metricName: 'Cash On Hand', metricType: 'currency', goalValue: 150000, isInverted: false, displayOrder: 1 },
    { metricName: 'Pending Cash Flow', metricType: 'currency', goalValue: 100000, isInverted: false, displayOrder: 2 },
    { metricName: 'Marketing Events', metricType: 'count', goalValue: 4, isInverted: false, displayOrder: 3 },
    { metricName: 'Revenue Gen Appointments', metricType: 'count', goalValue: 24, isInverted: false, displayOrder: 4 },
    { metricName: 'Rev Gen Appts Converted', metricType: 'count', goalValue: 18, isInverted: false, displayOrder: 5 },
    { metricName: 'Pending Annuity', metricType: 'currency', goalValue: 1000000, isInverted: false, displayOrder: 6 },
    { metricName: 'Pending Life', metricType: 'currency', goalValue: 100000, isInverted: false, displayOrder: 7 },
    { metricName: 'Pending AUM', metricType: 'currency', goalValue: 1250000, isInverted: false, displayOrder: 8 },
  ],
}

// Calculate grade based on percentage of goal
export function calculateGrade(percentageOfGoal: number): Grade {
  if (percentageOfGoal >= 90) return 'A'
  if (percentageOfGoal >= 80) return 'B'
  if (percentageOfGoal >= 70) return 'C'
  if (percentageOfGoal >= 60) return 'D'
  return 'F'
}

// Calculate percentage of goal
export function calculatePercentageOfGoal(actual: number, goal: number, isInverted: boolean): number {
  if (goal === 0) return 0
  if (isInverted) {
    // For inverted metrics (lower is better), calculate as goal/actual * 100
    return (goal / actual) * 100
  }
  // For normal metrics (higher is better), calculate as actual/goal * 100
  return (actual / goal) * 100
}

export class BehaviorScorecardService {
  private supabase = createClient()

  // Initialize default roles and metrics for a user
  async initializeScorecard(): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser()
      
      if (!user) {
        return { success: false, error: 'User not authenticated' }
      }

      // Check if roles already exist
      const { data: existingRoles } = await this.supabase
        .from('scorecard_roles')
        .select('id, role_name')
        .eq('user_id', user.id)

      const existingRoleNames = new Set(existingRoles?.map(r => r.role_name) || [])

      // Create roles and metrics for each role
      for (const [roleName, metrics] of Object.entries(DEFAULT_METRICS)) {
        let roleId: string

        if (existingRoleNames.has(roleName)) {
          // Get existing role ID
          const existingRole = existingRoles?.find(r => r.role_name === roleName)
          roleId = existingRole!.id
        } else {
          // Create new role
          const { data: newRole, error: roleError } = await this.supabase
            .from('scorecard_roles')
            .insert({
              user_id: user.id,
              role_name: roleName as ScorecardRole,
            })
            .select('id')
            .single()

          if (roleError) {
            console.error(`Error creating role ${roleName}:`, roleError)
            continue
          }

          roleId = newRole.id
        }

        // Check existing metrics for this role
        const { data: existingMetrics } = await this.supabase
          .from('scorecard_metrics')
          .select('id, metric_name')
          .eq('role_id', roleId)

        const existingMetricNames = new Set(existingMetrics?.map(m => m.metric_name) || [])

        // Create metrics
        for (const metric of metrics) {
          if (!existingMetricNames.has(metric.metricName)) {
            const { error: metricError } = await this.supabase
              .from('scorecard_metrics')
              .insert({
                role_id: roleId,
                metric_name: metric.metricName,
                metric_type: metric.metricType,
                goal_value: metric.goalValue,
                is_inverted: metric.isInverted,
                display_order: metric.displayOrder,
              })

            if (metricError) {
              console.error(`Error creating metric ${metric.metricName}:`, metricError)
            }
          }
        }
      }

      return { success: true }
    } catch (error) {
      console.error('Error initializing scorecard:', error)
      return { success: false, error: 'Failed to initialize scorecard' }
    }
  }

  // Save weekly data for a metric
  async saveWeeklyData(
    metricId: string,
    weekNumber: number,
    year: number,
    actualValue: number
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser()
      
      if (!user) {
        return { success: false, error: 'User not authenticated' }
      }

      // Check if data already exists
      const { data: existing } = await this.supabase
        .from('scorecard_weekly_data')
        .select('id')
        .eq('metric_id', metricId)
        .eq('week_number', weekNumber)
        .eq('year', year)
        .maybeSingle()

      if (existing) {
        // Update existing
        const { error } = await this.supabase
          .from('scorecard_weekly_data')
          .update({ actual_value: actualValue })
          .eq('id', existing.id)

        if (error) {
          return { success: false, error: error.message }
        }
      } else {
        // Insert new
        const { error } = await this.supabase
          .from('scorecard_weekly_data')
          .insert({
            metric_id: metricId,
            week_number: weekNumber,
            year,
            actual_value: actualValue,
          })

        if (error) {
          return { success: false, error: error.message }
        }
      }

      return { success: true }
    } catch (error) {
      console.error('Error saving weekly data:', error)
      return { success: false, error: 'Failed to save weekly data' }
    }
  }

  // Get weekly data for a metric
  async getWeeklyData(
    metricId: string,
    year: number
  ): Promise<{ success: boolean; data?: WeeklyData[]; error?: string }> {
    try {
      const { data, error } = await this.supabase
        .from('scorecard_weekly_data')
        .select('*')
        .eq('metric_id', metricId)
        .eq('year', year)
        .order('week_number', { ascending: true })

      if (error) {
        return { success: false, error: error.message }
      }

      return {
        success: true,
        data: data?.map(d => ({
          id: d.id,
          metricId: d.metric_id,
          weekNumber: d.week_number,
          year: d.year,
          actualValue: Number(d.actual_value),
        })) || [],
      }
    } catch (error) {
      console.error('Error fetching weekly data:', error)
      return { success: false, error: 'Failed to fetch weekly data' }
    }
  }

  // Calculate and save monthly summary
  async calculateMonthlySummary(
    month: number,
    year: number
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser()
      
      if (!user) {
        return { success: false, error: 'User not authenticated' }
      }

      // Get all roles for user
      const { data: roles } = await this.supabase
        .from('scorecard_roles')
        .select('id, role_name')
        .eq('user_id', user.id)

      if (!roles || roles.length === 0) {
        return { success: false, error: 'No roles found. Please initialize scorecard first.' }
      }

      const roleAverages: number[] = []

      // Calculate summary for each role
      for (const role of roles) {
        // Get all metrics for this role
        const { data: metrics } = await this.supabase
          .from('scorecard_metrics')
          .select('*')
          .eq('role_id', role.id)
          .order('display_order', { ascending: true })

        if (!metrics || metrics.length === 0) continue

        const metricScores: MetricScore[] = []
        const percentages: number[] = []

        // Calculate scores for each metric
        for (const metric of metrics) {
          // Get weekly data for this metric for the month
          // For now, we'll sum all weeks in the month (assuming 4 weeks per month)
          const weeksInMonth = 4
          let totalActual = 0
          let weekCount = 0

          for (let week = 1; week <= weeksInMonth; week++) {
            const { data: weeklyData } = await this.supabase
              .from('scorecard_weekly_data')
              .select('actual_value')
              .eq('metric_id', metric.id)
              .eq('week_number', week)
              .eq('year', year)
              .maybeSingle()

            if (weeklyData) {
              totalActual += Number(weeklyData.actual_value)
              weekCount++
            }
          }

          // For some metrics, we want the average (like ratings), for others the sum (like counts)
          const actualValue = metric.metric_type === 'rating_1_5' || metric.metric_type === 'rating_scale'
            ? (weekCount > 0 ? totalActual / weekCount : 0)
            : totalActual

          const goalValue = Number(metric.goal_value)
          const percentageOfGoal = calculatePercentageOfGoal(actualValue, goalValue, metric.is_inverted)
          const grade = calculateGrade(percentageOfGoal)

          metricScores.push({
            metricId: metric.id,
            metricName: metric.metric_name,
            metricType: metric.metric_type as MetricType,
            goalValue,
            actualValue,
            percentageOfGoal,
            grade,
          })

          percentages.push(percentageOfGoal)
        }

        // Calculate average grade percentage for role
        const averageGradePercentage = percentages.length > 0
          ? percentages.reduce((sum, p) => sum + p, 0) / percentages.length
          : 0
        const averageGrade = calculateGrade(averageGradePercentage)

        roleAverages.push(averageGradePercentage)

        // Save or update monthly summary
        const { data: existingSummary } = await this.supabase
          .from('scorecard_monthly_summaries')
          .select('id')
          .eq('role_id', role.id)
          .eq('month', month)
          .eq('year', year)
          .maybeSingle()

        const summaryData = {
          role_id: role.id,
          month,
          year,
          average_grade_percentage: averageGradePercentage,
          average_grade_letter: averageGrade,
        }

        if (existingSummary) {
          await this.supabase
            .from('scorecard_monthly_summaries')
            .update(summaryData)
            .eq('id', existingSummary.id)
        } else {
          await this.supabase
            .from('scorecard_monthly_summaries')
            .insert(summaryData)
        }

        // Save metric scores
        const { data: savedSummary } = await this.supabase
          .from('scorecard_monthly_summaries')
          .select('id')
          .eq('role_id', role.id)
          .eq('month', month)
          .eq('year', year)
          .single()

        if (savedSummary) {
          // Delete existing metric scores
          await this.supabase
            .from('scorecard_metric_scores')
            .delete()
            .eq('monthly_summary_id', savedSummary.id)

          // Insert new metric scores
          const scoresToInsert = metricScores.map(score => ({
            monthly_summary_id: savedSummary.id,
            metric_id: score.metricId,
            actual_value: score.actualValue,
            goal_value: score.goalValue,
            percentage_of_goal: score.percentageOfGoal,
            grade_letter: score.grade,
          }))

          await this.supabase
            .from('scorecard_metric_scores')
            .insert(scoresToInsert)
        }
      }

      // Calculate company summary
      const companyAverage = roleAverages.length > 0
        ? roleAverages.reduce((sum, avg) => sum + avg, 0) / roleAverages.length
        : 0
      const companyGrade = calculateGrade(companyAverage)

      // Save or update company summary
      const { data: existingCompanySummary } = await this.supabase
        .from('company_summaries')
        .select('id')
        .eq('user_id', user.id)
        .eq('month', month)
        .eq('year', year)
        .maybeSingle()

      const companySummaryData = {
        user_id: user.id,
        month,
        year,
        company_average: companyAverage,
        company_grade: companyGrade,
      }

      if (existingCompanySummary) {
        await this.supabase
          .from('company_summaries')
          .update(companySummaryData)
          .eq('id', existingCompanySummary.id)
      } else {
        await this.supabase
          .from('company_summaries')
          .insert(companySummaryData)
      }

      return { success: true }
    } catch (error) {
      console.error('Error calculating monthly summary:', error)
      return { success: false, error: 'Failed to calculate monthly summary' }
    }
  }

  // Get quarter number from month
  private getQuarterFromMonth(month: number): number {
    return Math.ceil(month / 3)
  }

  // Get months in a quarter
  private getMonthsInQuarter(quarter: number): number[] {
    return [(quarter - 1) * 3 + 1, (quarter - 1) * 3 + 2, (quarter - 1) * 3 + 3]
  }

  // Get scorecard data for a period (month, quarter, or year)
  async getScorecardData(
    periodType: PeriodType,
    monthOrQuarter: number,
    year: number
  ): Promise<{ success: boolean; data?: MonthlyScorecardData; error?: string }> {
    if (periodType === 'month') {
      return this.getMonthlyScorecard(monthOrQuarter, year)
    } else if (periodType === 'quarter') {
      return this.getQuarterlyScorecard(monthOrQuarter, year)
    } else {
      return this.getYearlyScorecard(year)
    }
  }

  // Get monthly scorecard data
  async getMonthlyScorecard(
    month: number,
    year: number
  ): Promise<{ success: boolean; data?: MonthlyScorecardData; error?: string }> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser()
      
      if (!user) {
        return { success: false, error: 'User not authenticated' }
      }

      // Get all roles
      const { data: roles } = await this.supabase
        .from('scorecard_roles')
        .select('id, role_name')
        .eq('user_id', user.id)
        .order('role_name', { ascending: true })

      if (!roles || roles.length === 0) {
        return { success: true, data: { month, year, periodType: 'month' as PeriodType, roleScorecards: [], companySummary: { companyAverage: 0, companyGrade: 'F', roleScorecards: [] } } }
      }

      const roleScorecards: RoleScorecard[] = []
      const roleAverages: number[] = []

      // Get scorecard for each role
      for (const role of roles) {
        const { data: summary } = await this.supabase
          .from('scorecard_monthly_summaries')
          .select('id, average_grade_percentage, average_grade_letter')
          .eq('role_id', role.id)
          .eq('month', month)
          .eq('year', year)
          .maybeSingle()

        if (!summary) {
          // No summary exists, create empty scorecard
          const { data: metrics } = await this.supabase
            .from('scorecard_metrics')
            .select('*')
            .eq('role_id', role.id)
            .order('display_order', { ascending: true })

          const metricScores: MetricScore[] = (metrics || []).map(metric => ({
            metricId: metric.id,
            metricName: metric.metric_name,
            metricType: metric.metric_type as MetricType,
            goalValue: Number(metric.goal_value),
            actualValue: 0,
            percentageOfGoal: 0,
            grade: 'F',
          }))

          roleScorecards.push({
            roleId: role.id,
            roleName: role.role_name as ScorecardRole,
            metrics: metricScores,
            averageGradePercentage: 0,
            averageGrade: 'F',
          })
          continue
        }

        // Get metric scores
        const { data: metricScores } = await this.supabase
          .from('scorecard_metric_scores')
          .select(`
            *,
            scorecard_metrics (
              metric_name,
              metric_type,
              display_order
            )
          `)
          .eq('monthly_summary_id', summary.id)
          .order('scorecard_metrics(display_order)', { ascending: true })

        const scores: MetricScore[] = (metricScores || []).map(ms => ({
          metricId: ms.metric_id,
          metricName: (ms.scorecard_metrics as any)?.metric_name || '',
          metricType: (ms.scorecard_metrics as any)?.metric_type as MetricType || 'count',
          goalValue: Number(ms.goal_value),
          actualValue: Number(ms.actual_value),
          percentageOfGoal: Number(ms.percentage_of_goal),
          grade: ms.grade_letter as Grade,
        }))

        const avgPercentage = Number(summary.average_grade_percentage) || 0
        roleAverages.push(avgPercentage)

        roleScorecards.push({
          roleId: role.id,
          roleName: role.role_name as ScorecardRole,
          metrics: scores,
          averageGradePercentage: avgPercentage,
          averageGrade: (summary.average_grade_letter as Grade) || 'F',
        })
      }

      // Get company summary
      const { data: companySummary } = await this.supabase
        .from('company_summaries')
        .select('company_average, company_grade')
        .eq('user_id', user.id)
        .eq('month', month)
        .eq('year', year)
        .maybeSingle()

      const companyAverage = companySummary
        ? Number(companySummary.company_average) || 0
        : (roleAverages.length > 0 ? roleAverages.reduce((sum, avg) => sum + avg, 0) / roleAverages.length : 0)
      const companyGrade = companySummary
        ? (companySummary.company_grade as Grade) || 'F'
        : calculateGrade(companyAverage)

      return {
        success: true,
        data: {
          month,
          year,
          periodType: 'month' as PeriodType,
          roleScorecards,
          companySummary: {
            companyAverage,
            companyGrade,
            roleScorecards,
          },
        },
      }
    } catch (error) {
      console.error('Error fetching monthly scorecard:', error)
      return { success: false, error: 'Failed to fetch monthly scorecard' }
    }
  }

  // Get all metrics for a role
  async getRoleMetrics(roleId: string): Promise<{ success: boolean; data?: ScorecardMetric[]; error?: string }> {
    try {
      const { data, error } = await this.supabase
        .from('scorecard_metrics')
        .select('*')
        .eq('role_id', roleId)
        .order('display_order', { ascending: true })

      if (error) {
        return { success: false, error: error.message }
      }

      return {
        success: true,
        data: data?.map(m => ({
          id: m.id,
          roleId: m.role_id,
          metricName: m.metric_name,
          metricType: m.metric_type as MetricType,
          goalValue: Number(m.goal_value),
          isInverted: m.is_inverted,
          displayOrder: m.display_order,
        })) || [],
      }
    } catch (error) {
      console.error('Error fetching role metrics:', error)
      return { success: false, error: 'Failed to fetch role metrics' }
    }
  }

  // Get quarterly scorecard data
  async getQuarterlyScorecard(
    quarter: number,
    year: number
  ): Promise<{ success: boolean; data?: MonthlyScorecardData; error?: string }> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser()
      
      if (!user) {
        return { success: false, error: 'User not authenticated' }
      }

      const months = this.getMonthsInQuarter(quarter)
      const roleScorecards: RoleScorecard[] = []
      const roleAverages: number[] = []

      // Get all roles
      const { data: roles } = await this.supabase
        .from('scorecard_roles')
        .select('id, role_name')
        .eq('user_id', user.id)
        .order('role_name', { ascending: true })

      if (!roles || roles.length === 0) {
        return { success: true, data: { quarter, year, periodType: 'quarter' as PeriodType, roleScorecards: [], companySummary: { companyAverage: 0, companyGrade: 'F', roleScorecards: [] } } }
      }

      // Aggregate data for each role across the quarter
      for (const role of roles) {
        const { data: metrics } = await this.supabase
          .from('scorecard_metrics')
          .select('*')
          .eq('role_id', role.id)
          .order('display_order', { ascending: true })

        if (!metrics || metrics.length === 0) continue

        const metricScores: MetricScore[] = []
        const percentages: number[] = []

        // Aggregate data for each metric across all months in the quarter
        for (const metric of metrics) {
          let totalActual = 0
          let monthCount = 0
          const goalValue = Number(metric.goal_value)

          // Sum or average across all months in the quarter
          for (const month of months) {
            const { data: summary } = await this.supabase
              .from('scorecard_monthly_summaries')
              .select('id')
              .eq('role_id', role.id)
              .eq('month', month)
              .eq('year', year)
              .maybeSingle()

            if (summary) {
              const { data: metricScore } = await this.supabase
                .from('scorecard_metric_scores')
                .select('actual_value')
                .eq('monthly_summary_id', summary.id)
                .eq('metric_id', metric.id)
                .maybeSingle()

              if (metricScore) {
                totalActual += Number(metricScore.actual_value)
                monthCount++
              }
            }
          }

          // For ratings, average across months; for others, sum
          const actualValue = metric.metric_type === 'rating_1_5' || metric.metric_type === 'rating_scale'
            ? (monthCount > 0 ? totalActual / monthCount : 0)
            : totalActual

          // For quarterly goals, multiply monthly goal by 3 (or use average for ratings)
          const quarterlyGoal = metric.metric_type === 'rating_1_5' || metric.metric_type === 'rating_scale'
            ? goalValue
            : goalValue * 3

          const percentageOfGoal = calculatePercentageOfGoal(actualValue, quarterlyGoal, metric.is_inverted)
          const grade = calculateGrade(percentageOfGoal)

          metricScores.push({
            metricId: metric.id,
            metricName: metric.metric_name,
            metricType: metric.metric_type as MetricType,
            goalValue: quarterlyGoal,
            actualValue,
            percentageOfGoal,
            grade,
          })

          percentages.push(percentageOfGoal)
        }

        const averageGradePercentage = percentages.length > 0
          ? percentages.reduce((sum, p) => sum + p, 0) / percentages.length
          : 0
        const averageGrade = calculateGrade(averageGradePercentage)

        roleAverages.push(averageGradePercentage)

        roleScorecards.push({
          roleId: role.id,
          roleName: role.role_name as ScorecardRole,
          metrics: metricScores,
          averageGradePercentage,
          averageGrade,
        })
      }

      // Calculate company summary
      const companyAverage = roleAverages.length > 0
        ? roleAverages.reduce((sum, avg) => sum + avg, 0) / roleAverages.length
        : 0
      const companyGrade = calculateGrade(companyAverage)

      return {
        success: true,
        data: {
          quarter,
          year,
          periodType: 'quarter' as PeriodType,
          roleScorecards,
          companySummary: {
            companyAverage,
            companyGrade,
            roleScorecards,
          },
        },
      }
    } catch (error) {
      console.error('Error fetching quarterly scorecard:', error)
      return { success: false, error: 'Failed to fetch quarterly scorecard' }
    }
  }

  // Get yearly scorecard data
  async getYearlyScorecard(
    year: number
  ): Promise<{ success: boolean; data?: MonthlyScorecardData; error?: string }> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser()
      
      if (!user) {
        return { success: false, error: 'User not authenticated' }
      }

      const roleScorecards: RoleScorecard[] = []
      const roleAverages: number[] = []

      // Get all roles
      const { data: roles } = await this.supabase
        .from('scorecard_roles')
        .select('id, role_name')
        .eq('user_id', user.id)
        .order('role_name', { ascending: true })

      if (!roles || roles.length === 0) {
        return { success: true, data: { year, periodType: 'year' as PeriodType, roleScorecards: [], companySummary: { companyAverage: 0, companyGrade: 'F', roleScorecards: [] } } }
      }

      // Aggregate data for each role across the year
      for (const role of roles) {
        const { data: metrics } = await this.supabase
          .from('scorecard_metrics')
          .select('*')
          .eq('role_id', role.id)
          .order('display_order', { ascending: true })

        if (!metrics || metrics.length === 0) continue

        const metricScores: MetricScore[] = []
        const percentages: number[] = []

        // Aggregate data for each metric across all months in the year
        for (const metric of metrics) {
          let totalActual = 0
          let monthCount = 0
          const goalValue = Number(metric.goal_value)

          // Sum or average across all 12 months
          for (let month = 1; month <= 12; month++) {
            const { data: summary } = await this.supabase
              .from('scorecard_monthly_summaries')
              .select('id')
              .eq('role_id', role.id)
              .eq('month', month)
              .eq('year', year)
              .maybeSingle()

            if (summary) {
              const { data: metricScore } = await this.supabase
                .from('scorecard_metric_scores')
                .select('actual_value')
                .eq('monthly_summary_id', summary.id)
                .eq('metric_id', metric.id)
                .maybeSingle()

              if (metricScore) {
                totalActual += Number(metricScore.actual_value)
                monthCount++
              }
            }
          }

          // For ratings, average across months; for others, sum
          const actualValue = metric.metric_type === 'rating_1_5' || metric.metric_type === 'rating_scale'
            ? (monthCount > 0 ? totalActual / monthCount : 0)
            : totalActual

          // For yearly goals, multiply monthly goal by 12 (or use average for ratings)
          const yearlyGoal = metric.metric_type === 'rating_1_5' || metric.metric_type === 'rating_scale'
            ? goalValue
            : goalValue * 12

          const percentageOfGoal = calculatePercentageOfGoal(actualValue, yearlyGoal, metric.is_inverted)
          const grade = calculateGrade(percentageOfGoal)

          metricScores.push({
            metricId: metric.id,
            metricName: metric.metric_name,
            metricType: metric.metric_type as MetricType,
            goalValue: yearlyGoal,
            actualValue,
            percentageOfGoal,
            grade,
          })

          percentages.push(percentageOfGoal)
        }

        const averageGradePercentage = percentages.length > 0
          ? percentages.reduce((sum, p) => sum + p, 0) / percentages.length
          : 0
        const averageGrade = calculateGrade(averageGradePercentage)

        roleAverages.push(averageGradePercentage)

        roleScorecards.push({
          roleId: role.id,
          roleName: role.role_name as ScorecardRole,
          metrics: metricScores,
          averageGradePercentage,
          averageGrade,
        })
      }

      // Calculate company summary
      const companyAverage = roleAverages.length > 0
        ? roleAverages.reduce((sum, avg) => sum + avg, 0) / roleAverages.length
        : 0
      const companyGrade = calculateGrade(companyAverage)

      return {
        success: true,
        data: {
          year,
          periodType: 'year' as PeriodType,
          roleScorecards,
          companySummary: {
            companyAverage,
            companyGrade,
            roleScorecards,
          },
        },
      }
    } catch (error) {
      console.error('Error fetching yearly scorecard:', error)
      return { success: false, error: 'Failed to fetch yearly scorecard' }
    }
  }

  // Update metric goal value
  async updateMetricGoal(metricId: string, goalValue: number): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser()
      
      if (!user) {
        return { success: false, error: 'User not authenticated' }
      }

      const { error } = await this.supabase
        .from('scorecard_metrics')
        .update({ goal_value: goalValue })
        .eq('id', metricId)

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      console.error('Error updating metric goal:', error)
      return { success: false, error: 'Failed to update metric goal' }
    }
  }
}

export const behaviorScorecardService = new BehaviorScorecardService()

