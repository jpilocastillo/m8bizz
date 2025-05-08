import type React from "react"
import { ArrowDown, ArrowUp, Minus } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface TrendMetricCardProps {
  title: string
  value: number | string
  formattedValue?: string
  format?: "percent" | "currency" | "number"
  trend?: "up" | "down" | "neutral"
  trendValue?: number
  trendLabel?: string
  icon?: React.ReactNode
  className?: string
}

export function TrendMetricCard({
  title,
  value,
  formattedValue,
  format = "number",
  trend = "neutral",
  trendValue = 0,
  trendLabel,
  icon,
  className,
}: TrendMetricCardProps) {
  const formatValue = () => {
    if (formattedValue) return formattedValue

    if (typeof value === "string") return value

    if (format === "percent") {
      return `${value.toFixed(1)}%`
    } else if (format === "currency") {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      }).format(value)
    } else {
      return value.toLocaleString()
    }
  }

  return (
    <Card
      className={cn(
        "bg-gradient-to-b from-[#131525] to-[#0f1029] border-[#1f2037] overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300",
        trend === "up"
          ? "hover:border-green-500/30"
          : trend === "down"
            ? "hover:border-red-500/30"
            : "hover:border-blue-500/30",
        className,
      )}
    >
      <CardContent className="p-6 relative">
        {/* Subtle accent line at top */}
        <div
          className={cn(
            "absolute top-0 left-0 h-1 w-full",
            trend === "up" ? "bg-green-500" : trend === "down" ? "bg-red-500" : "bg-blue-500",
          )}
        />

        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-400">{title}</p>
            {icon && (
              <div
                className={cn(
                  "text-gray-400 p-2 rounded-full",
                  trend === "up" ? "bg-green-500/10" : trend === "down" ? "bg-red-500/10" : "bg-blue-500/10",
                )}
              >
                {icon}
              </div>
            )}
          </div>
          <div className="flex items-baseline justify-between">
            <h3 className="text-2xl font-bold text-white">{formatValue()}</h3>
            <div
              className={cn(
                "flex items-center text-sm",
                trend === "up" ? "text-green-500" : trend === "down" ? "text-red-500" : "text-gray-400",
              )}
            >
              {trend === "up" ? (
                <ArrowUp className="mr-1 h-4 w-4" />
              ) : trend === "down" ? (
                <ArrowDown className="mr-1 h-4 w-4" />
              ) : (
                <Minus className="mr-1 h-4 w-4" />
              )}
              <span>{trendValue !== undefined ? `${Math.abs(trendValue)}%` : ""}</span>
              {trendLabel && <span className="ml-1 text-xs text-gray-500">{trendLabel}</span>}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
