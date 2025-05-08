"use client"

import { useEffect, useRef } from "react"
import { cn } from "@/lib/utils"

interface BarChartProps {
  data: {
    label: string
    value: number
    color?: string
  }[]
  height?: number
  barWidth?: number
  gap?: number
  showLabels?: boolean
  showValues?: boolean
  className?: string
  formatValue?: (value: number) => string
  animated?: boolean
}

export function BarChart({
  data,
  height = 200,
  barWidth = 30,
  gap = 10,
  showLabels = true,
  showValues = true,
  className,
  formatValue = (value) => value.toString(),
  animated = true,
}: BarChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const maxValue = Math.max(...data.map((item) => item.value), 1)
  const defaultColors = ["#3b82f6", "#10b981", "#8b5cf6", "#ef4444", "#f59e0b", "#06b6d4"]

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    const dpr = window.devicePixelRatio || 1
    const totalWidth = data.length * barWidth + (data.length - 1) * gap
    canvas.width = totalWidth * dpr
    canvas.height = height * dpr
    ctx.scale(dpr, dpr)
    canvas.style.width = `${totalWidth}px`
    canvas.style.height = `${height}px`

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw bars
    data.forEach((item, index) => {
      const x = index * (barWidth + gap)
      const barHeight = (item.value / maxValue) * (height - 40)
      const y = height - barHeight - 20
      const color = item.color || defaultColors[index % defaultColors.length]

      // Draw bar
      ctx.beginPath()
      ctx.roundRect(x, y, barWidth, barHeight, 4)
      ctx.fillStyle = color
      ctx.fill()

      // Draw label
      if (showLabels) {
        ctx.fillStyle = "#9ca3af"
        ctx.font = "10px sans-serif"
        ctx.textAlign = "center"
        ctx.fillText(item.label, x + barWidth / 2, height - 5)
      }

      // Draw value
      if (showValues) {
        ctx.fillStyle = "#ffffff"
        ctx.font = "bold 10px sans-serif"
        ctx.textAlign = "center"
        ctx.fillText(formatValue(item.value), x + barWidth / 2, y - 5)
      }
    })
  }, [data, height, barWidth, gap, showLabels, showValues, maxValue, formatValue, defaultColors])

  return (
    <div className={cn("overflow-x-auto", className)}>
      <canvas
        ref={canvasRef}
        height={height}
        className={cn("min-w-full", animated && "animate-in fade-in duration-700")}
      />
    </div>
  )
}
