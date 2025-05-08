"use client"

import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"

interface MiniBarChartProps {
  data: number[]
  height?: number
  className?: string
  barClassName?: string
  barSpacing?: number
  colors?: string[]
  animated?: boolean
}

export function MiniBarChart({
  data,
  height = 40,
  className,
  barClassName,
  barSpacing = 2,
  colors = ["bg-blue-500"],
  animated = true,
}: MiniBarChartProps) {
  const max = Math.max(...data, 1)
  const [animatedHeights, setAnimatedHeights] = useState<number[]>(data.map(() => 0))

  // Animate the bars when data changes
  useEffect(() => {
    if (!animated) {
      setAnimatedHeights(data.map((value) => (value / max) * 100))
      return
    }

    const duration = 1000
    const startTime = performance.now()
    const startHeights = [...animatedHeights]
    const targetHeights = data.map((value) => (value / max) * 100)

    const animateBars = (timestamp: number) => {
      const runtime = timestamp - startTime
      const progress = Math.min(runtime / duration, 1)

      const newHeights = startHeights.map((startHeight, index) => {
        return startHeight + (targetHeights[index] - startHeight) * progress
      })

      setAnimatedHeights(newHeights)

      if (runtime < duration) {
        requestAnimationFrame(animateBars)
      } else {
        setAnimatedHeights(targetHeights)
      }
    }

    requestAnimationFrame(animateBars)
  }, [data, max, animated, animatedHeights])

  return (
    <div className={cn("flex items-end gap-px h-full", className)} style={{ height }}>
      {data.map((value, index) => (
        <div
          key={index}
          className={cn(
            "flex-1 rounded-sm transition-all duration-300 relative group",
            colors[index % colors.length] || colors[0],
            "hover:brightness-110",
            barClassName,
          )}
          style={{
            height: `${animatedHeights[index]}%`,
            marginLeft: index > 0 ? barSpacing : 0,
            boxShadow: "0 0 8px rgba(59, 130, 246, 0.3)",
          }}
        >
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-1.5 py-0.5 bg-[#1f2037] rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-md z-10">
            {value}
          </div>
        </div>
      ))}
    </div>
  )
}
