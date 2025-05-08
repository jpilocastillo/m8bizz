import { ArrowDown, ArrowUp } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface MetricCardProps {
  title: string
  value: number
  format: "percent" | "currency" | "number"
  trend: "up" | "down" | "neutral"
  trendValue: number
}

export function DashboardMetricCard({ title, value, format, trend, trendValue }: MetricCardProps) {
  const formatValue = () => {
    if (format === "percent") {
      return `${value.toFixed(1)}%`
    } else if (format === "currency") {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      }).format(value)
    } else {
      return value.toString()
    }
  }

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardContent className="p-6">
        <div className="flex flex-col gap-4">
          <p className="text-sm font-medium text-gray-400">{title}</p>
          <div className="flex items-baseline justify-between">
            <h3 className="text-2xl font-bold text-white">{formatValue()}</h3>
            <div
              className={`flex items-center text-sm ${
                trend === "up" ? "text-green-500" : trend === "down" ? "text-red-500" : "text-gray-400"
              }`}
            >
              {trend === "up" ? (
                <ArrowUp className="mr-1 h-4 w-4" />
              ) : trend === "down" ? (
                <ArrowDown className="mr-1 h-4 w-4" />
              ) : null}
              <span>{trendValue}%</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
