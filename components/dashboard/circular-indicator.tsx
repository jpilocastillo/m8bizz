"use client"

import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"

interface CircularIndicatorProps {
  value: number
  maxValue?: number
  size?: "sm" | "md" | "lg"
  color?: "blue" | "green" | "red" | "orange" | "purple"
  showValue?: boolean
  label?: string
  className?: string
  thickness?: number
  animated?: boolean
}

export function CircularIndicator({
  value,
  maxValue = 100,
  size = "md",
  color = "blue",
  showValue = true,
  label,
  className,
  thickness = 8,
  animated = true,
}: CircularIndicatorProps) {
  // Ensure value and maxValue are valid numbers
  const safeValue = typeof value === "number" && !isNaN(value) ? value : 0
  const safeMaxValue = typeof maxValue === "number" && !isNaN(maxValue) && maxValue > 0 ? maxValue : 100

  // For animation
  const [displayValue, setDisplayValue] = useState(0)

  // Calculate percentage safely
  const percentage = Math.min(100, Math.max(0, (safeValue / safeMaxValue) * 100))

  // Animate the value when it changes
  useEffect(() => {
    if (!animated) {
      setDisplayValue(safeValue)
      return
    }

    const start = 0
    const end = safeValue
    const duration = 1000
    const startTime = performance.now()

    const animateValue = (timestamp: number) => {
      const runtime = timestamp - startTime
      const progress = Math.min(runtime / duration, 1)
      const currentValue = Math.floor(progress * (end - start) + start)

      setDisplayValue(currentValue)

      if (runtime < duration) {
        requestAnimationFrame(animateValue)
      } else {
        setDisplayValue(end)
      }
    }

    requestAnimationFrame(animateValue)
  }, [safeValue, animated])

  const sizeMap = {
    sm: 80,
    md: 120,
    lg: 160,
  }

  const actualSize = sizeMap[size]
  const radius = (actualSize - thickness) / 2
  const circumference = 2 * Math.PI * radius

  // Calculate strokeDashoffset and convert to string to avoid NaN issues
  const strokeDashoffset = `${circumference - (percentage / 100) * circumference}`

  const colorMap = {
    blue: "text-blue-500",
    green: "text-green-500",
    red: "text-red-500",
    orange: "text-orange-500",
    purple: "text-purple-500",
  }

  const glowColorMap = {
    blue: "shadow-[0_0_15px_rgba(59,130,246,0.5)]",
    green: "shadow-[0_0_15px_rgba(16,185,129,0.5)]",
    red: "shadow-[0_0_15px_rgba(239,68,68,0.5)]",
    orange: "shadow-[0_0_15px_rgba(249,115,22,0.5)]",
    purple: "shadow-[0_0_15px_rgba(139,92,246,0.5)]",
  }

  const fontSizeMap = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-4xl",
  }

  const labelSizeMap = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  }

  return (
    <div className={cn("relative flex items-center justify-center", className)}>
      <svg
        width={actualSize}
        height={actualSize}
        viewBox={`0 0 ${actualSize} ${actualSize}`}
        className="transform -rotate-90"
      >
        {/* Add gradient and glow effect */}
        <defs>
          <linearGradient id={`gradient-${color}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={`var(--${color}-500)`} stopOpacity="0.8" />
            <stop offset="100%" stopColor={`var(--${color}-600)`} stopOpacity="1" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background circle */}
        <circle
          cx={actualSize / 2}
          cy={actualSize / 2}
          r={radius}
          fill="transparent"
          stroke="#1f2037"
          strokeWidth={thickness}
          className="opacity-30"
        />

        {/* Progress circle with gradient */}
        <circle
          cx={actualSize / 2}
          cy={actualSize / 2}
          r={radius}
          fill="transparent"
          stroke={`url(#gradient-${color})`}
          strokeWidth={thickness}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          filter="url(#glow)"
          className={cn(animated && "transition-all duration-700 ease-out")}
        />
      </svg>

      {showValue && (
        <div className="absolute flex flex-col items-center justify-center">
          <span className={cn("font-bold", fontSizeMap[size], colorMap[color])}>
            {typeof displayValue === "number" && displayValue % 1 === 0 ? displayValue : displayValue.toFixed(1)}
            {label && "%"}
          </span>
          {label && <span className={cn("text-gray-400", labelSizeMap[size])}>{label}</span>}
        </div>
      )}
    </div>
  )
}
