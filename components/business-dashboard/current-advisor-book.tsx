"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Briefcase, DollarSign } from "lucide-react"
import { CurrentValues } from "@/lib/advisor-basecamp"

interface CurrentAdvisorBookProps {
  currentValues?: CurrentValues | null
}

export function CurrentAdvisorBook({ currentValues }: CurrentAdvisorBookProps) {
  if (!currentValues) {
    return (
      <Card className="bg-m8bs-card border-m8bs-border rounded-lg overflow-hidden shadow-md transition-all duration-300 hover:shadow-lg">
        <CardHeader className="bg-m8bs-card border-b border-m8bs-border px-6 py-4">
          <CardTitle className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-m8bs-muted" />
            Current Advisor Book
          </CardTitle>
          <CardDescription className="text-m8bs-muted mt-2">
            Your Current Book Of Business
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-m8bs-muted">
            <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No Book Data Available</p>
            <p className="text-sm mt-2">Set Up Your Current Values In The Advisor Basecamp</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const currentAUM = currentValues.current_aum || 0
  const currentAnnuity = currentValues.current_annuity || 0
  const currentLifeProduction = currentValues.current_life_production || 0
  const totalBookValue = currentAUM + currentAnnuity + currentLifeProduction

  const bookData = [
    {
      name: "Annuity Book",
      value: currentAnnuity,
      percentage: totalBookValue > 0 ? (currentAnnuity / totalBookValue) * 100 : 0,
      color: "#3b82f6",
      icon: DollarSign,
    },
    {
      name: "AUM Book",
      value: currentAUM,
      percentage: totalBookValue > 0 ? (currentAUM / totalBookValue) * 100 : 0,
      color: "#10b981",
      icon: DollarSign,
    },
    {
      name: "Life Production",
      value: currentLifeProduction,
      percentage: totalBookValue > 0 ? (currentLifeProduction / totalBookValue) * 100 : 0,
      color: "#a855f7",
      icon: DollarSign,
    },
  ]

  return (
    <div className="grid gap-6">
      <Card className="bg-m8bs-card border-m8bs-border rounded-lg overflow-hidden shadow-md transition-all duration-300 hover:shadow-lg">
        <CardHeader className="bg-m8bs-card border-b border-m8bs-border px-6 py-4">
          <CardTitle className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-m8bs-muted" />
            Current Advisor Book
          </CardTitle>
          <CardDescription className="text-m8bs-muted mt-2">
            Your Current Book Of Business
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Total Book Value */}
          <div className="bg-black/30 border border-m8bs-border/40 rounded-lg p-6">
            <div className="text-center mb-4">
              <div className="text-sm font-semibold text-white/70 tracking-wide uppercase mb-2">Total Book Value</div>
              <div className="text-4xl font-extrabold text-white tabular-nums leading-none">
                ${totalBookValue.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Book Breakdown */}
          <div className="space-y-4">
            {bookData.map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm font-medium text-white">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-white">${item.value.toLocaleString()}</div>
                    <div className="text-xs text-m8bs-muted">{item.percentage.toFixed(1)}%</div>
                  </div>
                </div>
                <Progress 
                  value={item.percentage} 
                  className="h-2"
                  style={{
                    // @ts-ignore - custom CSS variable for progress color
                    '--progress-background': item.color,
                  }}
                />
              </div>
            ))}
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-m8bs-border">
            {bookData.map((item, index) => (
              <div 
                key={index}
                className="bg-black/30 border border-m8bs-border/40 rounded-lg p-4 text-center"
              >
                <div className="text-xs font-semibold text-white/70 tracking-wide uppercase mb-2">
                  {item.name}
                </div>
                <div className="text-2xl font-extrabold text-white tabular-nums">
                  ${item.value.toLocaleString()}
                </div>
                <div className="text-xs text-m8bs-muted mt-1">
                  {item.percentage.toFixed(1)}% of total
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}





