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
        "bg-m8bs-card overflow-hidden shadow-sm",
        className,
      )}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-m8bs-muted">{title}</p>
          {icon && (
            <div
              className={cn(
                "text-m8bs-cyan p-2 rounded-full",
                isPositive ? "bg-m8bs-green/20" : isNegative ? "bg-red-500/20" : "bg-m8bs-card-alt",
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
                isPositive ? "text-m8bs-green" : isNegative ? "text-red-400" : "text-m8bs-cyan",
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
