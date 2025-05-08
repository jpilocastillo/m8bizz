import type React from "react"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

interface M8bsMetricCardProps {
  title: string
  value: string | number
  subtitle?: string
  chart?: React.ReactNode
  footer?: React.ReactNode
  accentColor?: "blue" | "green" | "red" | "purple" | "orange"
  className?: string
  icon?: React.ReactNode
  isLoading?: boolean
}

export function M8bsMetricCard({
  title,
  value,
  subtitle,
  chart,
  footer,
  accentColor = "blue",
  className,
  icon,
  isLoading = false,
}: M8bsMetricCardProps) {
  const accentColorMap = {
    blue: "before:bg-m8bs-blue",
    green: "before:bg-m8bs-green",
    red: "before:bg-m8bs-red",
    purple: "before:bg-m8bs-purple",
    orange: "before:bg-m8bs-orange",
  }

  return (
    <Card
      className={cn(
        "bg-gradient-to-b from-m8bs-gradient-start to-m8bs-gradient-end border-m8bs-border p-6 rounded-lg shadow-md relative before:absolute before:top-0 before:left-0 before:h-1 before:w-full before:rounded-t-md",
        accentColorMap[accentColor],
        className,
      )}
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-m8bs-muted text-sm font-medium">{title}</h3>
        {icon && icon}
      </div>

      {isLoading ? (
        <>
          <Skeleton className="h-8 w-24 mb-2" />
          {subtitle && <Skeleton className="h-4 w-32 mb-4" />}
          {chart && <Skeleton className="h-20 w-full mb-4" />}
          {footer && <Skeleton className="h-16 w-full" />}
        </>
      ) : (
        <>
          <div className="text-3xl font-bold mb-2 text-m8bs-text">{value}</div>
          {subtitle && <div className="text-sm text-m8bs-text-secondary mb-4">{subtitle}</div>}
          {chart && <div className="mb-4">{chart}</div>}
          {footer && <div>{footer}</div>}
        </>
      )}
    </Card>
  )
}
