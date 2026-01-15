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
  isVisible?: boolean
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
  // Separate scores for default metrics (Effort, Attitude, Teamwork, Innovation, Results)
  defaultMetrics?: MetricScore[]
  defaultMetricsAverage?: number
  defaultMetricsGrade?: Grade
  // User-added metrics
  userMetrics?: MetricScore[]
  userMetricsAverage?: number
  userMetricsGrade?: Grade
  // Combined score (average of default and user metrics)
  combinedAverage?: number
  combinedGrade?: Grade
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
    { metricName: 'Effort', metricType: 'rating_1_5', goalValue: 5, isInverted: false, displayOrder: 9 },
    { metricName: 'Attitude', metricType: 'rating_1_5', goalValue: 5, isInverted: false, displayOrder: 10 },
    { metricName: 'Teamwork', metricType: 'rating_1_5', goalValue: 5, isInverted: false, displayOrder: 11 },
    { metricName: 'Innovation', metricType: 'rating_1_5', goalValue: 5, isInverted: false, displayOrder: 12 },
    { metricName: 'Results', metricType: 'rating_1_5', goalValue: 5, isInverted: false, displayOrder: 13 },
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
    { metricName: 'Effort', metricType: 'rating_1_5', goalValue: 5, isInverted: false, displayOrder: 9 },
    { metricName: 'Attitude', metricType: 'rating_1_5', goalValue: 5, isInverted: false, displayOrder: 10 },
    { metricName: 'Teamwork', metricType: 'rating_1_5', goalValue: 5, isInverted: false, displayOrder: 11 },
    { metricName: 'Innovation', metricType: 'rating_1_5', goalValue: 5, isInverted: false, displayOrder: 12 },
    { metricName: 'Results', metricType: 'rating_1_5', goalValue: 5, isInverted: false, displayOrder: 13 },
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
    { metricName: 'Effort', metricType: 'rating_1_5', goalValue: 5, isInverted: false, displayOrder: 9 },
    { metricName: 'Attitude', metricType: 'rating_1_5', goalValue: 5, isInverted: false, displayOrder: 10 },
    { metricName: 'Teamwork', metricType: 'rating_1_5', goalValue: 5, isInverted: false, displayOrder: 11 },
    { metricName: 'Innovation', metricType: 'rating_1_5', goalValue: 5, isInverted: false, displayOrder: 12 },
    { metricName: 'Results', metricType: 'rating_1_5', goalValue: 5, isInverted: false, displayOrder: 13 },
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
    { metricName: 'Effort', metricType: 'rating_1_5', goalValue: 5, isInverted: false, displayOrder: 9 },
    { metricName: 'Attitude', metricType: 'rating_1_5', goalValue: 5, isInverted: false, displayOrder: 10 },
    { metricName: 'Teamwork', metricType: 'rating_1_5', goalValue: 5, isInverted: false, displayOrder: 11 },
    { metricName: 'Innovation', metricType: 'rating_1_5', goalValue: 5, isInverted: false, displayOrder: 12 },
    { metricName: 'Results', metricType: 'rating_1_5', goalValue: 5, isInverted: false, displayOrder: 13 },
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

// Default metric names that should be scored separately
export const DEFAULT_METRIC_NAMES = ['Effort', 'Attitude', 'Teamwork', 'Innovation', 'Results'] as const

// Core behaviors that should be added to ALL roles (including custom roles)
export const CORE_BEHAVIOR_METRICS: Array<{
  metricName: string
  metricType: MetricType
  goalValue: number
  isInverted: boolean
  displayOrder: number
}> = [
  { metricName: 'Effort', metricType: 'rating_1_5', goalValue: 5, isInverted: false, displayOrder: 999 },
  { metricName: 'Attitude', metricType: 'rating_1_5', goalValue: 5, isInverted: false, displayOrder: 1000 },
  { metricName: 'Teamwork', metricType: 'rating_1_5', goalValue: 5, isInverted: false, displayOrder: 1001 },
  { metricName: 'Innovation', metricType: 'rating_1_5', goalValue: 5, isInverted: false, displayOrder: 1002 },
  { metricName: 'Results', metricType: 'rating_1_5', goalValue: 5, isInverted: false, displayOrder: 1003 },
]

// Check if a metric is a default metric
export function isDefaultMetric(metricName: string): boolean {
  return DEFAULT_METRIC_NAMES.includes(metricName as any)
}

// Calculate percentage of goal
export function calculatePercentageOfGoal(actual: number, goal: number, isInverted: boolean): number {
  if (goal === 0) return 0
  if (isInverted) {
    // For inverted metrics (lower is better), calculate as goal/actual * 100
    if (actual === 0) return 0 // Avoid division by zero
    return (goal / actual) * 100
  }
  // For normal metrics (higher is better), calculate as actual/goal * 100
  return (actual / goal) * 100
}

// Helper function to separate metrics and calculate scores
function calculateSeparateScores(metrics: MetricScore[]): {
  defaultMetrics: MetricScore[]
  userMetrics: MetricScore[]
  defaultAverage: number
  defaultGrade: Grade
  userAverage: number
  userGrade: Grade
  combinedAverage: number
  combinedGrade: Grade
} {
  const defaultMetrics = metrics.filter(m => isDefaultMetric(m.metricName))
  const userMetrics = metrics.filter(m => !isDefaultMetric(m.metricName))

  // Calculate averages for default metrics
  const defaultPercentages = defaultMetrics.map(m => m.percentageOfGoal)
  const defaultAverage = defaultPercentages.length > 0
    ? defaultPercentages.reduce((sum, p) => sum + p, 0) / defaultPercentages.length
    : 0
  const defaultGrade = calculateGrade(defaultAverage)

  // Calculate averages for user metrics
  const userPercentages = userMetrics.map(m => m.percentageOfGoal)
  const userAverage = userPercentages.length > 0
    ? userPercentages.reduce((sum, p) => sum + p, 0) / userPercentages.length
    : 0
  const userGrade = calculateGrade(userAverage)

  // Calculate combined average (average of both groups)
  const allPercentages = [...defaultPercentages, ...userPercentages]
  const combinedAverage = allPercentages.length > 0
    ? allPercentages.reduce((sum, p) => sum + p, 0) / allPercentages.length
    : 0
  const combinedGrade = calculateGrade(combinedAverage)

  return {
    defaultMetrics,
    userMetrics,
    defaultAverage,
    defaultGrade,
    userAverage,
    userGrade,
    combinedAverage,
    combinedGrade,
  }
}

export class BehaviorScorecardService {
  // Create a new client instance for each operation to ensure fresh session
  private getSupabase() {
    return createClient()
  }

