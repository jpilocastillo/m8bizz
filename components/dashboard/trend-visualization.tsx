"use client"

import { useEffect, useRef } from "react"
import { cn } from "@/lib/utils"

interface TrendVisualizationProps {
  data: number[]
  height?: number
  color?: string
  fillColor?: string
  strokeWidth?: number
  className?: string
  showArea?: boolean
}

export function TrendVisualization({
  data,
  height = 40,
  color = "#3b82f6",
  fillColor = "rgba(59, 130, 246, 0.1)",
  strokeWidth = 2,
  className,
  showArea = true,
}: TrendVisualizationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || data.length < 2) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    const dpr = window.devicePixelRatio || 1
    canvas.width = canvas.offsetWidth * dpr
    canvas.height = height * dpr
    ctx.scale(dpr, dpr)

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Find min and max values
    const minValue = Math.min(...data)
    const maxValue = Math.max(...data)
    const range = maxValue - minValue || 1

    // Calculate point positions
    const points = data.map((value, index) => ({
      x: (index / (data.length - 1)) * canvas.offsetWidth,
      y: height - ((value - minValue) / range) * (height * 0.8) - height * 0.1,
    }))

    // Draw area if enabled
    if (showArea) {
      ctx.beginPath()
      ctx.moveTo(points[0].x, height)
      points.forEach((point) => {
        ctx.lineTo(point.x, point.y)
      })
      ctx.lineTo(points[points.length - 1].x, height)
      ctx.closePath()
      ctx.fillStyle = fillColor
      ctx.fill()
    }

    // Draw line
    ctx.beginPath()
    ctx.moveTo(points[0].x, points[0].y)
    points.forEach((point) => {
      ctx.lineTo(point.x, point.y)
    })
    ctx.strokeStyle = color
    ctx.lineWidth = strokeWidth
    ctx.stroke()

    // Draw points
    points.forEach((point) => {
      ctx.beginPath()
      ctx.arc(point.x, point.y, 3, 0, Math.PI * 2)
      ctx.fillStyle = color
      ctx.fill()
      ctx.strokeStyle = "#fff"
      ctx.lineWidth = 1
      ctx.stroke()
    })
  }, [data, height, color, fillColor, strokeWidth, showArea])

  return (
    <canvas ref={canvasRef} height={height} className={cn("w-full", className)} style={{ height: `${height}px` }} />
  )
}
