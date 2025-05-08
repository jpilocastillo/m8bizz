"use client"

import type React from "react"

import { useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface PulseChartProps {
  title: string
  data: number[]
  maxValue?: number
  color?: string
  icon?: React.ReactNode
}

export function PulseChart({ title, data, maxValue, color = "#3b82f6", icon }: PulseChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    // Calculate max value if not provided
    const max = maxValue || Math.max(...data, 1)

    // Animation properties
    let animationFrame: number
    let currentStep = 0
    const totalSteps = 60
    const pointRadius = 4
    const lineWidth = 2

    const drawChart = (progress: number) => {
      if (!ctx || !canvas) return

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Calculate dimensions
      const width = canvas.width
      const height = canvas.height
      const padding = 20
      const chartWidth = width - padding * 2
      const chartHeight = height - padding * 2

      // Draw background grid
      ctx.strokeStyle = "rgba(255, 255, 255, 0.05)"
      ctx.lineWidth = 1

      // Horizontal grid lines
      for (let i = 0; i <= 4; i++) {
        const y = padding + (chartHeight / 4) * i
        ctx.beginPath()
        ctx.moveTo(padding, y)
        ctx.lineTo(width - padding, y)
        ctx.stroke()
      }

      // Vertical grid lines
      const step = chartWidth / (data.length - 1)
      for (let i = 0; i < data.length; i++) {
        const x = padding + step * i
        ctx.beginPath()
        ctx.moveTo(x, padding)
        ctx.lineTo(x, height - padding)
        ctx.stroke()
      }

      // Draw line
      ctx.strokeStyle = color
      ctx.lineWidth = lineWidth
      ctx.lineJoin = "round"
      ctx.lineCap = "round"
      ctx.beginPath()

      // Calculate points
      const points = data.map((value, index) => {
        const x = padding + (chartWidth / (data.length - 1)) * index
        const normalizedValue = value / max
        const y = height - padding - normalizedValue * chartHeight * progress
        return { x, y }
      })

      // Draw line
      ctx.beginPath()
      points.forEach((point, index) => {
        if (index === 0) {
          ctx.moveTo(point.x, point.y)
        } else {
          ctx.lineTo(point.x, point.y)
        }
      })
      ctx.stroke()

      // Draw gradient under the line
      const gradient = ctx.createLinearGradient(0, padding, 0, height - padding)
      gradient.addColorStop(0, `${color}20`)
      gradient.addColorStop(1, "rgba(0, 0, 0, 0)")

      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.moveTo(padding, height - padding)
      points.forEach((point) => {
        ctx.lineTo(point.x, point.y)
      })
      ctx.lineTo(width - padding, height - padding)
      ctx.closePath()
      ctx.fill()

      // Draw points
      points.forEach((point) => {
        // Outer glow
        const gradient = ctx.createRadialGradient(point.x, point.y, 0, point.x, point.y, pointRadius * 2)
        gradient.addColorStop(0, `${color}80`)
        gradient.addColorStop(1, "rgba(0, 0, 0, 0)")

        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(point.x, point.y, pointRadius * 2, 0, Math.PI * 2)
        ctx.fill()

        // Inner point
        ctx.fillStyle = "#fff"
        ctx.beginPath()
        ctx.arc(point.x, point.y, pointRadius, 0, Math.PI * 2)
        ctx.fill()
      })

      // Draw pulsing effect on the last point
      const lastPoint = points[points.length - 1]
      const pulseSize = pointRadius * 3 * (0.5 + Math.sin(Date.now() / 300) * 0.5)

      ctx.fillStyle = `${color}30`
      ctx.beginPath()
      ctx.arc(lastPoint.x, lastPoint.y, pulseSize, 0, Math.PI * 2)
      ctx.fill()
    }

    const animate = () => {
      if (currentStep < totalSteps) {
        const progress = currentStep / totalSteps
        drawChart(progress)
        currentStep++
        animationFrame = requestAnimationFrame(animate)
      } else {
        // Keep redrawing with full progress for the pulse effect
        const pulse = () => {
          drawChart(1)
          animationFrame = requestAnimationFrame(pulse)
        }
        pulse()
      }
    }

    animate()

    const handleResize = () => {
      if (!canvas) return
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
      drawChart(1)
    }

    window.addEventListener("resize", handleResize)

    return () => {
      cancelAnimationFrame(animationFrame)
      window.removeEventListener("resize", handleResize)
    }
  }, [data, color, maxValue])

  return (
    <Card className="bg-gradient-to-br from-m8bs-card to-m8bs-card-alt border-m8bs-border rounded-lg overflow-hidden shadow-md h-full">
      <CardHeader className="bg-m8bs-card-alt border-b border-m8bs-border px-6 py-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-extrabold text-white flex items-center tracking-tight">{title}</CardTitle>
          {icon && <div className="bg-blue-500/20 p-2 rounded-lg">{icon}</div>}
        </div>
      </CardHeader>
      <CardContent className="p-0 h-48">
        <canvas ref={canvasRef} className="w-full h-full" />
      </CardContent>
    </Card>
  )
}