  // Initialize default roles and metrics for a user
  async initializeScorecard(): Promise<{ success: boolean; error?: string }> {
    try {
      const supabase = this.getSupabase()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        return { success: false, error: 'User not authenticated' }
      }

      // Check if roles already exist
      const { data: existingRoles } = await supabase
        .from('scorecard_roles')
        .select('id, role_name')
        .eq('user_id', user.id)

      const existingRoleNames = new Set(existingRoles?.map((r: { role_name: string }) => r.role_name) || [])

      // Create roles and metrics for each role
      for (const [roleName, metrics] of Object.entries(DEFAULT_METRICS)) {
        let roleId: string

        if (existingRoleNames.has(roleName)) {
          // Get existing role ID
          const existingRole = existingRoles?.find((r: { role_name: string }) => r.role_name === roleName)
          roleId = existingRole!.id
        } else {
          // Use upsert to handle race conditions and duplicates gracefully
          const { data: newRole, error: roleError } = await supabase
            .from('scorecard_roles')
            .upsert({
              user_id: user.id,
              role_name: roleName as ScorecardRole,
            }, {
              onConflict: 'user_id,role_name',
              ignoreDuplicates: false
            })
            .select('id')
            .single()

          if (roleError) {
            // Only log if it's not a duplicate/RLS error (42501 = insufficient_privilege, 23505 = unique_violation)
            if (roleError.code !== '42501' && roleError.code !== '23505') {
              console.error(`Error creating role ${roleName}:`, roleError)
            }
            // Try to get the role ID anyway in case it was created by another request
            const { data: existingRole } = await supabase
              .from('scorecard_roles')
              .select('id')
              .eq('user_id', user.id)
              .eq('role_name', roleName)
              .single()
            
            if (existingRole) {
              roleId = existingRole.id
            } else {
              // If we can't get the role, skip this role
              continue
            }
          } else {
            roleId = newRole.id
          }
        }

        // Check existing metrics for this role
        const { data: existingMetrics } = await supabase
          .from('scorecard_metrics')
          .select('id, metric_name')
          .eq('role_id', roleId)

        const existingMetricNames = new Set(existingMetrics?.map((m: { metric_name: string }) => m.metric_name) || [])

        // Create metrics
        for (const metric of metrics) {
          if (!existingMetricNames.has(metric.metricName)) {
            const { error: metricError } = await supabase
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

  // Ensure all default metrics exist for all roles (adds missing metrics to existing roles)
  async ensureDefaultMetrics(): Promise<{ success: boolean; error?: string }> {
    try {
      const supabase = this.getSupabase()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        return { success: false, error: 'User not authenticated' }
      }

      // Get all existing roles for the user
      const { data: existingRoles } = await supabase
        .from('scorecard_roles')
        .select('id, role_name')
        .eq('user_id', user.id)

      if (!existingRoles || existingRoles.length === 0) {
        // No roles exist, initialize everything
        return await this.initializeScorecard()
      }

      // For each role, ensure all default metrics exist
      for (const role of existingRoles) {
        const roleName = role.role_name as ScorecardRole
        const defaultMetrics = DEFAULT_METRICS[roleName]

        // Get existing metrics for this role
        const { data: existingMetrics } = await supabase
          .from('scorecard_metrics')
          .select('id, metric_name, display_order')
          .eq('role_id', role.id)

        const existingMetricNames = new Set(existingMetrics?.map((m: { metric_name: string }) => m.metric_name) || [])
        
        // Calculate max display order for core behaviors
        const maxDisplayOrder = existingMetrics && existingMetrics.length > 0
          ? Math.max(...existingMetrics.map((m: { display_order?: number }) => m.display_order || 0))
          : 998

        // Add default metrics for predefined roles
        if (defaultMetrics) {
          // Add any missing default metrics
          for (const metric of defaultMetrics) {
            if (!existingMetricNames.has(metric.metricName)) {
              const { error: metricError } = await supabase
                .from('scorecard_metrics')
                .insert({
                  role_id: role.id,
                  metric_name: metric.metricName,
                  metric_type: metric.metricType,
                  goal_value: metric.goalValue,
                  is_inverted: metric.isInverted,
                  display_order: metric.displayOrder,
                })

              if (metricError) {
                console.error(`Error adding metric ${metric.metricName} to role ${roleName}:`, metricError)
              } else {
                console.log(`Added missing metric ${metric.metricName} to role ${roleName}`)
              }
            }
          }
        }

        // ALWAYS add core behaviors to ALL roles (including custom roles)
        for (let i = 0; i < CORE_BEHAVIOR_METRICS.length; i++) {
          const coreMetric = CORE_BEHAVIOR_METRICS[i]
          if (!existingMetricNames.has(coreMetric.metricName)) {
            const { error: metricError } = await supabase
              .from('scorecard_metrics')
              .insert({
                role_id: role.id,
                metric_name: coreMetric.metricName,
                metric_type: coreMetric.metricType,
                goal_value: coreMetric.goalValue,
                is_inverted: coreMetric.isInverted,
                display_order: maxDisplayOrder + 1 + i,
              })

            if (metricError) {
              console.error(`Error adding core behavior ${coreMetric.metricName} to role ${roleName}:`, metricError)
            } else {
              console.log(`Added core behavior ${coreMetric.metricName} to role ${roleName}`)
            }
          }
        }
      }

      return { success: true }
    } catch (error) {
      console.error('Error ensuring default metrics:', error)
      return { success: false, error: 'Failed to ensure default metrics' }
    }
  }

  // Create a new role
  async createRole(roleName: string): Promise<{ success: boolean; error?: string; roleId?: string }> {
    try {
      const supabase = this.getSupabase()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        return { success: false, error: 'User not authenticated' }
      }

      if (!roleName || !roleName.trim()) {
        return { success: false, error: 'Role name is required' }
      }

      const trimmedRoleName = roleName.trim()

      // Check if role already exists
      const { data: existing, error: checkError } = await supabase
        .from('scorecard_roles')
        .select('id')
        .eq('user_id', user.id)
        .eq('role_name', trimmedRoleName)
        .maybeSingle()

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking for existing role:', checkError)
        return { success: false, error: checkError.message || 'Failed to check for existing role' }
      }

      if (existing) {
        return { success: false, error: 'Role already exists' }
      }

      // Verify session is active before inserting
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        console.error('No active session found')
        return { success: false, error: 'No active session. Please refresh the page and try again.' }
      }
      
      if (session.user.id !== user.id) {
        console.error('Session user ID mismatch:', { sessionUserId: session.user.id, userUserId: user.id })
        return { success: false, error: 'Session mismatch. Please refresh the page and try again.' }
      }

      // Create new role - ensure user_id matches auth.uid() for RLS
      console.log('Creating role with user_id:', user.id, 'role_name:', trimmedRoleName, 'session_user_id:', session.user.id)
      const { data: newRole, error: roleError } = await supabase
        .from('scorecard_roles')
        .insert({
          user_id: user.id,
          role_name: trimmedRoleName,
        })
        .select('id')
        .single()

      if (roleError) {
        console.error('Error creating role:', roleError)
        // Check if it's a constraint violation (custom roles might not be allowed)
        if (roleError.code === '23514' || roleError.message?.includes('check constraint')) {
          return { success: false, error: 'Custom role names are not allowed. Please use one of the predefined roles.' }
        }
        // Check if it's an RLS policy violation
        if (roleError.code === '42501') {
          return { 
            success: false, 
            error: 'Permission denied. The role was not saved due to database security policies. Please ensure you have run the latest database migrations (20250102000000_fix_scorecard_roles_rls.sql) in your Supabase SQL Editor.' 
          }
        }
        return { success: false, error: roleError.message || 'Failed to create role' }
      }

      if (!newRole || !newRole.id) {
        return { success: false, error: 'Role was created but ID was not returned' }
      }

      // Add core behaviors to the new role
      // Since this is a new role, we can use the standard display order starting from 999
      for (let i = 0; i < CORE_BEHAVIOR_METRICS.length; i++) {
        const coreMetric = CORE_BEHAVIOR_METRICS[i]
        const { error: metricError } = await supabase
          .from('scorecard_metrics')
          .insert({
            role_id: newRole.id,
            metric_name: coreMetric.metricName,
            metric_type: coreMetric.metricType,
            goal_value: coreMetric.goalValue,
            is_inverted: coreMetric.isInverted,
            display_order: 999 + i, // Start at 999 for core behaviors
          })

        if (metricError) {
          console.error(`Error adding core behavior ${coreMetric.metricName} to new role:`, metricError)
        }
      }

      console.log('Role created successfully:', { roleId: newRole.id, roleName: trimmedRoleName })
      return { success: true, roleId: newRole.id }
    } catch (error) {
      console.error('Error creating role:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to create role'
      return { success: false, error: errorMessage }
    }
  }

  // Update a role name
  async updateRole(roleId: string, newRoleName: string): Promise<{ success: boolean; error?: string }> {
    try {
      const supabase = this.getSupabase()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        return { success: false, error: 'User not authenticated' }
      }

      if (!newRoleName || !newRoleName.trim()) {
        return { success: false, error: 'Role name is required' }
      }

      const trimmedRoleName = newRoleName.trim()

      // Verify the role belongs to the user
      const { data: role, error: roleError } = await supabase
        .from('scorecard_roles')
        .select('id, role_name')
        .eq('id', roleId)
        .eq('user_id', user.id)
        .single()

      if (roleError || !role) {
        return { success: false, error: 'Role not found or access denied' }
      }

      // Check if the new name is the same as the current name
      if (role.role_name === trimmedRoleName) {
        return { success: true } // No change needed
      }

      // Check if another role with the same name already exists
      const { data: existing, error: checkError } = await supabase
        .from('scorecard_roles')
        .select('id')
        .eq('user_id', user.id)
        .eq('role_name', trimmedRoleName)
        .neq('id', roleId)
        .maybeSingle()

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking for existing role:', checkError)
        return { success: false, error: checkError.message || 'Failed to check for existing role' }
      }

      if (existing) {
        return { success: false, error: 'A role with this name already exists' }
      }

      // Update the role name
      const { error: updateError } = await supabase
        .from('scorecard_roles')
        .update({ role_name: trimmedRoleName })
        .eq('id', roleId)

      if (updateError) {
        console.error('Error updating role:', updateError)
        return { success: false, error: updateError.message || 'Failed to update role' }
      }

      return { success: true }
    } catch (error) {
      console.error('Error updating role:', error)
      return { success: false, error: 'Failed to update role' }
    }
  }

  // Delete a role and all associated data
  async deleteRole(roleId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const supabase = this.getSupabase()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        return { success: false, error: 'User not authenticated' }
      }

      // Verify the role belongs to the user
      const { data: role, error: roleError } = await supabase
        .from('scorecard_roles')
        .select('id')
        .eq('id', roleId)
        .eq('user_id', user.id)
        .single()

      if (roleError || !role) {
        return { success: false, error: 'Role not found or access denied' }
      }

      // Delete the role (cascade will delete metrics, weekly data, summaries, etc.)
      const { error: deleteError } = await supabase
        .from('scorecard_roles')
        .delete()
        .eq('id', roleId)

      if (deleteError) {
        console.error('Error deleting role:', deleteError)
        return { success: false, error: deleteError.message || 'Failed to delete role' }
      }

      return { success: true }
    } catch (error) {
      console.error('Error deleting role:', error)
      return { success: false, error: 'Failed to delete role' }
    }
  }

  // Save weekly data for a metric (optimized with upsert)
  async saveWeeklyData(
    metricId: string,
    weekNumber: number,
    year: number,
    actualValue: number
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const supabase = this.getSupabase()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        return { success: false, error: 'User not authenticated' }
      }

      // Use upsert for better performance (single query instead of check-then-insert/update)
      const { error } = await supabase
        .from('scorecard_weekly_data')
        .upsert({
          metric_id: metricId,
          week_number: weekNumber,
          year,
          actual_value: actualValue,
        }, {
          onConflict: 'metric_id,week_number,year'
        })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      console.error('Error saving weekly data:', error)
      return { success: false, error: 'Failed to save weekly data' }
    }
  }

  // Batch save weekly data for multiple metrics (much faster than individual saves)
  async batchSaveWeeklyData(
    weeklyDataEntries: Array<{
      metricId: string
      weekNumber: number
      year: number
      actualValue: number
    }>
  ): Promise<{ success: boolean; errors?: Array<{ entry: typeof weeklyDataEntries[0]; error: string }> }> {
    try {
      if (!weeklyDataEntries || weeklyDataEntries.length === 0) {
        return { success: true }
      }

      const supabase = this.getSupabase()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        return { success: false, errors: weeklyDataEntries.map(entry => ({ entry, error: 'User not authenticated' })) }
      }

      // Prepare data for upsert
      const dataToUpsert = weeklyDataEntries.map(entry => ({
        metric_id: entry.metricId,
        week_number: entry.weekNumber,
        year: entry.year,
        actual_value: entry.actualValue,
      }))

      // Batch upsert all entries at once
      const { error } = await supabase
        .from('scorecard_weekly_data')
        .upsert(dataToUpsert, {
          onConflict: 'metric_id,week_number,year'
        })

      if (error) {
        // If batch fails, return error for all entries
        return { 
          success: false, 
          errors: weeklyDataEntries.map(entry => ({ entry, error: error.message })) 
        }
      }

      return { success: true }
    } catch (error) {
      console.error('Error batch saving weekly data:', error)
      return { 
        success: false, 
        errors: weeklyDataEntries.map(entry => ({ 
          entry, 
          error: error instanceof Error ? error.message : 'Failed to save weekly data' 
        })) 
      }
    }
  }

  // Get weekly data for a metric
  async getWeeklyData(
    metricId: string,
    year: number
  ): Promise<{ success: boolean; data?: WeeklyData[]; error?: string }> {
    try {
      const supabase = this.getSupabase()
      const { data, error } = await supabase
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
        data: data?.map((d: { id: string; metric_id: string; week_number: number; year: number; actual_value: number }) => ({
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

  // Get weekly data for multiple metrics (batch query for performance)
  async getBatchWeeklyData(
    metricIds: string[],
    year: number
  ): Promise<{ success: boolean; data?: Map<string, WeeklyData[]>; error?: string }> {
    try {
      if (!metricIds || metricIds.length === 0) {
        return { success: true, data: new Map() }
      }

      const supabase = this.getSupabase()
      const { data, error } = await supabase
        .from('scorecard_weekly_data')
        .select('*')
        .in('metric_id', metricIds)
        .eq('year', year)
        .order('metric_id, week_number', { ascending: true })

      if (error) {
        return { success: false, error: error.message }
      }

      // Group by metric_id
      const dataMap = new Map<string, WeeklyData[]>()
      data?.forEach((d: { id: string; metric_id: string; week_number: number; year: number; actual_value: number }) => {
        const weeklyData: WeeklyData = {
          id: d.id,
          metricId: d.metric_id,
          weekNumber: d.week_number,
          year: d.year,
          actualValue: Number(d.actual_value),
        }
        
        if (!dataMap.has(d.metric_id)) {
          dataMap.set(d.metric_id, [])
        }
        dataMap.get(d.metric_id)!.push(weeklyData)
      })

      // Ensure all metricIds have an entry (even if empty)
      metricIds.forEach(metricId => {
        if (!dataMap.has(metricId)) {
          dataMap.set(metricId, [])
        }
      })

      return { success: true, data: dataMap }
    } catch (error) {
      console.error('Error fetching batch weekly data:', error)
      return { success: false, error: 'Failed to fetch batch weekly data' }
    }
  }

  // Calculate and save monthly summary
  async calculateMonthlySummary(
    month: number,
    year: number
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const supabase = this.getSupabase()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        return { success: false, error: 'User not authenticated' }
      }

      // Get all roles for user
      const { data: roles } = await supabase
        .from('scorecard_roles')
        .select('id, role_name')
        .eq('user_id', user.id)

      if (!roles || roles.length === 0) {
        return { success: false, error: 'No roles found. Please initialize scorecard first.' }
      }

      const roleAverages: number[] = []

      // Get all metrics for all roles at once (batch query for performance)
      const roleIds = roles.map((r: { id: string }) => r.id)
      const { data: allMetrics } = await supabase
        .from('scorecard_metrics')
        .select('*')
        .in('role_id', roleIds)
        .order('role_id, display_order', { ascending: true })

      // Group metrics by role_id
      const metricsByRole = new Map<string, typeof allMetrics>()
      if (allMetrics) {
        allMetrics.forEach((metric: { role_id: string; id: string }) => {
          if (!metricsByRole.has(metric.role_id)) {
            metricsByRole.set(metric.role_id, [])
          }
          metricsByRole.get(metric.role_id)!.push(metric)
        })
      }

      // Calculate month-specific week range
      const monthStartWeek = (month - 1) * 4 + 1
      const monthEndWeek = monthStartWeek + 3

      // Batch fetch ALL weekly data for all metrics in one query (major performance improvement)
      const metricIds = allMetrics?.map((m: { id: string }) => m.id) || []
      let allWeeklyData: any[] = []
      if (metricIds.length > 0) {
        const { data: weeklyData, error: weeklyDataError } = await supabase
          .from('scorecard_weekly_data')
          .select('metric_id, week_number, actual_value')
          .in('metric_id', metricIds)
          .gte('week_number', monthStartWeek)
          .lte('week_number', monthEndWeek)
          .eq('year', year)
        
        if (weeklyDataError) {
          console.error('[calculateMonthlySummary] Error fetching weekly data:', weeklyDataError)
        }
        
        allWeeklyData = weeklyData || []
        console.log(`[calculateMonthlySummary] Fetched ${allWeeklyData.length} weekly data records for month ${month}, year ${year}, week range ${monthStartWeek}-${monthEndWeek}`)
      }

      // Create a map: metricId -> weekNumber -> actualValue for fast lookup
      const weeklyDataMap = new Map<string, Map<number, number>>()
      allWeeklyData.forEach(wd => {
        if (!weeklyDataMap.has(wd.metric_id)) {
          weeklyDataMap.set(wd.metric_id, new Map())
        }
        weeklyDataMap.get(wd.metric_id)!.set(wd.week_number, Number(wd.actual_value))
      })

      // Calculate summary for each role
      for (const role of roles) {
        const metrics = metricsByRole.get(role.id) || []
        if (metrics.length === 0) continue

        const metricScores: MetricScore[] = []
        const percentages: number[] = []

        // Calculate scores for each metric using the batched weekly data
        for (const metric of metrics) {
          const metricWeeklyData = weeklyDataMap.get(metric.id) || new Map()
          
          const week1Value = metricWeeklyData.get(monthStartWeek) ?? 0
          const week2Value = metricWeeklyData.get(monthStartWeek + 1) ?? 0
          const week3Value = metricWeeklyData.get(monthStartWeek + 2) ?? 0
          const week4Value = metricWeeklyData.get(monthStartWeek + 3) ?? 0

          let actualValue = 0
          
          // Check if we have any data for this month (including 0 values that were explicitly saved)
          const hasWeek1Data = metricWeeklyData.has(monthStartWeek)
          const hasWeek2Data = metricWeeklyData.has(monthStartWeek + 1)
          const hasWeek3Data = metricWeeklyData.has(monthStartWeek + 2)
          const hasWeek4Data = metricWeeklyData.has(monthStartWeek + 3)
          
          // Debug logging
          if (hasWeek1Data || hasWeek2Data || hasWeek3Data || hasWeek4Data) {
            console.log(`[calculateMonthlySummary] Metric ${metric.metric_name} (${metric.id}):`, {
              monthStartWeek,
              week1Value,
              week2Value,
              week3Value,
              week4Value,
              hasWeek1Data,
              hasWeek2Data,
              hasWeek3Data,
              hasWeek4Data
            })
          }
          
          // If week 1 has data (even if 0) and weeks 2-4 are explicitly 0 or don't exist, this is monthly data entry
          if (hasWeek1Data && (!hasWeek2Data || week2Value === 0) && (!hasWeek3Data || week3Value === 0) && (!hasWeek4Data || week4Value === 0)) {
            // Monthly data entry - use week 1 value directly
            actualValue = week1Value
            console.log(`[calculateMonthlySummary] Using monthly data for ${metric.metric_name}: ${actualValue}`)
          } else if (hasWeek1Data || hasWeek2Data || hasWeek3Data || hasWeek4Data) {
            // This is actual weekly data - sum all weeks
            const totalActual = week1Value + week2Value + week3Value + week4Value
            // For ratings, average; for others, use sum
            actualValue = metric.metric_type === 'rating_1_5' || metric.metric_type === 'rating_scale'
              ? totalActual / 4
              : totalActual
            console.log(`[calculateMonthlySummary] Using weekly data for ${metric.metric_name}: ${actualValue} (sum: ${totalActual})`)
          } else {
            console.log(`[calculateMonthlySummary] No data found for ${metric.metric_name} (${metric.id}) for month ${month}`)
          }

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
        // Filter out Infinity and NaN values
        const validPercentages = percentages.filter(p => isFinite(p) && !isNaN(p))
        const averageGradePercentage = validPercentages.length > 0
          ? validPercentages.reduce((sum, p) => sum + p, 0) / validPercentages.length
          : 0
        const averageGrade = calculateGrade(averageGradePercentage)

        roleAverages.push(averageGradePercentage)

        // Save or update monthly summary
        const { data: existingSummary, error: existingSummaryError } = await supabase
          .from('scorecard_monthly_summaries')
          .select('id')
          .eq('role_id', role.id)
          .eq('month', month)
          .eq('year', year)
          .maybeSingle()

        if (existingSummaryError) {
          console.error(`[calculateMonthlySummary] Error checking existing summary for role ${role.role_name}:`, existingSummaryError)
        }

        const summaryData = {
          role_id: role.id,
          month,
          year,
          average_grade_percentage: averageGradePercentage,
          average_grade_letter: averageGrade,
        }

        let savedSummaryId: string | null = null

        if (existingSummary) {
          const { data: updatedSummary, error: updateError } = await supabase
            .from('scorecard_monthly_summaries')
            .update(summaryData)
            .eq('id', existingSummary.id)
            .select('id')
            .single()

          if (updateError) {
            console.error(`[calculateMonthlySummary] Error updating summary for role ${role.role_name}:`, updateError)
          } else {
            savedSummaryId = updatedSummary?.id || null
          }
        } else {
          const { data: insertedSummary, error: insertError } = await supabase
            .from('scorecard_monthly_summaries')
            .insert(summaryData)
            .select('id')
            .single()

          if (insertError) {
            console.error(`[calculateMonthlySummary] Error inserting summary for role ${role.role_name}:`, insertError)
            console.error(`[calculateMonthlySummary] Summary data:`, summaryData)
          } else {
            savedSummaryId = insertedSummary?.id || null
          }
        }

        // Save metric scores if we have a summary ID
        if (savedSummaryId) {
          // Delete existing metric scores
          const { error: deleteError } = await supabase
            .from('scorecard_metric_scores')
            .delete()
            .eq('monthly_summary_id', savedSummaryId)

          if (deleteError) {
            console.error(`[calculateMonthlySummary] Error deleting metric scores:`, deleteError)
          }

          // Insert new metric scores
          const scoresToInsert = metricScores.map(score => ({
            monthly_summary_id: savedSummaryId,
            metric_id: score.metricId,
            actual_value: score.actualValue,
            goal_value: score.goalValue,
            percentage_of_goal: score.percentageOfGoal,
            grade_letter: score.grade,
          }))

          const { error: insertScoresError } = await supabase
            .from('scorecard_metric_scores')
            .insert(scoresToInsert)

          if (insertScoresError) {
            console.error(`[calculateMonthlySummary] Error inserting metric scores for role ${role.role_name}:`, insertScoresError)
            console.error(`[calculateMonthlySummary] Scores to insert:`, scoresToInsert)
          }
        } else {
          console.warn(`[calculateMonthlySummary] Could not save summary for role ${role.role_name} - no summary ID available`)
        }
      }

      // Calculate company summary
      // Filter out Infinity and NaN values
      const validRoleAverages = roleAverages.filter(avg => isFinite(avg) && !isNaN(avg))
      const companyAverage = validRoleAverages.length > 0
        ? validRoleAverages.reduce((sum, avg) => sum + avg, 0) / validRoleAverages.length
        : 0
      const companyGrade = calculateGrade(companyAverage)

      // Save or update company summary
      const { data: existingCompanySummary, error: existingCompanyError } = await supabase
        .from('company_summaries')
        .select('id')
        .eq('user_id', user.id)
        .eq('month', month)
        .eq('year', year)
        .maybeSingle()

      if (existingCompanyError) {
        console.error(`[calculateMonthlySummary] Error checking existing company summary:`, existingCompanyError)
      }

      const companySummaryData = {
        user_id: user.id,
        month,
        year,
        company_average: companyAverage,
        company_grade: companyGrade,
      }

      if (existingCompanySummary) {
        const { error: updateCompanyError } = await supabase
          .from('company_summaries')
          .update(companySummaryData)
          .eq('id', existingCompanySummary.id)

        if (updateCompanyError) {
          console.error(`[calculateMonthlySummary] Error updating company summary:`, updateCompanyError)
          console.error(`[calculateMonthlySummary] Company summary data:`, companySummaryData)
        }
      } else {
        const { error: insertCompanyError } = await supabase
          .from('company_summaries')
          .insert(companySummaryData)

        if (insertCompanyError) {
          console.error(`[calculateMonthlySummary] Error inserting company summary:`, insertCompanyError)
          console.error(`[calculateMonthlySummary] Company summary data:`, companySummaryData)
        }
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
      const supabase = this.getSupabase()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        return { success: false, error: 'User not authenticated' }
      }

      // Get all roles
      const { data: roles } = await supabase
        .from('scorecard_roles')
        .select('id, role_name')
        .eq('user_id', user.id)
        .order('role_name', { ascending: true })

      if (!roles || roles.length === 0) {
        return { success: true, data: { month, year, periodType: 'month' as PeriodType, roleScorecards: [], companySummary: { companyAverage: 0, companyGrade: 'F', roleScorecards: [] } } }
      }

      const roleScorecards: RoleScorecard[] = []
      const roleAverages: number[] = []
      const roleIds = roles.map((r: { id: string }) => r.id)

      // Batch fetch all summaries for all roles at once (optimized)
      const { data: allSummaries } = await supabase
        .from('scorecard_monthly_summaries')
        .select('id, role_id, average_grade_percentage, average_grade_letter')
        .in('role_id', roleIds)
        .eq('month', month)
        .eq('year', year)

      // Create a map of role_id -> summary for quick lookup
      const summaryMap = new Map<string, typeof allSummaries[0]>()
      if (allSummaries) {
        allSummaries.forEach((summary: { role_id: string; id: string }) => {
          summaryMap.set(summary.role_id, summary)
        })
      }

      // Batch fetch all metrics for all roles at once (optimized)
      const { data: allMetrics } = await supabase
        .from('scorecard_metrics')
        .select('*')
        .in('role_id', roleIds)
        .order('display_order', { ascending: true })

      // Group metrics by role_id
      const metricsByRole = new Map<string, typeof allMetrics>()
      if (allMetrics) {
        allMetrics.forEach((metric: { role_id: string; id: string }) => {
          if (!metricsByRole.has(metric.role_id)) {
            metricsByRole.set(metric.role_id, [])
          }
          metricsByRole.get(metric.role_id)!.push(metric)
        })
      }

      // Batch fetch all metric scores if we have summaries
      const summaryIds = allSummaries?.map((s: { id: string }) => s.id) || []
      let allMetricScores: any[] = []
      if (summaryIds.length > 0) {
        const { data: metricScoresData, error: metricScoresError } = await supabase
          .from('scorecard_metric_scores')
          .select(`
            *,
            scorecard_metrics!inner (
              metric_name,
              metric_type,
              display_order
            )
          `)
          .in('monthly_summary_id', summaryIds)
          .order('scorecard_metrics(display_order)', { ascending: true })
        
        if (metricScoresError) {
          console.error('Error fetching metric scores:', metricScoresError)
        }
        allMetricScores = metricScoresData || []
      }

      // Fetch weekly data for on-the-fly calculation when summaries don't exist
      const monthStartWeek = (month - 1) * 4 + 1
      const monthEndWeek = monthStartWeek + 3
      const metricIds = allMetrics?.map((m: { id: string }) => m.id) || []
      let weeklyDataMap = new Map<string, Map<number, number>>()
      
      if (metricIds.length > 0) {
        const { data: weeklyData, error: weeklyDataError } = await supabase
          .from('scorecard_weekly_data')
          .select('metric_id, week_number, actual_value')
          .in('metric_id', metricIds)
          .gte('week_number', monthStartWeek)
          .lte('week_number', monthEndWeek)
          .eq('year', year)
        
        if (weeklyDataError) {
          console.error('Error fetching weekly data in getMonthlyScorecard:', weeklyDataError)
        } else if (weeklyData) {
          weeklyData.forEach((wd: { metric_id: string; week_number: number; actual_value: number }) => {
            if (!weeklyDataMap.has(wd.metric_id)) {
              weeklyDataMap.set(wd.metric_id, new Map())
            }
            weeklyDataMap.get(wd.metric_id)!.set(wd.week_number, Number(wd.actual_value))
          })
        }
      }

      // Group metric scores by summary_id
      const metricScoresBySummary = new Map<string, typeof allMetricScores>()
      allMetricScores.forEach(ms => {
        const summaryId = ms.monthly_summary_id
        if (!metricScoresBySummary.has(summaryId)) {
          metricScoresBySummary.set(summaryId, [])
        }
        metricScoresBySummary.get(summaryId)!.push(ms)
      })

      // Process each role using the batched data
      for (const role of roles) {
        const summary = summaryMap.get(role.id)

        if (!summary) {
          // No summary exists - calculate on-the-fly from weekly data
          const metrics = metricsByRole.get(role.id) || []
          const monthStartWeek = (month - 1) * 4 + 1
          const metricScores: MetricScore[] = []
          const percentages: number[] = []

          for (const metric of metrics) {
            // Get weekly data for this metric
            const metricWeeklyData = weeklyDataMap.get(metric.id) || new Map()
            
            const week1Value = metricWeeklyData.get(monthStartWeek) ?? 0
            const week2Value = metricWeeklyData.get(monthStartWeek + 1) ?? 0
            const week3Value = metricWeeklyData.get(monthStartWeek + 2) ?? 0
            const week4Value = metricWeeklyData.get(monthStartWeek + 3) ?? 0

            let actualValue = 0
            
            const hasWeek1Data = metricWeeklyData.has(monthStartWeek)
            const hasWeek2Data = metricWeeklyData.has(monthStartWeek + 1)
            const hasWeek3Data = metricWeeklyData.has(monthStartWeek + 2)
            const hasWeek4Data = metricWeeklyData.has(monthStartWeek + 3)
            
            if (hasWeek1Data && (!hasWeek2Data || week2Value === 0) && (!hasWeek3Data || week3Value === 0) && (!hasWeek4Data || week4Value === 0)) {
              actualValue = week1Value
            } else if (hasWeek1Data || hasWeek2Data || hasWeek3Data || hasWeek4Data) {
              const totalActual = week1Value + week2Value + week3Value + week4Value
              actualValue = metric.metric_type === 'rating_1_5' || metric.metric_type === 'rating_scale'
                ? totalActual / 4
                : totalActual
            }

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

          const averageGradePercentage = percentages.length > 0
            ? percentages.reduce((sum, p) => sum + p, 0) / percentages.length
            : 0
          const averageGrade = calculateGrade(averageGradePercentage)

          const separatedScores = calculateSeparateScores(metricScores)
          roleScorecards.push({
            roleId: role.id,
            roleName: role.role_name as ScorecardRole,
            metrics: metricScores,
            averageGradePercentage,
            averageGrade,
            ...separatedScores,
          })
          continue
        }

        // Get metric scores from batched data
        const metricScores = metricScoresBySummary.get(summary.id) || []
        const scores: MetricScore[] = []
        
        for (const ms of metricScores) {
          // Get metric name from join or fallback to looking it up from metricsByRole
          let metricName = ''
          let metricType: MetricType = 'count'
          
          // Try to get from join first
          if (ms.scorecard_metrics) {
            const metricData = Array.isArray(ms.scorecard_metrics) ? ms.scorecard_metrics[0] : ms.scorecard_metrics
            metricName = metricData?.metric_name || ''
            metricType = (metricData?.metric_type as MetricType) || 'count'
          }
          
          // Fallback: look up from metricsByRole if join didn't work
          if (!metricName) {
            const roleMetrics = metricsByRole.get(role.id) || []
            const metric = roleMetrics.find((m: { id: string }) => m.id === ms.metric_id)
            if (metric) {
              metricName = metric.metric_name
              metricType = metric.metric_type
            }
          }
          
          scores.push({
            metricId: ms.metric_id,
            metricName: metricName || 'Unknown Metric',
            metricType: metricType,
            goalValue: Number(ms.goal_value),
            actualValue: Number(ms.actual_value),
            percentageOfGoal: Number(ms.percentage_of_goal),
            grade: ms.grade_letter as Grade,
          })
        }

        const avgPercentage = Number(summary.average_grade_percentage) || 0
        roleAverages.push(avgPercentage)

        const separatedScores = calculateSeparateScores(scores)
        
        // Debug: Log to help identify issues with core behaviors
        if (separatedScores.defaultMetrics.length === 0 && scores.length > 0) {
          console.warn(`No core behaviors found for role ${role.role_name}. Metric names:`, scores.map(s => s.metricName))
        }
        
        roleScorecards.push({
          roleId: role.id,
          roleName: role.role_name as ScorecardRole,
          metrics: scores,
          averageGradePercentage: avgPercentage,
          averageGrade: (summary.average_grade_letter as Grade) || 'F',
          ...separatedScores,
        })
      }

      // Get company summary
      const { data: companySummary } = await supabase
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
      const supabase = this.getSupabase()
      const { data, error } = await supabase
        .from('scorecard_metrics')
        .select('*')
        .eq('role_id', roleId)
        .order('display_order', { ascending: true })

      if (error) {
        return { success: false, error: error.message }
      }

      const metrics: ScorecardMetric[] = data?.map((m: { id: string; role_id: string; metric_name: string; metric_type: string; goal_value: number; is_inverted: boolean; display_order: number; is_visible?: boolean }) => ({
        id: m.id,
        roleId: m.role_id,
        metricName: m.metric_name,
        metricType: m.metric_type as MetricType,
        goalValue: Number(m.goal_value),
        isInverted: m.is_inverted,
        displayOrder: m.display_order,
        isVisible: m.is_visible ?? true,
      })) || []

      // Ensure core behaviors are present
      const existingMetricNames = new Set(metrics.map(m => m.metricName))
      const missingCoreBehaviors = CORE_BEHAVIOR_METRICS.filter(
        core => !existingMetricNames.has(core.metricName)
      )

      if (missingCoreBehaviors.length > 0) {
        // Add missing core behaviors
        const maxDisplayOrder = metrics.length > 0
          ? Math.max(...metrics.map(m => m.displayOrder || 0))
          : 998

        for (let i = 0; i < missingCoreBehaviors.length; i++) {
          const coreMetric = missingCoreBehaviors[i]
          const { data: newMetric, error: insertError } = await supabase
            .from('scorecard_metrics')
            .insert({
              role_id: roleId,
              metric_name: coreMetric.metricName,
              metric_type: coreMetric.metricType,
              goal_value: coreMetric.goalValue,
              is_inverted: coreMetric.isInverted,
              display_order: maxDisplayOrder + 1 + i,
            })
            .select('id')
            .single()

          if (!insertError && newMetric) {
            metrics.push({
              id: newMetric.id,
              roleId: roleId,
              metricName: coreMetric.metricName,
              metricType: coreMetric.metricType,
              goalValue: coreMetric.goalValue,
              isInverted: coreMetric.isInverted,
              displayOrder: maxDisplayOrder + 1 + i,
              isVisible: true,
            })
          }
        }

        // Sort by display order
        metrics.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
      }

      return {
        success: true,
        data: metrics,
      }
    } catch (error) {
      console.error('Error fetching role metrics:', error)
      return { success: false, error: 'Failed to fetch role metrics' }
    }
  }

  // Get all metrics for multiple roles (batch query for performance)
  async getAllRoleMetrics(roleIds: string[]): Promise<Map<string, ScorecardMetric[]>> {
    const metricsMap = new Map<string, ScorecardMetric[]>()
    
    if (!roleIds || roleIds.length === 0) {
      return metricsMap
    }

    try {
      const supabase = this.getSupabase()
      const { data, error } = await supabase
        .from('scorecard_metrics')
        .select('*')
        .in('role_id', roleIds)
        .order('display_order', { ascending: true })

      if (error) {
        console.error('Error fetching all role metrics:', error)
        return metricsMap
      }

      // Group metrics by role_id
      if (data) {
        data.forEach((m: { id: string; role_id: string; metric_name: string; metric_type: string; goal_value: number; is_inverted: boolean; display_order: number; is_visible?: boolean }) => {
          const metric: ScorecardMetric = {
            id: m.id,
            roleId: m.role_id,
            metricName: m.metric_name,
            metricType: m.metric_type as MetricType,
            goalValue: Number(m.goal_value),
            isInverted: m.is_inverted,
            displayOrder: m.display_order,
            isVisible: m.is_visible ?? true,
          }

          if (!metricsMap.has(m.role_id)) {
            metricsMap.set(m.role_id, [])
          }
          metricsMap.get(m.role_id)!.push(metric)
        })
      }

      // Ensure all roleIds have an entry (even if empty)
      roleIds.forEach(roleId => {
        if (!metricsMap.has(roleId)) {
          metricsMap.set(roleId, [])
        }
      })

      // Ensure core behaviors are present for all roles
      // This is a safety check - they should already be in the database
      // If missing, add them immediately to the database and include them in the result
      for (const roleId of roleIds) {
        const roleMetrics = metricsMap.get(roleId) || []
        const existingMetricNames = new Set(roleMetrics.map(m => m.metricName))
        
        // Check if any core behaviors are missing
        const missingCoreBehaviors = CORE_BEHAVIOR_METRICS.filter(
          core => !existingMetricNames.has(core.metricName)
        )
        
        if (missingCoreBehaviors.length > 0) {
          // Find max display order to place core behaviors after existing metrics
          const maxDisplayOrder = roleMetrics.length > 0
            ? Math.max(...roleMetrics.map(m => m.displayOrder || 0))
            : 998
          
          // Add missing core behaviors to database immediately (synchronously)
          const { data: { user } } = await supabase.auth.getUser()
          if (user) {
            // Add missing core behaviors to database
            for (let i = 0; i < missingCoreBehaviors.length; i++) {
              const coreMetric = missingCoreBehaviors[i]
              const { data: newMetric, error } = await supabase
                .from('scorecard_metrics')
                .insert({
                  role_id: roleId,
                  metric_name: coreMetric.metricName,
                  metric_type: coreMetric.metricType,
                  goal_value: coreMetric.goalValue,
                  is_inverted: coreMetric.isInverted,
                  display_order: maxDisplayOrder + 1 + i,
                })
                .select('id')
                .single()

              if (!error && newMetric) {
                // Add to metrics map immediately
                const newScorecardMetric: ScorecardMetric = {
                  id: newMetric.id,
                  roleId: roleId,
                  metricName: coreMetric.metricName,
                  metricType: coreMetric.metricType,
                  goalValue: coreMetric.goalValue,
                  isInverted: coreMetric.isInverted,
                  displayOrder: maxDisplayOrder + 1 + i,
                  isVisible: true,
                }
                roleMetrics.push(newScorecardMetric)
              }
            }
            
            // Sort by display order and update map
            roleMetrics.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
            metricsMap.set(roleId, roleMetrics)
          }
        }
      }

      return metricsMap
    } catch (error) {
      console.error('Error fetching all role metrics:', error)
      return metricsMap
    }
  }

  // Helper method to ensure core behaviors exist for a specific role
  private async ensureCoreBehaviorsForRole(roleId: string): Promise<void> {
    try {
      const supabase = this.getSupabase()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) return

      // Get existing metrics for this role
      const { data: existingMetrics } = await supabase
        .from('scorecard_metrics')
        .select('metric_name, display_order')
        .eq('role_id', roleId)

      const existingMetricNames = new Set(existingMetrics?.map((m: { metric_name: string }) => m.metric_name) || [])
      const maxDisplayOrder = existingMetrics && existingMetrics.length > 0
        ? Math.max(...existingMetrics.map((m: { display_order?: number }) => m.display_order || 0))
        : 998

      // Add missing core behaviors
      for (let i = 0; i < CORE_BEHAVIOR_METRICS.length; i++) {
        const coreMetric = CORE_BEHAVIOR_METRICS[i]
        if (!existingMetricNames.has(coreMetric.metricName)) {
          const { error } = await supabase
            .from('scorecard_metrics')
            .insert({
              role_id: roleId,
              metric_name: coreMetric.metricName,
              metric_type: coreMetric.metricType,
              goal_value: coreMetric.goalValue,
              is_inverted: coreMetric.isInverted,
              display_order: maxDisplayOrder + 1 + i,
            })

          if (error) {
            console.error(`Error adding core behavior ${coreMetric.metricName} to role:`, error)
          }
        }
      }
    } catch (error) {
      console.error('Error ensuring core behaviors for role:', error)
    }
  }

  // Get quarterly scorecard data
  async getQuarterlyScorecard(
    quarter: number,
    year: number
  ): Promise<{ success: boolean; data?: MonthlyScorecardData; error?: string }> {
    try {
      const supabase = this.getSupabase()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        return { success: false, error: 'User not authenticated' }
      }

      const months = this.getMonthsInQuarter(quarter)
      const roleScorecards: RoleScorecard[] = []
      const roleAverages: number[] = []

      // Get all roles
      const { data: roles } = await supabase
        .from('scorecard_roles')
        .select('id, role_name')
        .eq('user_id', user.id)
        .order('role_name', { ascending: true })

      if (!roles || roles.length === 0) {
        return { success: true, data: { quarter, year, periodType: 'quarter' as PeriodType, roleScorecards: [], companySummary: { companyAverage: 0, companyGrade: 'F', roleScorecards: [] } } }
      }

        // Aggregate data for each role across the quarter
        for (const role of roles) {
          const { data: metrics } = await supabase
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
            const { data: summary } = await supabase
              .from('scorecard_monthly_summaries')
              .select('id')
              .eq('role_id', role.id)
              .eq('month', month)
              .eq('year', year)
              .maybeSingle()

            if (summary) {
              const { data: metricScore } = await supabase
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

        const separatedScores = calculateSeparateScores(metricScores)
        roleScorecards.push({
          roleId: role.id,
          roleName: role.role_name as ScorecardRole,
          metrics: metricScores,
          averageGradePercentage,
          averageGrade,
          ...separatedScores,
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
      const supabase = this.getSupabase()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        return { success: false, error: 'User not authenticated' }
      }

      const roleScorecards: RoleScorecard[] = []
      const roleAverages: number[] = []

      // Get all roles
      const { data: roles } = await supabase
        .from('scorecard_roles')
        .select('id, role_name')
        .eq('user_id', user.id)
        .order('role_name', { ascending: true })

      if (!roles || roles.length === 0) {
        return { success: true, data: { year, periodType: 'year' as PeriodType, roleScorecards: [], companySummary: { companyAverage: 0, companyGrade: 'F', roleScorecards: [] } } }
      }

      // Aggregate data for each role across the year
      for (const role of roles) {
        const { data: metrics } = await supabase
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
            const { data: summary } = await supabase
              .from('scorecard_monthly_summaries')
              .select('id')
              .eq('role_id', role.id)
              .eq('month', month)
              .eq('year', year)
              .maybeSingle()

            if (summary) {
              const { data: metricScore } = await supabase
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

        const separatedScores = calculateSeparateScores(metricScores)
        roleScorecards.push({
          roleId: role.id,
          roleName: role.role_name as ScorecardRole,
          metrics: metricScores,
          averageGradePercentage,
          averageGrade,
          ...separatedScores,
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
      const supabase = this.getSupabase()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        return { success: false, error: 'User not authenticated' }
      }

      // Validate goal value
      if (isNaN(goalValue) || goalValue < 0) {
        return { success: false, error: 'Goal value must be a positive number' }
      }

      // Verify the metric belongs to a role owned by the user
      const { data: metric, error: metricError } = await supabase
        .from('scorecard_metrics')
        .select('id, role_id')
        .eq('id', metricId)
        .single()

      if (metricError || !metric) {
        return { success: false, error: 'Metric not found' }
      }

      // Verify the role belongs to the user
      const { data: role, error: roleError } = await supabase
        .from('scorecard_roles')
        .select('id, user_id')
        .eq('id', metric.role_id)
        .eq('user_id', user.id)
        .single()

      if (roleError || !role) {
        return { success: false, error: 'Access denied. You can only update metrics for your own roles.' }
      }

      // Update the goal value
      const { error } = await supabase
        .from('scorecard_metrics')
        .update({ goal_value: goalValue })
        .eq('id', metricId)

      if (error) {
        console.error('Error updating metric goal:', error)
        return { success: false, error: error.message || 'Failed to update metric goal' }
      }

      return { success: true }
    } catch (error) {
      console.error('Error updating metric goal:', error)
      return { success: false, error: 'Failed to update metric goal' }
    }
  }

  // Batch update metric goals (much faster than individual updates)
  async batchUpdateMetricGoals(
    goalUpdates: Array<{ metricId: string; goalValue: number }>
  ): Promise<{ success: boolean; errors?: Array<{ metricId: string; error: string }> }> {
    try {
      if (!goalUpdates || goalUpdates.length === 0) {
        return { success: true }
      }

      const supabase = this.getSupabase()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        return { 
          success: false, 
          errors: goalUpdates.map(update => ({ metricId: update.metricId, error: 'User not authenticated' })) 
        }
      }

      // Validate all goal values
      const invalidUpdates = goalUpdates.filter(update => isNaN(update.goalValue) || update.goalValue < 0)
      if (invalidUpdates.length > 0) {
        return {
          success: false,
          errors: invalidUpdates.map(update => ({ 
            metricId: update.metricId, 
            error: 'Goal value must be a positive number' 
          }))
        }
      }

      // Get all metric IDs to verify they belong to user's roles
      const metricIds = goalUpdates.map(update => update.metricId)
      const { data: metrics, error: metricsError } = await supabase
        .from('scorecard_metrics')
        .select('id, role_id')
        .in('id', metricIds)

      if (metricsError || !metrics) {
        return {
          success: false,
          errors: goalUpdates.map(update => ({ metricId: update.metricId, error: 'Failed to verify metrics' }))
        }
      }

      // Get all role IDs for the user
      const { data: userRoles, error: rolesError } = await supabase
        .from('scorecard_roles')
        .select('id')
        .eq('user_id', user.id)

      if (rolesError || !userRoles) {
        return {
          success: false,
          errors: goalUpdates.map(update => ({ metricId: update.metricId, error: 'Failed to verify access' }))
        }
      }

      const userRoleIds = new Set(userRoles.map((r: { id: string }) => r.id))
      const validMetrics = metrics.filter((m: { role_id: string }) => userRoleIds.has(m.role_id))
      const validMetricIds = new Set(validMetrics.map((m: { id: string }) => m.id))

      // Filter out invalid updates
      const invalidAccess = goalUpdates.filter(update => !validMetricIds.has(update.metricId))
      if (invalidAccess.length > 0) {
        return {
          success: false,
          errors: invalidAccess.map(update => ({ 
            metricId: update.metricId, 
            error: 'Access denied. You can only update metrics for your own roles.' 
          }))
        }
      }

      // Batch update all goals using a single query per metric (Supabase doesn't support bulk update with different values)
      // But we can use Promise.all to run them in parallel
      const updatePromises = goalUpdates.map(async (update) => {
        const { error } = await supabase
          .from('scorecard_metrics')
          .update({ goal_value: update.goalValue })
          .eq('id', update.metricId)

        if (error) {
          return { metricId: update.metricId, error: error.message || 'Failed to update goal' }
        }
        return null
      })

      const results = await Promise.all(updatePromises)
      const errors = results.filter((r): r is { metricId: string; error: string } => r !== null)

      if (errors.length > 0) {
        return { success: false, errors }
      }

      return { success: true }
    } catch (error) {
      console.error('Error batch updating metric goals:', error)
      return {
        success: false,
        errors: goalUpdates.map(update => ({ 
          metricId: update.metricId, 
          error: error instanceof Error ? error.message : 'Failed to update metric goal' 
        }))
      }
    }
  }

  // Update metric visibility settings for multiple metrics
  async updateMetricVisibilities(updates: Array<{ metricId: string; isVisible: boolean }>): Promise<{ success: boolean; error?: string }> {
    try {
      const supabase = this.getSupabase()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        return { success: false, error: 'User not authenticated' }
      }

      if (!updates || updates.length === 0) {
        return { success: true }
      }

      // Update each metric's visibility
      for (const update of updates) {
        const { error } = await supabase
          .from('scorecard_metrics')
          .update({ is_visible: update.isVisible })
          .eq('id', update.metricId)

        if (error) {
          console.error(`Error updating visibility for metric ${update.metricId}:`, error)
          return { success: false, error: error.message || 'Failed to update metric visibility' }
        }
      }

      return { success: true }
    } catch (error) {
      console.error('Error updating metric visibilities:', error)
      return { success: false, error: 'Failed to update metric visibilities' }
    }
  }

  // Create a new metric
  async createMetric(data: {
    roleId: string
    metricName: string
    metricType: MetricType
    goalValue: number
    isInverted: boolean
    isVisible?: boolean
  }): Promise<{ success: boolean; error?: string; metricId?: string }> {
    try {
      const supabase = this.getSupabase()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        return { success: false, error: 'User not authenticated' }
      }

      // Verify the role belongs to the user
      const { data: role, error: roleError } = await supabase
        .from('scorecard_roles')
        .select('id')
        .eq('id', data.roleId)
        .eq('user_id', user.id)
        .single()

      if (roleError || !role) {
        return { success: false, error: 'Role not found or access denied' }
      }

      // Get the highest display_order for this role to append the new metric
      const { data: existingMetrics } = await supabase
        .from('scorecard_metrics')
        .select('display_order')
        .eq('role_id', data.roleId)
        .order('display_order', { ascending: false })
        .limit(1)

      const maxDisplayOrder = existingMetrics && existingMetrics.length > 0
        ? existingMetrics[0].display_order
        : 0

      // Create the metric
      const { data: newMetric, error: metricError } = await supabase
        .from('scorecard_metrics')
        .insert({
          role_id: data.roleId,
          metric_name: data.metricName,
          metric_type: data.metricType,
          goal_value: data.goalValue,
          is_inverted: data.isInverted,
          is_visible: data.isVisible ?? true,
          display_order: maxDisplayOrder + 1,
        })
        .select('id')
        .single()

      if (metricError) {
        console.error('Error creating metric:', metricError)
        return { success: false, error: metricError.message || 'Failed to create metric' }
      }

      return { success: true, metricId: newMetric.id }
    } catch (error) {
      console.error('Error creating metric:', error)
      return { success: false, error: 'Failed to create metric' }
    }
  }

  // Delete a metric
  async deleteMetric(metricId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const supabase = this.getSupabase()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        return { success: false, error: 'User not authenticated' }
      }

      // Get the metric to find its role_id
      const { data: metric, error: metricError } = await supabase
        .from('scorecard_metrics')
        .select('id, role_id')
        .eq('id', metricId)
        .single()

      if (metricError || !metric) {
        return { success: false, error: 'Metric not found' }
      }

      // Verify the role belongs to the user
      const { data: role, error: roleError } = await supabase
        .from('scorecard_roles')
        .select('id, user_id')
        .eq('id', metric.role_id)
        .eq('user_id', user.id)
        .single()

      if (roleError || !role) {
        return { success: false, error: 'Access denied. You can only delete metrics for your own roles.' }
      }

      // Delete the metric (cascade will delete weekly data, metric scores, etc.)
      const { error: deleteError } = await supabase
        .from('scorecard_metrics')
        .delete()
        .eq('id', metricId)

      if (deleteError) {
        console.error('Error deleting metric:', deleteError)
        return { success: false, error: deleteError.message || 'Failed to delete metric' }
      }

      return { success: true }
    } catch (error) {
      console.error('Error deleting metric:', error)
      return { success: false, error: 'Failed to delete metric' }
    }
  }
}

export const behaviorScorecardService = new BehaviorScorecardService()

