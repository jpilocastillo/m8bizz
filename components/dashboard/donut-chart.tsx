"use client"

import type React from "react"
import { useEffect, useRef } from "react"
import { cn } from "@/lib/utils"

interface DonutChartProps {
  data: {
    value: number
    color: string
    label?: string
  }[]
  size?: number
  thickness?: number
  className?: string
  centerContent?: React.ReactNode
  glowEffect?: boolean
}

export function DonutChart({
  data,
  size = 160,
  thickness = 20,
  className,
  centerContent,
  glowEffect = true,
}: DonutChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const total = data.reduce((sum, item) => sum + item.value, 0) || 1

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    const dpr = window.devicePixelRatio || 1
    canvas.width = size * dpr
    canvas.height = size * dpr
    ctx.scale(dpr, dpr)

    // Clear canvas
    ctx.clearRect(0, 0, size, size)

    // Draw donut chart
    const centerX = size / 2
    const centerY = size / 2
    const radius = size / 2 - thickness / 2

    // Add shadow/glow if enabled
    if (glowEffect) {
      ctx.shadowBlur = 10
      ctx.shadowColor = "rgba(59, 130, 246, 0.5)"
    }

    let startAngle = -Math.PI / 2 // Start from top

    data.forEach((item) => {
      const sliceAngle = (item.value / total) * 2 * Math.PI

      // Set shadow color based on slice color
      if (glowEffect) {
        ctx.shadowColor = item.color.replace(")", ", 0.5)").replace("rgb", "rgba")
      }

      // Draw slice
      ctx.beginPath()
      ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle)
      ctx.arc(centerX, centerY, radius - thickness, startAngle + sliceAngle, startAngle, true)
      ctx.closePath()
      ctx.fillStyle = item.color
      ctx.fill()

      startAngle += sliceAngle
    })

    // Reset shadow
    if (glowEffect) {
      ctx.shadowBlur = 0
      ctx.shadowColor = "transparent"
    }

    // Draw inner circle (for donut hole)
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius - thickness, 0, 2 * Math.PI)
    ctx.fillStyle = "#0f1029" // Dark background for the hole
    ctx.fill()
  }, [data, size, thickness, total, glowEffect])

  return (
    <div className={cn("relative", className)} style={{ width: size, height: size }}>
      <canvas ref={canvasRef} width={size} height={size} className="w-full h-full" />
      {centerContent && <div className="absolute inset-0 flex items-center justify-center">{centerContent}</div>}
    </div>
  )
}
