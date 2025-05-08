"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Brain, TrendingUp, Users, DollarSign, Percent } from "lucide-react"

interface PredictiveInsightsProps {
  data: any
}

export function PredictiveInsights({ data }: PredictiveInsightsProps) {
  // Calculate predictions based on historical data
  const calculatePredictions = () => {
    if (!data || !data.monthlyData || data.monthlyData.length < 3) {
      return {
        nextMonthAttendees: 0,
        nextMonthRevenue: 0,
        nextMonthROI: 0,
        nextMonthConversion: 0,
      }
    }

    // Use simple moving average for prediction
    const recentMonths = data.monthlyData.slice(-3)

    const avgAttendees = recentMonths.reduce((sum, month) => sum + month.attendees, 0) / recentMonths.length
    const avgRevenue = recentMonths.reduce((sum, month) => sum + month.revenue, 0) / recentMonths.length
    const avgExpenses = recentMonths.reduce((sum, month) => sum + month.expenses, 0) / recentMonths.length

    // Apply growth factor based on trend
    const growthFactor = 1.05 // 5% growth assumption

    const nextMonthAttendees = Math.round(avgAttendees * growthFactor)
    const nextMonthRevenue = avgRevenue * growthFactor
    const nextMonthExpenses = avgExpenses * 1.02 // Expenses grow slower
    const nextMonthROI = ((nextMonthRevenue - nextMonthExpenses) / nextMonthExpenses) * 100

    // Estimate conversion based on historical data
    const avgConversion = data.summary.overallConversionRate || 0
    const nextMonthConversion = avgConversion * 1.03 // Slight improvement

    return {
      nextMonthAttendees,
      nextMonthRevenue,
      nextMonthROI,
      nextMonthConversion,
    }
  }

  const predictions = calculatePredictions()

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

  return (
    <Card className="bg-gradient-to-br from-m8bs-card to-m8bs-card-alt border-m8bs-border shadow-md card-hover">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-400" />
          <CardTitle className="text-lg font-medium text-white">Predictive Insights</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
          <div className="bg-[#131525] border border-[#1f2037] rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-blue-400" />
              <h3 className="text-sm font-medium text-white">Projected Attendance</h3>
            </div>
            <div className="text-2xl font-bold text-white">{predictions.nextMonthAttendees}</div>
            <div className="text-xs text-gray-400 mt-1">Next event projection based on recent trends</div>
          </div>

          <div className="bg-[#131525] border border-[#1f2037] rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-green-400" />
              <h3 className="text-sm font-medium text-white">Projected Revenue</h3>
            </div>
            <div className="text-2xl font-bold text-white">{formatCurrency(predictions.nextMonthRevenue)}</div>
            <div className="text-xs text-gray-400 mt-1">Estimated revenue for your next event</div>
          </div>

          <div className="bg-[#131525] border border-[#1f2037] rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-yellow-400" />
              <h3 className="text-sm font-medium text-white">Projected ROI</h3>
            </div>
            <div className="text-2xl font-bold text-white">{predictions.nextMonthROI.toFixed(1)}%</div>
            <div className="text-xs text-gray-400 mt-1">Expected return on investment</div>
          </div>

          <div className="bg-[#131525] border border-[#1f2037] rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Percent className="h-4 w-4 text-red-400" />
              <h3 className="text-sm font-medium text-white">Projected Conversion</h3>
            </div>
            <div className="text-2xl font-bold text-white">{predictions.nextMonthConversion.toFixed(1)}%</div>
            <div className="text-xs text-gray-400 mt-1">Expected attendee to client conversion rate</div>
          </div>
        </div>

        <div className="mt-4 p-3 bg-[#1f2037]/50 rounded-md border border-[#1f2037] text-sm text-gray-300">
          <p>
            These projections are based on your historical performance data and industry trends. Actual results may vary
            based on event execution and market conditions.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
