import { createClient } from '@/lib/supabase/client'

export type ScorecardRole = string

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
  isVisible: boolean
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
  isVisible?: boolean
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

  // Initialize default roles for a user (without default metrics)
  async initializeScorecard(): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser()
      
      if (!user) {
        return { success: false, error: 'User not authenticated' }
      }

      // Define the four default roles
      const defaultRoles: ScorecardRole[] = [
        'Marketing Position',
        'Client Coordinator',
        'Office Manager',
        'Business Owner'
      ]

      // Check if roles already exist
      const { data: existingRoles } = await this.supabase
        .from('scorecard_roles')
        .select('id, role_name')
        .eq('user_id', user.id)

      const existingRoleNames = new Set(existingRoles?.map(r => r.role_name) || [])

      // Create roles if they don't exist
      for (const roleName of defaultRoles) {
        if (!existingRoleNames.has(roleName)) {
          const { error: roleError } = await this.supabase
            .from('scorecard_roles')
            .insert({
              user_id: user.id,
              role_name: roleName,
            })

          if (roleError) {
            console.error(`Error creating role ${roleName}:`, roleError)
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

          const metricScores: MetricScore[] = (metrics || [])
            .filter(metric => metric.is_visible !== false) // Filter out hidden metrics
            .map(metric => ({
              metricId: metric.id,
              metricName: metric.metric_name,
              metricType: metric.metric_type as MetricType,
              goalValue: Number(metric.goal_value),
              actualValue: 0,
              percentageOfGoal: 0,
              grade: 'F',
              isVisible: metric.is_visible ?? true,
            }))

          // Calculate average based on visible metrics (all will be 0% since no data)
          const avgPercentage = metricScores.length > 0
            ? metricScores.reduce((sum, m) => sum + m.percentageOfGoal, 0) / metricScores.length
            : 0

          roleScorecards.push({
            roleId: role.id,
            roleName: role.role_name as ScorecardRole,
            metrics: metricScores,
            averageGradePercentage: avgPercentage,
            averageGrade: calculateGrade(avgPercentage),
          })
          continue
        }

        // Get metric scores - try with is_visible, fallback if column doesn't exist
        let { data: metricScores, error: scoresError } = await this.supabase
          .from('scorecard_metric_scores')
          .select(`
            *,
            scorecard_metrics (
              metric_name,
              metric_type,
              display_order,
              is_visible
            )
          `)
          .eq('monthly_summary_id', summary.id)
          .order('scorecard_metrics(display_order)', { ascending: true })

        // If query fails due to missing is_visible column, retry without it
        if (scoresError && scoresError.message?.includes('is_visible')) {
          const { data: retryData } = await this.supabase
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
          
          metricScores = retryData
        }

        const scores: MetricScore[] = (metricScores || [])
          .map(ms => ({
            metricId: ms.metric_id,
            metricName: (ms.scorecard_metrics as any)?.metric_name || '',
            metricType: (ms.scorecard_metrics as any)?.metric_type as MetricType || 'count',
            goalValue: Number(ms.goal_value),
            actualValue: Number(ms.actual_value),
            percentageOfGoal: Number(ms.percentage_of_goal),
            grade: ms.grade_letter as Grade,
            isVisible: (ms.scorecard_metrics as any)?.is_visible ?? true, // Default to true if column doesn't exist
          }))
          .filter(score => score.isVisible !== false) // Filter out hidden metrics

        // Recalculate average based on visible metrics only
        const visiblePercentages = scores.map(s => s.percentageOfGoal)
        const avgPercentage = visiblePercentages.length > 0
          ? visiblePercentages.reduce((sum, p) => sum + p, 0) / visiblePercentages.length
          : 0
        roleAverages.push(avgPercentage)

        roleScorecards.push({
          roleId: role.id,
          roleName: role.role_name as ScorecardRole,
          metrics: scores,
          averageGradePercentage: avgPercentage,
          averageGrade: calculateGrade(avgPercentage), // Recalculate grade based on visible metrics
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
          isVisible: (m as any).is_visible ?? true, // Default to true if null or column doesn't exist
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
        // Filter out hidden metrics
        const visibleMetrics = metrics.filter(metric => metric.is_visible !== false)
        for (const metric of visibleMetrics) {
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
            isVisible: metric.is_visible ?? true,
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
        // Filter out hidden metrics
        const visibleMetrics = metrics.filter(metric => metric.is_visible !== false)
        for (const metric of visibleMetrics) {
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
            isVisible: metric.is_visible ?? true,
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

  // Update metric visibility
  async updateMetricVisibility(metricId: string, isVisible: boolean): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser()
      
      if (!user) {
        return { success: false, error: 'User not authenticated' }
      }

      const { error } = await this.supabase
        .from('scorecard_metrics')
        .update({ is_visible: isVisible })
        .eq('id', metricId)

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      console.error('Error updating metric visibility:', error)
      return { success: false, error: 'Failed to update metric visibility' }
    }
  }

  // Update multiple metric visibilities
  async updateMetricVisibilities(updates: Array<{ metricId: string; isVisible: boolean }>): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser()
      
      if (!user) {
        return { success: false, error: 'User not authenticated' }
      }

      // Update each metric visibility
      for (const update of updates) {
        const result = await this.updateMetricVisibility(update.metricId, update.isVisible)
        if (!result.success) {
          return result
        }
      }

      return { success: true }
    } catch (error) {
      console.error('Error updating metric visibilities:', error)
      return { success: false, error: 'Failed to update metric visibilities' }
    }
  }

  // Create a new custom metric
  async createMetric(data: {
    roleId: string
    metricName: string
    metricType: MetricType
    goalValue: number
    isInverted?: boolean
    displayOrder?: number
    isVisible?: boolean
  }): Promise<{ success: boolean; data?: ScorecardMetric; error?: string }> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser()
      
      if (!user) {
        return { success: false, error: 'User not authenticated' }
      }

      // Get the max display order for this role to add the new metric at the end
      const { data: existingMetrics } = await this.supabase
        .from('scorecard_metrics')
        .select('display_order')
        .eq('role_id', data.roleId)
        .order('display_order', { ascending: false })
        .limit(1)

      const maxDisplayOrder = existingMetrics && existingMetrics.length > 0
        ? existingMetrics[0].display_order
        : 0

      const { data: newMetric, error } = await this.supabase
        .from('scorecard_metrics')
        .insert({
          role_id: data.roleId,
          metric_name: data.metricName,
          metric_type: data.metricType,
          goal_value: data.goalValue,
          is_inverted: data.isInverted ?? false,
          display_order: data.displayOrder ?? (maxDisplayOrder + 1),
          is_visible: data.isVisible ?? true,
        })
        .select()
        .single()

      if (error) {
        return { success: false, error: error.message }
      }

      return {
        success: true,
        data: {
          id: newMetric.id,
          roleId: newMetric.role_id,
          metricName: newMetric.metric_name,
          metricType: newMetric.metric_type as MetricType,
          goalValue: Number(newMetric.goal_value),
          isInverted: newMetric.is_inverted,
          displayOrder: newMetric.display_order,
          isVisible: newMetric.is_visible ?? true,
        },
      }
    } catch (error) {
      console.error('Error creating metric:', error)
      return { success: false, error: 'Failed to create metric' }
    }
  }

  // Delete a metric
  async deleteMetric(metricId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser()
      
      if (!user) {
        return { success: false, error: 'User not authenticated' }
      }

      // Check if this is a default metric (we might want to prevent deletion of default metrics)
      // For now, we'll allow deletion of any metric
      const { error } = await this.supabase
        .from('scorecard_metrics')
        .delete()
        .eq('id', metricId)

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      console.error('Error deleting metric:', error)
      return { success: false, error: 'Failed to delete metric' }
    }
  }

  // Create a new role
  async createRole(roleName: string): Promise<{ success: boolean; data?: { id: string; name: string }; error?: string }> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser()
      
      if (!user) {
        return { success: false, error: 'User not authenticated' }
      }

      if (!roleName || roleName.trim().length === 0) {
        return { success: false, error: 'Role name is required' }
      }

      // Check if role already exists for this user
      const { data: existing } = await this.supabase
        .from('scorecard_roles')
        .select('id')
        .eq('user_id', user.id)
        .eq('role_name', roleName.trim())
        .maybeSingle()

      if (existing) {
        return { success: false, error: 'A role with this name already exists' }
      }

      const { data: newRole, error } = await this.supabase
        .from('scorecard_roles')
        .insert({
          user_id: user.id,
          role_name: roleName.trim(),
        })
        .select('id, role_name')
        .single()

      if (error) {
        return { success: false, error: error.message }
      }

      return {
        success: true,
        data: {
          id: newRole.id,
          name: newRole.role_name,
        },
      }
    } catch (error) {
      console.error('Error creating role:', error)
      return { success: false, error: 'Failed to create role' }
    }
  }

  // Delete a role (will cascade delete all metrics and related data)
  async deleteRole(roleId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser()
      
      if (!user) {
        return { success: false, error: 'User not authenticated' }
      }

      // Verify the role belongs to the user
      const { data: role } = await this.supabase
        .from('scorecard_roles')
        .select('id, user_id')
        .eq('id', roleId)
        .single()

      if (!role) {
        return { success: false, error: 'Role not found' }
      }

      if (role.user_id !== user.id) {
        return { success: false, error: 'Unauthorized to delete this role' }
      }

      // Delete the role (cascade will handle metrics, weekly data, etc.)
      const { error } = await this.supabase
        .from('scorecard_roles')
        .delete()
        .eq('id', roleId)

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      console.error('Error deleting role:', error)
      return { success: false, error: 'Failed to delete role' }
    }
  }
}

export const behaviorScorecardService = new BehaviorScorecardService()

