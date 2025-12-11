"use client"

import { memo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { BarChart3, DollarSign, LineChart, Percent, TrendingUp, Users, Target, Activity } from "lucide-react"
import { motion } from "framer-motion"

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
  totalPlateLickers?: number
  totalAppointmentsSet?: number
  totalAppointmentsMade?: number
  totalRegistrants?: number
}

interface AnalyticsSummaryProps {
  data: AnalyticsSummaryData
}

export const AnalyticsSummary = memo(function AnalyticsSummary({ data }: AnalyticsSummaryProps) {
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
    totalPlateLickers: data?.totalPlateLickers || 0,
    totalAppointmentsSet: data?.totalAppointmentsSet || 0,
    totalAppointmentsMade: data?.totalAppointmentsMade || 0,
    totalRegistrants: data?.totalRegistrants || 0,
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

  const summaryCards = [
    {
      title: "Total Events",
      value: safeData.totalEvents,
      icon: BarChart3,
      color: "blue",
      bgColor: "bg-m8bs-card-alt",
      iconColor: "text-m8bs-blue",
      subtitle: "Marketing Campaigns"
    },
    {
      title: "Total Attendees",
      value: safeData.totalAttendees,
      icon: Users,
      color: "cyan",
      bgColor: "bg-cyan-500/20",
      iconColor: "text-cyan-500",
      subtitle: `Avg: ${Math.round(safeData.avgAttendees)} Per Event`
    },
    {
      title: "Total Clients",
      value: safeData.totalClients,
      icon: Target,
      color: "amber",
      bgColor: "bg-amber-500/20",
      iconColor: "text-amber-500",
      subtitle: `Conversion: ${formatPercent(conversionRate)}`
    },
    {
      title: "Total Expenses",
      value: formatCurrency(safeData.totalExpenses),
      icon: LineChart,
      color: "red",
      bgColor: "bg-red-500/20",
      iconColor: "text-red-500",
      subtitle: "Marketing Costs"
    },
    {
      title: "Total Revenue",
      value: formatCurrency(safeData.totalRevenue),
      icon: DollarSign,
      color: "emerald",
      bgColor: "bg-emerald-500/20",
      iconColor: "text-emerald-500",
      subtitle: `Avg: ${formatCurrency(avgRevenuePerEvent)} Per Event`
    },
    {
      title: "Total Profit",
      value: formatCurrency(safeData.totalProfit),
      icon: TrendingUp,
      color: "purple",
      bgColor: "bg-purple-500/20",
      iconColor: "text-purple-500",
      subtitle: `Revenue - Expenses`
    },
    {
      title: "Total ROI",
      value: formatPercent(overallROI),
      icon: Activity,
      color: "green",
      bgColor: "bg-green-500/20",
      iconColor: "text-green-500",
      subtitle: "Return On Investment"
    }
  ]

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  return (
    <motion.div 
      className="w-full"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
        {summaryCards.map((card, index) => (
          <motion.div
            key={card.title}
            variants={item}
            whileHover={{ scale: 1.05, y: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Card 
              className="bg-m8bs-card text-white shadow-sm h-full"
              role="article"
              aria-label={`${card.title}: ${card.value}`}
            >
              <CardContent className="p-3 flex flex-col h-full">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-white/80 font-medium tracking-wide">{card.title}</span>
                  <div className={`${card.bgColor} p-2 rounded-lg`} aria-hidden="true">
                    <card.icon className={`h-4 w-4 ${card.iconColor}`} />
                  </div>
                </div>
                <div className="text-xl font-extrabold tracking-tight text-white mb-1" aria-label={`Value: ${card.value}`}>
                  {card.value}
                </div>
                <div className="text-xs text-white/60 mt-auto font-medium" aria-label={`Additional info: ${card.subtitle}`}>
                  {card.subtitle}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
})
