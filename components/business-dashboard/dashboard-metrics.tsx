"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, TrendingDown, TrendingUp, Users, Target, Calendar } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { Progress } from "@/components/ui/progress"
import { BusinessGoals, CurrentValues, ClientMetrics } from "@/lib/advisor-basecamp"

interface DashboardMetricsProps {
  businessGoals?: BusinessGoals | null
  currentValues?: CurrentValues | null
  clientMetrics?: ClientMetrics | null
}

export function DashboardMetrics({ businessGoals, currentValues, clientMetrics }: DashboardMetricsProps) {
  // Calculate metrics from real data
  const clientsNeeded = clientMetrics?.monthly_ideal_prospects ? Math.ceil(clientMetrics.monthly_ideal_prospects * 12) : 0
  const annualClosingProspects = clientMetrics?.monthly_ideal_prospects ? Math.ceil(clientMetrics.monthly_ideal_prospects * 12) : 0
  const newAppointments = clientMetrics?.appointments_per_campaign || 0
  const totalBooked = currentValues ? (currentValues.current_aum + currentValues.current_annuity) / 1000000 : 0

  // Calculate progress percentages
  const clientsProgress = businessGoals?.business_goal ? Math.min((clientsNeeded / 50) * 100, 100) : 0
  const prospectsProgress = businessGoals?.business_goal ? Math.min((annualClosingProspects / 60) * 100, 100) : 0
  const appointmentsProgress = newAppointments > 0 ? Math.min((newAppointments / 15) * 100, 100) : 0
  const bookedProgress = businessGoals?.business_goal ? Math.min((totalBooked / (businessGoals.business_goal / 1000000)) * 100, 100) : 0

  const metrics = [
    {
      title: "Clients Needed",
      value: clientsNeeded.toString(),
      description: "Target for this year",
      icon: Users,
      trend: -5,
      trendLabel: "from last month",
      color: "red",
      tooltip: "Number of new clients needed to reach annual goal",
      progress: Math.round(clientsProgress),
    },
    {
      title: "Annual Closing Prospects",
      value: annualClosingProspects.toString(),
      description: "Prospects needed",
      icon: Target,
      trend: 12,
      trendLabel: "from last year",
      color: "purple",
      tooltip: "Number of prospects needed to close to reach annual goal",
      progress: Math.round(prospectsProgress),
    },
    {
      title: "New Appointments",
      value: newAppointments.toString(),
      description: "Monthly target",
      icon: Calendar,
      trend: 3,
      trendLabel: "from last month",
      color: "blue",
      tooltip: "Number of new appointments needed monthly",
      progress: Math.round(appointmentsProgress),
    },
    {
      title: "Total Booked",
      value: `$${totalBooked.toFixed(1)}M`,
      description: "Current book value",
      icon: DollarSign,
      trend: 18.5,
      trendLabel: "from last year",
      color: "yellow",
      tooltip: "Total value of all booked business",
      progress: Math.round(bookedProgress),
    },
  ]

  const getColorClasses = (color: string) => {
    const colorMap = {
      red: "bg-red-500 text-red-500 bg-red-500/10",
      purple: "bg-purple-500 text-purple-500 bg-purple-500/10",
      blue: "bg-blue-500 text-blue-500 bg-blue-500/10",
      yellow: "bg-yellow-500 text-yellow-500 bg-yellow-500/10",
    }
    return colorMap[color as keyof typeof colorMap] || "bg-gray-500 text-gray-500 bg-gray-500/10"
  }

  const getTextColor = (color: string) => {
    const colorMap = {
      red: "text-red-500",
      purple: "text-purple-500",
      blue: "text-blue-500",
      yellow: "text-yellow-500",
    }
    return colorMap[color as keyof typeof colorMap] || "text-gray-500"
  }

  return (
    <TooltipProvider>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric, index) => (
          <Card key={index} className="border-none shadow-lg overflow-hidden">
            <div className={cn("h-1 w-full", getColorClasses(metric.color).split(" ")[0])}></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {metric.title}
                <CardDescription>{metric.description}</CardDescription>
              </CardTitle>
              <Tooltip>
                <TooltipTrigger>
                  <div className={cn("rounded-full p-2", getColorClasses(metric.color).split(" ")[2])}>
                    <metric.icon className={cn("h-4 w-4", getTextColor(metric.color))} />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{metric.tooltip}</p>
                </TooltipContent>
              </Tooltip>
            </CardHeader>
            <CardContent>
              <div className={cn("text-3xl font-bold", getTextColor(metric.color))}>
                {metric.value}
              </div>
              <div className="flex items-center text-xs text-muted-foreground mt-1">
                {metric.trend > 0 ? (
                  <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                ) : (
                  <TrendingDown className="mr-1 h-3 w-3 text-red-500" />
                )}
                <span className={cn(metric.trend > 0 ? "text-green-500" : "text-red-500")}>
                  {Math.abs(metric.trend)}%
                </span>
                <span className="ml-1">{metric.trendLabel}</span>
              </div>
              <div className="mt-3">
                <div className="flex justify-between text-xs mb-1">
                  <span>Progress</span>
                  <span>{metric.progress}%</span>
                </div>
                <Progress value={metric.progress} className="h-1.5" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </TooltipProvider>
  )
}
