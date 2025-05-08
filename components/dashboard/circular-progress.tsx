"use client"
import type * as React from "react"

interface CircularProgressProps extends React.HTMLAttributes<HTMLSpanElement> {
  value: number
  max?: number
  size?: number
  strokeWidth?: number
  color?: string
  secondaryColor?: string
  secondaryValue?: number
  glowEffect?: boolean
  children?: React.ReactNode
}

export function CircularProgress({
  value,
  max = 100,
  size = 60,
  strokeWidth = 6,
  color = "blue",
  secondaryColor,
  secondaryValue = 0,
  glowEffect = false,
  children,
  ...props
}: CircularProgressProps) {
  const radius = size / 2 - strokeWidth / 2
  const circumference = 2 * Math.PI * radius
  const progress = value / max

  const strokeDashoffset = circumference * (1 - progress)

  const getColorValue = () => {
    switch (color) {
      case "blue":
        return "#3b82f6"
      case "green":
        return "#10b981"
      case "red":
        return "#ef4444"
      case "purple":
        return "#8b5cf6"
      default:
        return color
    }
  }

  const getSecondaryColorValue = () => {
    switch (secondaryColor) {
      case "blue":
        return "#3b82f6"
      case "green":
        return "#10b981"
      case "red":
        return "#ef4444"
      case "purple":
        return "#8b5cf6"
      default:
        return secondaryColor || "#1f2937"
    }
  }

  return (
    <span className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} {...props}>
        {glowEffect && (
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
        )}

        <circle cx={size / 2} cy={size / 2} r={radius} strokeWidth={strokeWidth} stroke="#1f2937" fill="transparent" />

        {secondaryValue > 0 && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - secondaryValue / max)}
            strokeLinecap="round"
            stroke={getSecondaryColorValue()}
            fill="transparent"
            style={{ transform: "rotate(-90deg)", transformOrigin: "center" }}
            filter={glowEffect ? "url(#glow)" : undefined}
          />
        )}

        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          stroke={getColorValue()}
          fill="transparent"
          style={{ transform: "rotate(-90deg)", transformOrigin: "center" }}
          filter={glowEffect ? "url(#glow)" : undefined}
        />
      </svg>

      {children && <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">{children}</span>}
    </span>
  )
}
