"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { useEffect, useRef, useState } from "react"
import { Chart, registerables, type ChartType, type ChartOptions } from "chart.js"
import { motion } from "framer-motion"
import { Info } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

Chart.register(...registerables)

interface InteractiveChartProps {
  title: string
  description?: string
  type: string
  data: {
    labels: string[]
    datasets: {
      label: string
      data: number[]
      backgroundColor?: string | string[]
      borderColor?: string | string[]
      borderWidth?: number
      fill?: boolean
    }[]
  }
  height?: number
  className?: string
  options?: any
  loading?: boolean
}

export function InteractiveChart({
  title,
  description,
  type,
  data,
  height = 300,
  className,
  options = {},
  loading = false,
}: InteractiveChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<Chart | null>(null)
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  useEffect(() => {
    if (!chartRef.current || loading) return

    // Destroy existing chart
    if (chartInstance.current) {
      chartInstance.current.destroy()
    }

    const ctx = chartRef.current.getContext("2d")
    if (!ctx) return

    // Convert horizontalBar to bar with indexAxis: 'y'
    let chartType = type
    const customOptions = { ...options }

    // Handle horizontalBar type (deprecated in Chart.js v3+)
    if (type === "horizontalBar") {
      chartType = "bar"
      customOptions.indexAxis = "y"
    }

    // Default options based on chart type
    const defaultOptions: ChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 1000,
        easing: "easeOutQuart",
      },
      plugins: {
        legend: {
          display: chartType !== "line" && chartType !== "bar",
          position: "top" as const,
          labels: {
            color: "#e5e7eb",
            font: {
              size: 12,
              weight: "bold",
            },
            padding: 16,
            usePointStyle: true,
            pointStyle: "circle",
          },
        },
        tooltip: {
          mode: "index" as const,
          intersect: false,
          backgroundColor: "#1f2937",
          titleColor: "#fff",
          bodyColor: "#e5e7eb",
          borderColor: "#374151",
          borderWidth: 1,
          padding: 12,
          displayColors: true,
          titleFont: {
            size: 14,
            weight: "bold",
          },
          bodyFont: {
            size: 13,
          },
          callbacks: {
            label: (context) => {
              let label = context.dataset.label || ""
              if (label) {
                label += ": "
              }

              // Different chart types have different data structures
              let value

              // For pie, doughnut, and polarArea charts
              if (chartType === "pie" || chartType === "doughnut" || chartType === "polarArea") {
                value = context.parsed || context.raw
              }
              // For bar and line charts
              else {
                value =
                  context.parsed?.y !== undefined ? context.parsed.y : context.raw !== undefined ? context.raw : null
              }

              // Format the value if it exists
              if (value !== null && value !== undefined) {
                if (
                  context.dataset.label?.toLowerCase().includes("revenue") ||
                  context.dataset.label?.toLowerCase().includes("profit") ||
                  context.dataset.label?.toLowerCase().includes("cost")
                ) {
                  label += new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value)
                } else if (
                  context.dataset.label?.toLowerCase().includes("rate") ||
                  context.dataset.label?.toLowerCase().includes("percentage")
                ) {
                  label += Number.parseFloat(value).toFixed(1) + "%"
                } else {
                  // Make sure value is a number before calling toLocaleString
                  label += typeof value === "number" ? value.toLocaleString() : value
                }
              }

              return label
            },
          },
        },
      },
      scales:
        chartType === "line" || chartType === "bar"
          ? {
              x: {
                grid: {
                  display: false,
                  drawBorder: false,
                  color: "rgba(75, 85, 99, 0.2)",
                },
                ticks: {
                  color: "#9ca3af",
                  font: {
                    size: 11,
                  },
                  maxRotation: 45,
                  minRotation: 45,
                },
              },
              y: {
                grid: {
                  color: "rgba(75, 85, 99, 0.2)",
                  drawBorder: false,
                },
                ticks: {
                  color: "#9ca3af",
                  padding: 10,
                  font: {
                    size: 11,
                  },
                  callback: function (value) {
                    if (!value && value !== 0) return ""

                    if (
                      this.chart.data.datasets[0]?.label?.toLowerCase().includes("revenue") ||
                      this.chart.data.datasets[0]?.label?.toLowerCase().includes("profit") ||
                      this.chart.data.datasets[0]?.label?.toLowerCase().includes("cost")
                    ) {
                      return "$" + value.toLocaleString()
                    } else if (
                      this.chart.data.datasets[0]?.label?.toLowerCase().includes("rate") ||
                      this.chart.data.datasets[0]?.label?.toLowerCase().includes("percentage")
                    ) {
                      return value + "%"
                    }
                    return value
                  },
                },
                beginAtZero: true,
              },
            }
          : undefined,
      interaction: {
        mode: "nearest" as const,
        axis: "x" as const,
        intersect: false,
      },
      onHover: (_event: any, elements: any[]) => {
        if (elements && elements.length) {
          setActiveIndex(elements[0].index)
        } else {
          setActiveIndex(null)
        }
      },
    }

    // Merge default options with provided options
    const mergedOptions = {
      ...defaultOptions,
      ...customOptions,
    }

    // Enhanced color palette
    const colorPalette = [
      { bg: "rgba(59, 130, 246, 0.2)", border: "rgb(59, 130, 246)" }, // blue
      { bg: "rgba(16, 185, 129, 0.2)", border: "rgb(16, 185, 129)" }, // green
      { bg: "rgba(249, 115, 22, 0.2)", border: "rgb(249, 115, 22)" }, // orange
      { bg: "rgba(139, 92, 246, 0.2)", border: "rgb(139, 92, 246)" }, // purple
      { bg: "rgba(236, 72, 153, 0.2)", border: "rgb(236, 72, 153)" }, // pink
      { bg: "rgba(14, 165, 233, 0.2)", border: "rgb(14, 165, 233)" }, // sky
      { bg: "rgba(168, 85, 247, 0.2)", border: "rgb(168, 85, 247)" }, // violet
      { bg: "rgba(251, 191, 36, 0.2)", border: "rgb(251, 191, 36)" }, // amber
    ]

    // Default dataset styling based on chart type
    const styledData = {
      ...data,
      datasets: data.datasets.map((dataset, index) => {
        const color = colorPalette[index % colorPalette.length]

        return {
          ...dataset,
          backgroundColor:
            dataset.backgroundColor ||
            (chartType === "line"
              ? color.bg
              : chartType === "bar"
                ? color.border
                : [
                    "rgba(59, 130, 246, 0.8)",
                    "rgba(16, 185, 129, 0.8)",
                    "rgba(249, 115, 22, 0.8)",
                    "rgba(139, 92, 246, 0.8)",
                    "rgba(236, 72, 153, 0.8)",
                    "rgba(14, 165, 233, 0.8)",
                    "rgba(168, 85, 247, 0.8)",
                    "rgba(251, 191, 36, 0.8)",
                  ]),
          borderColor: dataset.borderColor || color.border,
          borderWidth: dataset.borderWidth || 2,
          tension: chartType === "line" ? 0.4 : undefined,
          fill: dataset.fill !== undefined ? dataset.fill : chartType === "line",
          pointBackgroundColor: color.border,
          pointBorderColor: "#fff",
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBorderWidth: 2,
          hoverBackgroundColor:
            chartType === "pie" || chartType === "doughnut" ? "rgba(255, 255, 255, 0.1)" : undefined,
        }
      }),
    }

    chartInstance.current = new Chart(ctx, {
      type: chartType as ChartType,
      data: styledData,
      options: mergedOptions,
    })

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [data, type, options, loading])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="h-full"
    >
      <Card
        className={cn(
          "bg-gradient-to-br from-m8bs-card to-m8bs-card-alt border-m8bs-border rounded-xl shadow-lg h-full",
          className,
        )}
      >
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold text-white">{title}</CardTitle>
            {description && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-gray-400 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="bg-gray-900 text-white border-gray-800 p-3 max-w-xs">
                    <p>{description}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center" style={{ height: `${height}px` }}>
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div style={{ height: `${height}px` }} className="w-full">
              <canvas ref={chartRef} />
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
