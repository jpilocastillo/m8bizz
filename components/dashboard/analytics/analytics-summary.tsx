"use client"

import { Card, CardContent } from "@/components/ui/card"
import { BarChart3, DollarSign, LineChart, Percent, TrendingUp, Users } from "lucide-react"

interface AnalyticsSummaryProps {
  data: any
}

export function AnalyticsSummary({ data }: AnalyticsSummaryProps) {
  // Ensure data exists with default values
  const safeData = data || {
    totalEvents: 0,
    totalAttendees: 0,
    totalRevenue: 0,
    totalProfit: 0,
    totalExpenses: 0,
    overallROI: 0,
    overallConversionRate: 0,
    totalClients: 0,
    avgAttendees: 0,
  }

  // Format currency
  const formatCurrency = (value = 0) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`
    } else {
      return `$${value.toFixed(0)}`
    }
  }

  // Format percentage
  const formatPercent = (value = 0) => {
    return `${value.toFixed(1)}%`
  }

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
          <div className="text-2xl font-extrabold tracking-tight">{safeData.totalEvents || 0}</div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-m8bs-card to-m8bs-card-alt border-m8bs-border text-white shadow-md card-hover">
        <CardContent className="p-4 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-white font-bold tracking-wide">Total Attendees</span>
            <div className="bg-green-500/20 p-1 rounded-md">
              <Users className="h-4 w-4 text-green-500" />
            </div>
          </div>
          <div className="text-2xl font-extrabold tracking-tight">{safeData.totalAttendees || 0}</div>
          <div className="text-xs text-white mt-1 font-medium">
            Avg: {Math.round(safeData.avgAttendees || 0)} per event
          </div>
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
          <div className="text-2xl font-extrabold tracking-tight">{formatCurrency(safeData.totalRevenue || 0)}</div>
          <div className="text-xs text-white mt-1 font-medium">
            Avg: {formatCurrency((safeData.totalRevenue || 0) / (safeData.totalEvents || 1))} per event
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
          <div className="text-2xl font-extrabold tracking-tight">{formatCurrency(safeData.totalProfit || 0)}</div>
          <div className="text-xs text-white mt-1 font-medium">
            Expenses: {formatCurrency(safeData.totalExpenses || 0)}
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
          <div className="text-2xl font-extrabold tracking-tight">{formatPercent(safeData.overallROI || 0)}</div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-m8bs-card to-m8bs-card-alt border-m8bs-border text-white shadow-md card-hover">
        <CardContent className="p-4 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-white font-bold tracking-wide">Conversion Rate</span>
            <div className="bg-red-500/20 p-1 rounded-md">
              <LineChart className="h-4 w-4 text-red-500" />
            </div>
          </div>
          <div className="text-2xl font-extrabold tracking-tight">
            {formatPercent(safeData.overallConversionRate || 0)}
          </div>
          <div className="text-xs text-white mt-1 font-medium">
            {safeData.totalClients || 0} clients from {safeData.totalAttendees || 0} attendees
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
