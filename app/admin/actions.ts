"use server"

import { createClient } from "@supabase/supabase-js"
import { calculateGrade, calculatePercentageOfGoal, isDefaultMetric } from "@/lib/behavior-scorecard"
import type { MonthlyScorecardData, RoleScorecard, MetricScore, Grade } from "@/lib/behavior-scorecard"

export async function getAdminUsers() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase environment variables")
    }

    const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Get all profiles using admin client
    const { data: profiles, error: profilesError } = await adminClient
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false })

    if (profilesError) {
      console.error("Error loading profiles:", profilesError)
      throw profilesError
    }

    // Calculate real stats for each user
    const usersWithData = await Promise.all(
      profiles.map(async (profile: any) => {
        try {
          // Get events count
          const { count: eventsCount } = await adminClient
            .from("marketing_events")
            .select("*", { count: "exact", head: true })
            .eq("user_id", profile.id)

          // Get user's events first
          const { data: userEvents } = await adminClient
            .from("marketing_events")
            .select("id")
            .eq("user_id", profile.id)

          const eventIds = userEvents?.map((e: any) => e.id) || []

          // Get total clients from event attendance
          let totalClients = 0
          if (eventIds.length > 0) {
            const { data: attendanceData } = await adminClient
              .from("event_attendance")
              .select("clients_from_event")
              .in("event_id", eventIds)

            totalClients = attendanceData?.reduce((sum: number, att: any) => {
              return sum + (Number(att.clients_from_event) || 0)
            }, 0) || 0
          }

          // Get total revenue from financial production
          let totalRevenue = 0
          if (eventIds.length > 0) {
            const { data: financialData } = await adminClient
              .from("financial_production")
              .select("total")
              .in("event_id", eventIds)

            totalRevenue = financialData?.reduce((sum: number, fin: any) => {
              return sum + (Number(fin.total) || 0)
            }, 0) || 0
          }

          return {
            profile,
            events_count: eventsCount || 0,
            total_revenue: totalRevenue,
            total_clients: totalClients,
          }
        } catch (error) {
          console.error(`Error calculating stats for user ${profile.id}:`, error)
          return {
            profile,
            events_count: 0,
            total_revenue: 0,
            total_clients: 0,
          }
        }
      })
    )

    return { success: true, data: usersWithData }
  } catch (error) {
    console.error("Error in getAdminUsers:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

export async function getUserDetails(userId: string) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase environment variables")
    }

    const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Get advisor basecamp data - handle errors gracefully
    // Get current year's business goals
    const currentYear = new Date().getFullYear()
    const { data: advisorData, error: advisorError } = await adminClient
      .from("business_goals")
      .select("*")
      .eq("user_id", userId)
      .eq("year", currentYear)
      .maybeSingle()

    // Get current year's current values
    const { data: currentValues, error: currentError } = await adminClient
      .from("current_values")
      .select("*")
      .eq("user_id", userId)
      .eq("year", currentYear)
      .maybeSingle()

    const { data: clientMetrics, error: metricsError } = await adminClient
      .from("client_metrics")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle()

    const { data: campaigns, error: campaignsError } = await adminClient
      .from("marketing_campaigns")
      .select("*")
      .eq("user_id", userId)

    const { data: commissionRates, error: ratesError } = await adminClient
      .from("commission_rates")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle()

    const { data: financialBook, error: bookError } = await adminClient
      .from("financial_book")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle()

    // Get all events with related data
    const { data: events, error: eventsError } = await adminClient
      .from("marketing_events")
      .select(`
        *,
        event_attendance (*),
        event_appointments (*),
        marketing_expenses (*),
        financial_production (*)
      `)
      .eq("user_id", userId)
      .order("date", { ascending: false })

    // Get monthly data entries
    const { data: monthlyData, error: monthlyError } = await adminClient
      .from("monthly_data_entries")
      .select("*")
      .eq("user_id", userId)
      .order("month_year", { ascending: false })

    // Get behavior scorecard data
    const { data: scorecardRoles, error: scorecardRolesError } = await adminClient
      .from("scorecard_roles")
      .select("*")
      .eq("user_id", userId)
      .order("role_name", { ascending: true })

    let scorecardData: any = null
    if (scorecardRoles && scorecardRoles.length > 0) {
      const roleIds = scorecardRoles.map((r: any) => r.id)
      
      // Get current month's summaries
      const currentDate = new Date()
      const currentMonth = currentDate.getMonth() + 1
      const currentYear = currentDate.getFullYear()
      
      const { data: monthlySummaries } = await adminClient
        .from("scorecard_monthly_summaries")
        .select(`
          *,
          scorecard_metric_scores (
            *,
            scorecard_metrics (*)
          )
        `)
        .in("role_id", roleIds)
        .eq("month", currentMonth)
        .eq("year", currentYear)

      // Get company summaries
      const { data: companySummaries } = await adminClient
        .from("company_summaries")
        .select("*")
        .eq("user_id", userId)
        .eq("month", currentMonth)
        .eq("year", currentYear)
        .maybeSingle()

      // Get all metrics for all roles
      const { data: allMetrics } = await adminClient
        .from("scorecard_metrics")
        .select("*")
        .in("role_id", roleIds)
        .order("display_order", { ascending: true })

      scorecardData = {
        roles: scorecardRoles,
        monthlySummaries: monthlySummaries || [],
        companySummary: companySummaries,
        metrics: allMetrics || [],
      }
    }

    // Structure data to match expected format
    // Get monthly data entries for advisor data structure
    const advisorDataStructured = {
      businessGoals: advisorData,
      currentValues,
      clientMetrics,
      campaigns: campaigns || [],
      monthlyDataEntries: monthlyData || [],
    }

    return {
      success: true,
      data: {
        advisorData: advisorDataStructured,
        currentValues,
        clientMetrics,
        campaigns: campaigns || [],
        commissionRates,
        financialBook,
        events: events || [],
        monthlyData: monthlyData || [],
        scorecardData,
      }
    }
  } catch (error) {
    console.error("Error in getUserDetails:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

export async function getProfileForViewAs(userId: string) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase environment variables")
    }

    const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    const { data: profile, error } = await adminClient
      .from("profiles")
      .select("id, full_name, email")
      .eq("id", userId)
      .maybeSingle()

    if (error) {
      console.error("Error fetching profile for view-as:", error)
      return { success: false, error: error.message }
    }

    if (!profile) {
      return { success: false, error: "User not found" }
    }

    return { success: true, data: profile }
  } catch (error) {
    console.error("Error in getProfileForViewAs:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

/** Fetch full advisor basecamp data for the viewed user (admin client, bypasses RLS). */
export async function getAdvisorBasecampDataForViewAs(
  userId: string,
  year: number
): Promise<{ success: boolean; data?: import("@/lib/advisor-basecamp").AdvisorBasecampData; error?: string }> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!supabaseUrl || !supabaseServiceKey) {
      return { success: false, error: "Missing Supabase environment variables" }
    }
    const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    const [
      businessGoals,
      currentValues,
      clientMetrics,
      campaigns,
      commissionRates,
      financialBook,
      financialOptions,
      monthlyDataEntriesResult,
    ] = await Promise.all([
      adminClient.from("business_goals").select("*").eq("user_id", userId).eq("year", year).maybeSingle(),
      adminClient.from("current_values").select("*").eq("user_id", userId).eq("year", year).maybeSingle(),
      adminClient.from("client_metrics").select("*").eq("user_id", userId).eq("year", year).maybeSingle(),
      adminClient.from("marketing_campaigns").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
      adminClient.from("commission_rates").select("*").eq("user_id", userId).eq("year", year).maybeSingle(),
      adminClient.from("financial_book").select("*").eq("user_id", userId).eq("year", year).maybeSingle(),
      adminClient.from("financial_options").select("*").eq("user_id", userId).eq("year", year).maybeSingle(),
      (async () => {
        const pageSize = 1000
        let all: any[] = []
        let from = 0
        while (true) {
          const { data: page } = await adminClient
            .from("monthly_data_entries")
            .select("*")
            .eq("user_id", userId)
            .order("month_year", { ascending: false })
            .range(from, from + pageSize - 1)
          if (!page?.length) break
          all = all.concat(page)
          if (page.length < pageSize) break
          from += pageSize
        }
        return { data: all }
      })(),
    ])

    const data: import("@/lib/advisor-basecamp").AdvisorBasecampData = {
      businessGoals: businessGoals.data ?? null,
      currentValues: currentValues.data ?? null,
      clientMetrics: clientMetrics.data ?? null,
      campaigns: (campaigns.data ?? []) as import("@/lib/advisor-basecamp").MarketingCampaign[],
      commissionRates: commissionRates.data ?? null,
      financialBook: financialBook.data ?? null,
      financialOptions: financialOptions.data ?? null,
      monthlyDataEntries: (monthlyDataEntriesResult.data ?? []) as import("@/lib/advisor-basecamp").MonthlyDataEntry[],
    }
    return { success: true, data }
  } catch (error) {
    console.error("Error in getAdvisorBasecampDataForViewAs:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

export async function getScorecardDataForViewAs(
  userId: string,
  periodType: "month" | "quarter" | "year",
  monthOrQuarter: number,
  year: number
): Promise<{ success: boolean; data?: MonthlyScorecardData; error?: string }> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!supabaseUrl || !supabaseServiceKey) {
      return { success: false, error: "Missing Supabase environment variables" }
    }
    const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    const month = periodType === "month" ? monthOrQuarter : periodType === "quarter" ? (monthOrQuarter - 1) * 3 + 1 : 1

    const { data: roles, error: rolesError } = await adminClient
      .from("scorecard_roles")
      .select("id, role_name, person_name")
      .eq("user_id", userId)
      .order("role_name", { ascending: true })

    if (rolesError) return { success: false, error: rolesError.message }
    if (!roles || roles.length === 0) {
      const empty: MonthlyScorecardData = {
        month: periodType === "month" ? monthOrQuarter : undefined,
        quarter: periodType === "quarter" ? monthOrQuarter : undefined,
        year,
        periodType,
        roleScorecards: [],
        companySummary: { companyAverage: 0, companyGrade: "F", roleScorecards: [] },
      }
      return { success: true, data: empty }
    }

    const roleIds = roles.map((r: { id: string }) => r.id)
    const { data: allSummaries } = await adminClient
      .from("scorecard_monthly_summaries")
      .select("id, role_id, average_grade_percentage, average_grade_letter")
      .in("role_id", roleIds)
      .eq("month", month)
      .eq("year", year)

    const summaryMap = new Map<string, any>()
    if (allSummaries) allSummaries.forEach((s: any) => summaryMap.set(s.role_id, s))

    const { data: allMetrics } = await adminClient
      .from("scorecard_metrics")
      .select("*")
      .in("role_id", roleIds)
      .order("display_order", { ascending: true })

    const metricsByRole = new Map<string, any[]>()
    if (allMetrics) {
      allMetrics.forEach((m: any) => {
        if (!metricsByRole.has(m.role_id)) metricsByRole.set(m.role_id, [])
        metricsByRole.get(m.role_id)!.push(m)
      })
    }

    const summaryIds = allSummaries?.map((s: any) => s.id) || []
    let allMetricScores: any[] = []
    if (summaryIds.length > 0) {
      const { data: scores } = await adminClient
        .from("scorecard_metric_scores")
        .select(`
          *,
          scorecard_metrics!inner (metric_name, metric_type, goal_value, is_inverted, display_order)
        `)
        .in("monthly_summary_id", summaryIds)
        .order("scorecard_metrics(display_order)", { ascending: true })
      allMetricScores = scores || []
    }

    const scoresBySummary = new Map<string, any[]>()
    allMetricScores.forEach((ms: any) => {
      const sid = ms.monthly_summary_id
      if (!scoresBySummary.has(sid)) scoresBySummary.set(sid, [])
      scoresBySummary.get(sid)!.push(ms)
    })

    // Build a map of metric id -> display_order for sorting (from allMetrics)
    const metricDisplayOrder = new Map<string, number>()
    if (allMetrics) {
      allMetrics.forEach((m: any) => metricDisplayOrder.set(m.id, Number(m.display_order ?? 999)))
    }

    // Fetch weekly data for roles that have no monthly summary, or for missing metrics when summary exists
    const metricIds = allMetrics?.map((m: any) => m.id) || []
    let weeklyDataList: any[] = []
    if (metricIds.length > 0) {
      const monthStartWeek = (month - 1) * 4 + 1
      const { data: weeklyData } = await adminClient
        .from("scorecard_weekly_data")
        .select("metric_id, week_number, actual_value")
        .in("metric_id", metricIds)
        .gte("week_number", monthStartWeek)
        .lte("week_number", monthStartWeek + 3)
        .eq("year", year)
      weeklyDataList = weeklyData || []
    }
    const weeklyDataByMetric = new Map<string, Map<number, number>>()
    weeklyDataList.forEach((wd: any) => {
      if (!weeklyDataByMetric.has(wd.metric_id)) weeklyDataByMetric.set(wd.metric_id, new Map())
      weeklyDataByMetric.get(wd.metric_id)!.set(wd.week_number, Number(wd.actual_value ?? 0))
    })

    const roleScorecards: RoleScorecard[] = []
    const roleAverages: number[] = []

    for (const role of roles) {
      const summary = summaryMap.get(role.id)
      const metrics = metricsByRole.get(role.id) || []
      const metricScores: MetricScore[] = []

      if (summary) {
        const scores = scoresBySummary.get(summary.id) || []
        const seenMetricIds = new Set<string>()
        for (const sc of scores) {
          const sm = Array.isArray(sc.scorecard_metrics) ? sc.scorecard_metrics[0] : sc.scorecard_metrics
          const goalVal = Number(sm?.goal_value ?? 0)
          const actualVal = Number(sc.actual_value ?? 0)
          const isInv = !!sm?.is_inverted
          const pct = calculatePercentageOfGoal(actualVal, goalVal, isInv)
          metricScores.push({
            metricId: sc.metric_id,
            metricName: sm?.metric_name ?? "",
            metricType: (sm?.metric_type ?? "count") as MetricScore["metricType"],
            goalValue: goalVal,
            actualValue: actualVal,
            percentageOfGoal: pct,
            grade: calculateGrade(pct),
          })
          seenMetricIds.add(sc.metric_id)
        }
        // Include any role metrics not in the summary (e.g. core behaviors added after summary was saved)
        const monthStartWeekSummary = (month - 1) * 4 + 1
        for (const metric of metrics) {
          if (seenMetricIds.has(metric.id)) continue
          const metricWeeklyData = weeklyDataByMetric.get(metric.id) || new Map()
          const week1 = metricWeeklyData.get(monthStartWeekSummary) ?? 0
          const week2 = metricWeeklyData.get(monthStartWeekSummary + 1) ?? 0
          const week3 = metricWeeklyData.get(monthStartWeekSummary + 2) ?? 0
          const week4 = metricWeeklyData.get(monthStartWeekSummary + 3) ?? 0
          const has1 = metricWeeklyData.has(monthStartWeekSummary)
          const has2 = metricWeeklyData.has(monthStartWeekSummary + 1)
          const has3 = metricWeeklyData.has(monthStartWeekSummary + 2)
          const has4 = metricWeeklyData.has(monthStartWeekSummary + 3)
          let actualValue = 0
          if (has1 && (!has2 || week2 === 0) && (!has3 || week3 === 0) && (!has4 || week4 === 0)) {
            actualValue = week1
          } else if (has1 || has2 || has3 || has4) {
            const total = week1 + week2 + week3 + week4
            actualValue = metric.metric_type === "rating_1_5" || metric.metric_type === "rating_scale" ? total / 4 : total
          }
          const goalVal = Number(metric.goal_value ?? 0)
          const isInv = !!metric.is_inverted
          const pct = calculatePercentageOfGoal(actualValue, goalVal, isInv)
          metricScores.push({
            metricId: metric.id,
            metricName: metric.metric_name ?? "",
            metricType: (metric.metric_type ?? "count") as MetricScore["metricType"],
            goalValue: goalVal,
            actualValue,
            percentageOfGoal: pct,
            grade: calculateGrade(pct),
          })
        }
        metricScores.sort((a, b) => (metricDisplayOrder.get(a.metricId) ?? 999) - (metricDisplayOrder.get(b.metricId) ?? 999))
      } else {
        // No summary: compute from weekly data (same logic as behavior-scorecard getMonthlyScorecard)
        const monthStartWeek = (month - 1) * 4 + 1
        for (const metric of metrics) {
          const metricWeeklyData = weeklyDataByMetric.get(metric.id) || new Map()
          const week1 = metricWeeklyData.get(monthStartWeek) ?? 0
          const week2 = metricWeeklyData.get(monthStartWeek + 1) ?? 0
          const week3 = metricWeeklyData.get(monthStartWeek + 2) ?? 0
          const week4 = metricWeeklyData.get(monthStartWeek + 3) ?? 0
          const has1 = metricWeeklyData.has(monthStartWeek)
          const has2 = metricWeeklyData.has(monthStartWeek + 1)
          const has3 = metricWeeklyData.has(monthStartWeek + 2)
          const has4 = metricWeeklyData.has(monthStartWeek + 3)
          let actualValue = 0
          // Match lib: monthly entry = week1 has data and (weeks 2–4 missing or explicitly 0)
          if (has1 && (!has2 || week2 === 0) && (!has3 || week3 === 0) && (!has4 || week4 === 0)) {
            actualValue = week1
          } else if (has1 || has2 || has3 || has4) {
            const total = week1 + week2 + week3 + week4
            actualValue = metric.metric_type === "rating_1_5" || metric.metric_type === "rating_scale" ? total / 4 : total
          }
          const goalVal = Number(metric.goal_value ?? 0)
          const isInv = !!metric.is_inverted
          const pct = calculatePercentageOfGoal(actualValue, goalVal, isInv)
          metricScores.push({
            metricId: metric.id,
            metricName: metric.metric_name ?? "",
            metricType: (metric.metric_type ?? "count") as MetricScore["metricType"],
            goalValue: goalVal,
            actualValue,
            percentageOfGoal: pct,
            grade: calculateGrade(pct),
          })
        }
      }

      const percentages = metricScores.map((m) => m.percentageOfGoal).filter((p) => isFinite(p) && !isNaN(p))
      const averageGradePercentage = percentages.length > 0 ? percentages.reduce((a, b) => a + b, 0) / percentages.length : 0
      const averageGrade: Grade = calculateGrade(averageGradePercentage)
      if (isFinite(averageGradePercentage) && !isNaN(averageGradePercentage)) roleAverages.push(averageGradePercentage)

      const defaultMetrics = metricScores.filter((m) => isDefaultMetric(m.metricName))
      const userMetrics = metricScores.filter((m) => !isDefaultMetric(m.metricName))
      const defaultPct = defaultMetrics.map((m) => m.percentageOfGoal)
      const userPct = userMetrics.map((m) => m.percentageOfGoal)
      const defaultAverage = defaultPct.length ? defaultPct.reduce((a, b) => a + b, 0) / defaultPct.length : 0
      const userAverage = userPct.length ? userPct.reduce((a, b) => a + b, 0) / userPct.length : 0
      const combinedPct = [...defaultPct, ...userPct]
      const combinedAverage = combinedPct.length ? combinedPct.reduce((a, b) => a + b, 0) / combinedPct.length : 0

      roleScorecards.push({
        roleId: role.id,
        roleName: role.role_name,
        personName: role.person_name ?? null,
        metrics: metricScores,
        averageGradePercentage,
        averageGrade,
        defaultMetrics: defaultMetrics.length ? defaultMetrics : undefined,
        defaultMetricsAverage: defaultMetrics.length ? defaultAverage : undefined,
        defaultMetricsGrade: defaultMetrics.length ? calculateGrade(defaultAverage) : undefined,
        userMetrics: userMetrics.length ? userMetrics : undefined,
        userMetricsAverage: userMetrics.length ? userAverage : undefined,
        userMetricsGrade: userMetrics.length ? calculateGrade(userAverage) : undefined,
        combinedAverage: combinedPct.length ? combinedAverage : undefined,
        combinedGrade: combinedPct.length ? calculateGrade(combinedAverage) : undefined,
      })
    }

    const companyAverage = roleAverages.length ? roleAverages.reduce((a, b) => a + b, 0) / roleAverages.length : 0
    const companyGrade: Grade = calculateGrade(companyAverage)
    const companySummary = { companyAverage, companyGrade, roleScorecards }

    const data: MonthlyScorecardData = {
      month: periodType === "month" ? monthOrQuarter : undefined,
      quarter: periodType === "quarter" ? monthOrQuarter : undefined,
      year,
      periodType,
      roleScorecards,
      companySummary,
    }
    return { success: true, data }
  } catch (error) {
    console.error("Error in getScorecardDataForViewAs:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

export async function createUser(name: string, email: string, password: string, company?: string, role: string = "user") {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase environment variables")
    }

    const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Create user in auth
    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (authError) {
      console.error("Error creating user in auth:", authError)
      return { success: false, error: authError.message }
    }

    // Create profile
    const { error: profileError } = await adminClient
      .from("profiles")
      .insert({
        id: authData.user.id,
        auth_id: authData.user.id,
        full_name: name,
        email: email,
        company: company || null,
        role: role,
      })

    if (profileError) {
      console.error("Error creating profile:", profileError)
      // Try to clean up the auth user if profile creation fails
      await adminClient.auth.admin.deleteUser(authData.user.id)
      return { success: false, error: profileError.message }
    }

    return { success: true, data: { user: authData.user, profile: { id: authData.user.id, full_name: name, email, company, role } } }
  } catch (error) {
    console.error("Error in createUser:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

export async function deleteUser(userId: string) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase environment variables")
    }

    const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Delete user from auth (this will cascade delete the profile due to foreign key constraint)
    const { error: authError } = await adminClient.auth.admin.deleteUser(userId)

    if (authError) {
      console.error("Error deleting user from auth:", authError)
      return { success: false, error: authError.message }
    }

    return { success: true }
  } catch (error) {
    console.error("Error in deleteUser:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

export async function updateUser(userId: string, updates: {
  full_name?: string;
  email?: string;
  company?: string;
  role?: string;
}) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase environment variables")
    }

    const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Update profile
    const { data, error } = await adminClient
      .from("profiles")
      .update(updates)
      .eq("id", userId)
      .select()
      .single()

    if (error) {
      console.error("Error updating profile:", error)
      return { success: false, error: error.message }
    }

    // If email is being updated, also update auth
    if (updates.email) {
      const { error: authError } = await adminClient.auth.admin.updateUserById(userId, {
        email: updates.email
      })

      if (authError) {
        console.error("Error updating auth email:", authError)
        return { success: false, error: authError.message }
      }
    }

    return { success: true, data }
  } catch (error) {
    console.error("Error in updateUser:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

export async function resetUserPassword(userId: string, newPassword: string) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase environment variables")
    }

    const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    const { error } = await adminClient.auth.admin.updateUserById(userId, {
      password: newPassword
    })

    if (error) {
      console.error("Error resetting password:", error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error("Error in resetUserPassword:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

export async function resetPasswordByEmail(email: string, newPassword: string) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase environment variables")
    }

    const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Find user by email
    const { data: users, error: listError } = await adminClient.auth.admin.listUsers()
    
    if (listError) {
      console.error("Error listing users:", listError)
      return { success: false, error: listError.message }
    }

    const user = users.users.find(u => u.email?.toLowerCase() === email.toLowerCase())

    if (!user) {
      // Don't reveal if email exists for security
      return { success: false, error: "If an account exists with this email, the password has been reset." }
    }

    // Reset password directly without sending email
    const { error: updateError } = await adminClient.auth.admin.updateUserById(user.id, {
      password: newPassword
    })

    if (updateError) {
      console.error("Error resetting password:", updateError)
      return { success: false, error: updateError.message }
    }

    return { success: true }
  } catch (error) {
    console.error("Error in resetPasswordByEmail:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}