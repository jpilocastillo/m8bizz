import type React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface ComparisonMetricProps {
  title: string
  value: number | string
  previousValue?: number | string
  format?: "percent" | "currency" | "number"
  change?: number
  changeLabel?: string
  className?: string
  icon?: React.ReactNode
}

export function ComparisonMetric({
  title,
  value,
  previousValue,
  format = "number",
  change,
  changeLabel,
  className,
  icon,
}: ComparisonMetricProps) {
  const formatValue = (val: number | string) => {
    if (typeof val === "string") return val

    if (format === "percent") {
      return `${val.toFixed(1)}%`
    } else if (format === "currency") {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      }).format(val)
    } else {
      return val.toLocaleString()
    }
  }

  const isPositive = change !== undefined ? change > 0 : false
  const isNegative = change !== undefined ? change < 0 : false

  return (
    <Card
      className={cn(
        "bg-gradient-to-b from-[#131525] to-[#0f1029] border-[#1f2037] overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300",
        isPositive ? "hover:border-green-500/30" : isNegative ? "hover:border-red-500/30" : "hover:border-blue-500/30",
        className,
      )}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-gray-400">{title}</p>
          {icon && (
            <div
              className={cn(
                "text-gray-400 p-2 rounded-full",
                isPositive ? "bg-green-500/10" : isNegative ? "bg-red-500/10" : "bg-blue-500/10",
              )}
            >
              {icon}
            </div>
          )}
        </div>
        <div className="flex flex-col">
          <h3 className="text-2xl font-bold text-white">{formatValue(value)}</h3>
          {previousValue !== undefined && (
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-gray-400">Previous: {formatValue(previousValue)}</span>
            </div>
          )}
          {change !== undefined && (
            <div
              className={cn(
                "text-xs mt-2",
                isPositive ? "text-green-500" : isNegative ? "text-red-500" : "text-gray-400",
              )}
            >
              {isPositive ? "↑" : isNegative ? "↓" : "–"} {Math.abs(change).toFixed(1)}%
              {changeLabel && <span className="ml-1 text-gray-400">{changeLabel}</span>}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
