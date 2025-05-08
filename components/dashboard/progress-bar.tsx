"use client"

import { cn } from "@/lib/utils"

interface ProgressBarProps {
  value: number
  maxValue?: number
  label?: string
  valueLabel?: string
  color?: string
  height?: "sm" | "md" | "lg"
  className?: string
}

export function ProgressBar({
  value,
  maxValue = 100,
  label,
  valueLabel,
  color = "bg-blue-500",
  height = "md",
  className,
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / maxValue) * 100))

  const heightClass = {
    sm: "h-1.5",
    md: "h-2.5",
    lg: "h-4",
  }[height]

  return (
    <div className={cn("space-y-2", className)}>
      {(label || valueLabel) && (
        <div className="flex justify-between items-center">
          {label && <span className="text-sm font-medium text-gray-400">{label}</span>}
          {valueLabel && <span className="text-sm font-medium text-white">{valueLabel}</span>}
        </div>
      )}
      <div className={cn("w-full bg-[#1f2037] rounded-full overflow-hidden", heightClass)}>
        <div
          className={cn("rounded-full transition-all duration-500 ease-out", color, height === "lg" && "shadow-glow")}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
