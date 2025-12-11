import type React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { CircularProgressIndicator } from "@/components/ui/circular-progress"
import { cn } from "@/lib/utils"

interface ProgressCardProps {
  title: string
  value: number
  maxValue?: number
  size?: number
  strokeWidth?: number
  className?: string
  valueLabel?: string
  subtitle?: string
  color?: string
  icon?: React.ReactNode
}

export function ProgressCard({
  title,
  value,
  maxValue = 100,
  size = 120,
  strokeWidth = 12,
  className,
  valueLabel,
  subtitle,
  color = "text-gray-500",
  icon,
}: ProgressCardProps) {
  // Calculate percentage
  const percentage = Math.min(100, Math.max(0, (value / maxValue) * 100))

  return (
    <Card
      className={cn(
        "bg-m8bs-card overflow-hidden shadow-sm",
        className,
      )}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white">{title}</h3>
          {icon && (
            <div
              className={cn(
                "text-m8bs-cyan p-2 rounded-full",
                color === "text-gray-500"
                  ? "bg-gray-500/10"
                  : color === "text-green-500"
                    ? "bg-green-500/10"
                    : color === "text-red-500"
                      ? "bg-red-500/10"
                      : color === "text-purple-500"
                        ? "bg-purple-500/10"
                        : "bg-gray-500/10",
              )}
            >
              {icon}
            </div>
          )}
        </div>
        <div className="flex justify-center">
          <CircularProgressIndicator
            value={percentage}
            size={size}
            strokeWidth={strokeWidth}
            color={color.replace("text-", "").replace("-500", "")}
            glowEffect={true}
          >
            <div className="text-center">
              <div className="text-3xl font-bold text-white">{valueLabel || value}</div>
              {subtitle && <div className="text-xs text-m8bs-muted mt-1">{subtitle}</div>}
            </div>
          </CircularProgressIndicator>
        </div>
        <div className="text-center mt-4">
          <div className="text-sm text-m8bs-muted">{maxValue !== 100 ? `${value} of ${maxValue}` : `${percentage}%`}</div>
        </div>
      </CardContent>
    </Card>
  )
}
