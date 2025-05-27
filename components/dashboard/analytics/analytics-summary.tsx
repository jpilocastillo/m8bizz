"use client"

import { Card, CardContent } from "@/components/ui/card"
import { BarChart3, DollarSign, LineChart, Percent, TrendingUp, Users } from "lucide-react"

interface AnalyticsSummaryData {
  totalEvents: number
  totalAttendees: number
  totalRevenue: number
  totalProfit: number
  totalExpenses: number
  overallROI: number
  overallConversionRate: number
  totalClients: number
  avgAttendees: number
}

interface AnalyticsSummaryProps {
  data: AnalyticsSummaryData
}

export function AnalyticsSummary({ data }: AnalyticsSummaryProps) {
  console.log('AnalyticsSummary data:', data)

  // Ensure data exists with default values
  const safeData: AnalyticsSummaryData = {
    totalEvents: data?.totalEvents || 0,
    totalAttendees: data?.totalAttendees || 0,
    totalRevenue: data?.totalRevenue || 0,
    totalProfit: data?.totalProfit || 0,
    totalExpenses: data?.totalExpenses || 0,
    overallROI: data?.overallROI || 0,
    overallConversionRate: data?.overallConversionRate || 0,
    totalClients: data?.totalClients || 0,
    avgAttendees: data?.avgAttendees || 0,
  }

  // Use backend-calculated values directly where available
  // Format currency
  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`
    } else {
      return `$${value.toFixed(0)}`
    }
  }

  // Format percentage
  const formatPercent = (value: number) => {
    return `${value.toLocaleString(undefined, { maximumFractionDigits: 1 })}%`
  }

  // Use backend values directly if available
  const avgRevenuePerEvent = safeData.totalEvents > 0 ? safeData.totalRevenue / safeData.totalEvents : 0
  // Use backend values directly for rates if not provided, otherwise use backend
  const attendanceRate = safeData.totalAttendees > 0 ? (safeData.totalAttendees / safeData.totalEvents) * 100 : 0
  // Use backend-provided overallConversionRate and overallROI directly
  const conversionRate = safeData.overallConversionRate
  // Display full calculated ROI, formatted with at most one decimal place
  const overallROI = safeData.overallROI

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      <Card className="bg-gradient-to-br from-m8bs-card to-m8bs-card-alt border-m8bs-border text-white shadow-md card-hover">
        <CardContent className="p-4 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-white font-bold tracking-wide">Total Events</span>
            <div className="bg-m8bs-blue/20 p-1 rounded-md">
              <BarChart3 className="h-4 w-4 text-m8bs-blue" />
            </div>
          </div>
          <div className="text-2xl font-extrabold tracking-tight">{safeData.totalEvents}</div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-m8bs-card to-m8bs-card-alt border-m8bs-border text-white shadow-md card-hover">
        <CardContent className="p-4 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-white font-bold tracking-wide">Total Revenue</span>
            <div className="bg-emerald-500/20 p-1 rounded-md">
              <DollarSign className="h-4 w-4 text-emerald-500" />
            </div>
          </div>
          <div className="text-2xl font-extrabold tracking-tight">{formatCurrency(safeData.totalRevenue)}</div>
          <div className="text-xs text-white mt-1 font-medium">
            Avg: {formatCurrency(avgRevenuePerEvent)} per event
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-m8bs-card to-m8bs-card-alt border-m8bs-border text-white shadow-md card-hover">
        <CardContent className="p-4 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-white font-bold tracking-wide">Total Profit</span>
            <div className="bg-purple-500/20 p-1 rounded-md">
              <TrendingUp className="h-4 w-4 text-purple-500" />
            </div>
          </div>
          <div className="text-2xl font-extrabold tracking-tight">{formatCurrency(safeData.totalProfit)}</div>
          <div className="text-xs text-white mt-1 font-medium">
            Expenses: {formatCurrency(safeData.totalExpenses)}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-m8bs-card to-m8bs-card-alt border-m8bs-border text-white shadow-md card-hover">
        <CardContent className="p-4 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-white font-bold tracking-wide">Overall ROI</span>
            <div className="bg-yellow-500/20 p-1 rounded-md">
              <Percent className="h-4 w-4 text-yellow-500" />
            </div>
          </div>
          <div className="text-2xl font-extrabold tracking-tight">{formatPercent(overallROI)}</div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-m8bs-card to-m8bs-card-alt border-m8bs-border text-white shadow-md card-hover">
        <CardContent className="p-4 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-white font-bold tracking-wide">Total Attendees</span>
            <div className="bg-amber-500/20 p-1 rounded-md">
              <Users className="h-4 w-4 text-amber-500" />
            </div>
          </div>
          <div className="text-2xl font-extrabold tracking-tight">{safeData.totalAttendees}</div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-m8bs-card to-m8bs-card-alt border-m8bs-border text-white shadow-md card-hover">
        <CardContent className="p-4 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-white font-bold tracking-wide">Total Clients</span>
            <div className="bg-purple-500/20 p-1 rounded-md">
              <Users className="h-4 w-4 text-purple-500" />
            </div>
          </div>
          <div className="text-2xl font-extrabold tracking-tight">{safeData.totalClients}</div>
          <div className="text-xs text-white mt-1 font-medium">
            Conversion Rate: {formatPercent(conversionRate)}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
