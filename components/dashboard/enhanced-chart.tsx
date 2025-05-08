"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { useEffect, useRef } from "react"
import { Chart, registerables } from "chart.js"

Chart.register(...registerables)

interface EnhancedChartProps {
  title: string
  type: "line" | "bar" | "pie" | "doughnut" | "radar" | "polarArea"
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
}

export function EnhancedChart({ title, type, data, height = 300, className, options = {} }: EnhancedChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<Chart | null>(null)

  useEffect(() => {
    if (!chartRef.current) return

    // Destroy existing chart
    if (chartInstance.current) {
      chartInstance.current.destroy()
    }

    const ctx = chartRef.current.getContext("2d")
    if (!ctx) return

    // Default options based on chart type
    const defaultOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: type !== "line" && type !== "bar",
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
          cornerRadius: 6,
          titleFont: {
            weight: "bold",
            size: 13,
          },
          bodyFont: {
            size: 12,
          },
          callbacks: {
            label: (context: any) => {
              let label = context.dataset.label || ""
              if (label) {
                label += ": "
              }
              if (context.parsed.y !== null) {
                if (context.dataset.label?.includes("$")) {
                  label += new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
                    context.parsed.y,
                  )
                } else if (context.dataset.label?.includes("%")) {
                  label += context.parsed.y.toFixed(1) + "%"
                } else {
                  label += context.parsed.y.toLocaleString()
                }
              }
              return label
            },
          },
        },
      },
      scales:
        type === "line" || type === "bar"
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
                  padding: 8,
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
                  callback: function (value: any) {
                    if (this.chart.data.datasets[0].label?.includes("$")) {
                      return "$" + value.toLocaleString()
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
      animation: {
        duration: 1000,
        easing: "easeOutQuart",
      },
    }

    // Merge default options with provided options
    const mergedOptions = {
      ...defaultOptions,
      ...options,
    }

    // Default dataset styling based on chart type
    const styledData = {
      ...data,
      datasets: data.datasets.map((dataset, index) => {
        const colors = [
          { bg: "rgba(59, 130, 246, 0.2)", border: "#3b82f6" }, // blue
          { bg: "rgba(16, 185, 129, 0.2)", border: "#10b981" }, // green
          { bg: "rgba(249, 115, 22, 0.2)", border: "#f97316" }, // orange
          { bg: "rgba(139, 92, 246, 0.2)", border: "#8b5cf6" }, // purple
          { bg: "rgba(236, 72, 153, 0.2)", border: "#ec4899" }, // pink
        ]
        const color = colors[index % colors.length]

        return {
          ...dataset,
          backgroundColor:
            dataset.backgroundColor ||
            (type === "line"
              ? color.bg
              : type === "bar"
                ? color.border
                : [
                    "rgba(59, 130, 246, 0.8)",
                    "rgba(16, 185, 129, 0.8)",
                    "rgba(249, 115, 22, 0.8)",
                    "rgba(139, 92, 246, 0.8)",
                    "rgba(236, 72, 153, 0.8)",
                  ]),
          borderColor: dataset.borderColor || color.border,
          borderWidth: dataset.borderWidth || 2,
          tension: type === "line" ? 0.4 : undefined,
          fill: dataset.fill !== undefined ? dataset.fill : type === "line",
          pointBackgroundColor: type === "line" ? "#fff" : undefined,
          pointBorderColor: type === "line" ? color.border : undefined,
          pointRadius: type === "line" ? 4 : undefined,
          pointHoverRadius: type === "line" ? 6 : undefined,
          pointBorderWidth: type === "line" ? 2 : undefined,
          hoverBackgroundColor:
            type === "bar" || type === "doughnut" || type === "pie"
              ? dataset.backgroundColor
                ? undefined
                : [
                    "rgba(59, 130, 246, 0.9)",
                    "rgba(16, 185, 129, 0.9)",
                    "rgba(249, 115, 22, 0.9)",
                    "rgba(139, 92, 246, 0.9)",
                    "rgba(236, 72, 153, 0.9)",
                  ]
              : undefined,
        }
      }),
    }

    chartInstance.current = new Chart(ctx, {
      type,
      data: styledData,
      options: mergedOptions,
    })

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [data, type, options])

  return (
    <Card
      className={cn(
        "bg-[#131525] border-[#1f2037] overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300",
        className,
      )}
    >
      <CardHeader className="pb-2 bg-[#0f1029]/50 border-b border-[#1f2037]">
        <CardTitle className="text-lg font-medium text-white">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div style={{ height: `${height}px` }} className="w-full">
          <canvas ref={chartRef} />
        </div>
      </CardContent>
    </Card>
  )
}
