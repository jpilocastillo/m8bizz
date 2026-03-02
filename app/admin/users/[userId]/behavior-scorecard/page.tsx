"use client"

import { useState, useEffect } from "react"
import { useViewAsUserOrThrow } from "@/components/admin/view-as-user-context"
import { getScorecardDataForViewAs } from "@/app/admin/actions"
import { ScorecardDisplay } from "@/components/behavior-scorecard/scorecard-display"
import { CompanySummary } from "@/components/behavior-scorecard/company-summary"
import { ScorecardSkeleton, CompanySummarySkeleton } from "@/components/behavior-scorecard/scorecard-skeleton"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const MONTHS = [
  { value: 1, label: "January" }, { value: 2, label: "February" }, { value: 3, label: "March" },
  { value: 4, label: "April" }, { value: 5, label: "May" }, { value: 6, label: "June" },
  { value: 7, label: "July" }, { value: 8, label: "August" }, { value: 9, label: "September" },
  { value: 10, label: "October" }, { value: 11, label: "November" }, { value: 12, label: "December" },
]

export default function AdminViewAsBehaviorScorecardPage() {
  const { viewAsUserId, profile } = useViewAsUserOrThrow()
  const now = new Date()
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(now.getFullYear())
  const [scorecardData, setScorecardData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        setLoading(true)
        setError(null)
        const result = await getScorecardDataForViewAs(viewAsUserId, "month", selectedMonth, selectedYear)
        if (cancelled) return
        if (!result.success) {
          setError(result.error || "Failed to load scorecard")
          setScorecardData(null)
          return
        }
        setScorecardData(result.data)
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load scorecard")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [viewAsUserId, selectedMonth, selectedYear])

  const displayName = profile?.full_name || profile?.email || "User"
  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i)

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Behavior Scorecard</h1>
          <p className="text-m8bs-muted">View only — {displayName}</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedMonth.toString()} onValueChange={(v) => setSelectedMonth(Number(v))}>
            <SelectTrigger className="w-[140px] bg-m8bs-card border-m8bs-border text-white">
              <SelectValue placeholder="Month" />
            </SelectTrigger>
            <SelectContent className="bg-m8bs-card border-m8bs-border">
              {MONTHS.map((m) => (
                <SelectItem key={m.value} value={m.value.toString()} className="text-white focus:bg-m8bs-card-alt">
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(Number(v))}>
            <SelectTrigger className="w-[100px] bg-m8bs-card border-m8bs-border text-white">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent className="bg-m8bs-card border-m8bs-border">
              {years.map((y) => (
                <SelectItem key={y} value={y.toString()} className="text-white focus:bg-m8bs-card-alt">
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {error && (
        <Card className="bg-red-950/30 border-red-500/50">
          <CardContent className="p-4 text-red-400">{error}</CardContent>
        </Card>
      )}

      {loading ? (
        <>
          <CompanySummarySkeleton />
          <ScorecardSkeleton />
        </>
      ) : scorecardData?.companySummary ? (
        <>
          <CompanySummary companySummary={scorecardData.companySummary} />
          {scorecardData.roleScorecards.length > 0 ? (
            <Card className="bg-m8bs-card border-m8bs-card-alt shadow-xl">
              <CardContent className="p-0">
                <Tabs defaultValue={scorecardData.roleScorecards[0]?.roleId ?? ""} className="w-full">
                  <TabsList className="w-full justify-start rounded-none border-b border-m8bs-border bg-m8bs-card p-0 flex flex-wrap">
                    {scorecardData.roleScorecards.map((role: any) => (
                      <TabsTrigger
                        key={role.roleId}
                        value={role.roleId}
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-m8bs-blue data-[state=active]:bg-transparent"
                      >
                        {role.personName || role.roleName}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  {scorecardData.roleScorecards.map((roleScorecard: any) => (
                    <TabsContent key={roleScorecard.roleId} value={roleScorecard.roleId} className="p-4">
                      <ScorecardDisplay roleScorecard={roleScorecard} />
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>
          ) : (
            <p className="text-m8bs-muted">No roles or scorecard data for this period.</p>
          )}
        </>
      ) : !error && scorecardData ? (
        <p className="text-m8bs-muted">No scorecard data for this period.</p>
      ) : null}
    </div>
  )
}
