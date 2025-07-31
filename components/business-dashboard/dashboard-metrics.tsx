"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, Users, Target, Calendar } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { BusinessGoals, CurrentValues, ClientMetrics } from "@/lib/advisor-basecamp"

interface DashboardMetricsProps {
  businessGoals?: BusinessGoals | null
  currentValues?: CurrentValues | null
  clientMetrics?: ClientMetrics | null
}

export function DashboardMetrics({ businessGoals, currentValues, clientMetrics }: DashboardMetricsProps) {
  // Debug logging to track data updates
  console.log('DashboardMetrics received data:', {
    businessGoals,
    currentValues,
    clientMetrics
  })

  // Calculate metrics from real data using correct formulas
  const currentAUM = currentValues?.current_aum || 0
  const currentAnnuity = currentValues?.current_annuity || 0
  const avgAnnuitySize = clientMetrics?.avg_annuity_size || 0
  const avgAUMSize = clientMetrics?.avg_aum_size || 0
  const annuityClosed = clientMetrics?.annuity_closed || 0
  const monthlyIdealProspects = clientMetrics?.monthly_ideal_prospects || 0

  console.log('Calculated metrics:', {
    currentAUM,
    currentAnnuity,
    avgAnnuitySize,
    avgAUMSize,
    annuityClosed,
    monthlyIdealProspects
  })

  // Calculate clients needed using correct formula: (E11 + E10) / 2
  const E11 = avgAUMSize > 0 ? annuityClosed / avgAUMSize : 0 // D5/B11
  const E10 = avgAnnuitySize > 0 ? currentAUM / avgAnnuitySize : 0 // D6/B10
  const calculatedClientsNeeded = Math.ceil((E11 + E10) / 2)
  
  // Use the stored clients_needed value from the database, fallback to calculated value
  const clientsNeeded = clientMetrics?.clients_needed || calculatedClientsNeeded

  // Annual closing prospects: monthly ideal prospects * 12
  const annualClosingProspects = Math.ceil(monthlyIdealProspects * 12)

  // New appointments: total new monthly appointments needed (monthly ideal prospects * 3)
  const newAppointments = Math.ceil(monthlyIdealProspects * 3)
  
  // Total new monthly appointments needed
  const totalNewMonthlyAppointments = Math.ceil(monthlyIdealProspects * 3)

  // Total advisor book: current AUM + current annuity (in millions)
  const totalBooked = (currentAUM + currentAnnuity) / 1000000



  const metrics = [
    {
      title: "Clients Needed",
      value: clientsNeeded.toFixed(2),
      description: "Target clients needed",
      icon: Users,
      color: "red",
      tooltip: "Number of clients needed: (# of AUM accounts + # of annuity closed) / 2",
      shortDescription: "How many clients you need based on your AUM and annuity metrics.",
    },
    {
      title: "Monthly New Appointments Needed",
      value: newAppointments.toFixed(2),
      description: "Monthly target",
      icon: Calendar,
      color: "blue",
      tooltip: "Number of monthly new appointments needed",
      shortDescription: "How many monthly new appointments you need to reach your goal.",
    },
    {
      title: "Annual Ideal Closing Prospects Needed",
      value: annualClosingProspects.toFixed(2),
      description: "Prospects needed",
      icon: Target,
      color: "green",
      tooltip: "Number of prospects needed to close to reach annual goal",
      shortDescription: "How many prospects you need to close to reach your annual goal.",
    },
    {
      title: "Annual Total Prospects Necessary",
      value: (totalNewMonthlyAppointments * 12).toFixed(2),
      description: "Annual prospects needed",
      icon: Target,
      color: "purple",
      tooltip: "Number of annual total prospects necessary to reach annual goal",
      shortDescription: "How many annual total prospects you need to reach your annual goal.",
    },
    {
      title: "Total Advisor Book",
      value: `$${totalBooked.toFixed(1)}M`,
      description: "Current book value",
      icon: DollarSign,
      color: "yellow",
      tooltip: "Total value of all advisor book business",
      shortDescription: "How much your advisor book value is.",
    },
  ]

  const getColorClasses = (color: string) => {
    const colorMap = {
      red: "bg-red-500 text-red-500 bg-red-500/10",
      purple: "bg-purple-500 text-purple-500 bg-purple-500/10",
      blue: "bg-blue-500 text-blue-500 bg-blue-500/10",
      yellow: "bg-yellow-500 text-yellow-500 bg-yellow-500/10",
      green: "bg-green-500 text-green-500 bg-green-500/10",
    }
    return colorMap[color as keyof typeof colorMap] || "bg-gray-500 text-gray-500 bg-gray-500/10"
  }

  const getTextColor = (color: string) => {
    const colorMap = {
      red: "text-red-500",
      purple: "text-purple-500",
      blue: "text-blue-500",
      yellow: "text-yellow-500",
      green: "text-green-500",
    }
    return colorMap[color as keyof typeof colorMap] || "text-gray-500"
  }

  return (
    <TooltipProvider>
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {metrics.map((metric, index) => (
          <Card key={index} className="border-none shadow-lg overflow-hidden">
            <div className={cn("h-1 w-full", getColorClasses(metric.color).split(" ")[0])}></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {metric.title}
                <CardDescription className="text-muted-foreground text-xs mt-1">{metric.shortDescription}</CardDescription>
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
            </CardContent>
          </Card>
        ))}
      </div>
    </TooltipProvider>
  )
}
