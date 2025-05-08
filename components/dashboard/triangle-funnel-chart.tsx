"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"
import { Info } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface FunnelStage {
  name: string
  value: number
  color: string
}

interface TriangleFunnelChartProps {
  title: string
  description?: string
  data: FunnelStage[]
  className?: string
}

export function TriangleFunnelChart({ title, description, data, className }: TriangleFunnelChartProps) {
  const [isClient, setIsClient] = useState(false)
  const [hoveredStage, setHoveredStage] = useState<number | null>(null)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Calculate the total height of the funnel
  const funnelHeight = 320
  const funnelWidth = 480

  // Calculate heights proportionally
  const totalValues = data.reduce((sum, stage) => sum + stage.value, 0)
  const stageHeights = data.map((stage) => (stage.value / totalValues) * funnelHeight)

  // Calculate cumulative heights for positioning
  const cumulativeHeights = stageHeights.reduce((acc, height, i) => [...acc, (acc[i] || 0) + height], [0])

  // Generate paths for each funnel stage
  const generateStagePath = (index: number): string => {
    if (!isClient) return ""

    const stageHeight = stageHeights[index]
    const startY = cumulativeHeights[index]
    const endY = cumulativeHeights[index + 1] || funnelHeight

    // Calculate widths based on position in funnel
    const topWidth = funnelWidth * (1 - startY / funnelHeight) * 0.95
    const bottomWidth = funnelWidth * (1 - endY / funnelHeight) * 0.95

    // Center the trapezoid
    const topLeftX = (funnelWidth - topWidth) / 2
    const topRightX = topLeftX + topWidth
    const bottomLeftX = (funnelWidth - bottomWidth) / 2
    const bottomRightX = bottomLeftX + bottomWidth

    return `
      M ${topLeftX} ${startY}
      L ${topRightX} ${startY}
      L ${bottomRightX} ${endY}
      L ${bottomLeftX} ${endY}
      Z
    `
  }

  // Calculate conversion rates between stages
  const conversionRates = data.slice(1).map((stage, index) => {
    const previousStage = data[index]
    return (stage.value / previousStage.value) * 100
  })

  return (
    <Card
      className={`bg-gradient-to-br from-m8bs-card to-m8bs-card-alt border-m8bs-border rounded-xl shadow-lg ${className}`}
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
      <CardContent className="p-4">
        <div className="relative w-full h-[320px] flex items-center justify-center">
          {isClient && (
            <svg width={funnelWidth} height={funnelHeight} className="overflow-visible">
              <defs>
                {data.map((stage, index) => (
                  <linearGradient
                    key={`gradient-${index}`}
                    id={`funnel-gradient-${index}`}
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor={`${stage.color}DD`} />
                    <stop offset="100%" stopColor={`${stage.color}AA`} />
                  </linearGradient>
                ))}
                {/* Add subtle glow filter */}
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Render funnel stages */}
              {data.map((stage, index) => (
                <motion.g
                  key={`stage-${index}`}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <motion.path
                    d={generateStagePath(index)}
                    fill={`url(#funnel-gradient-${index})`}
                    stroke={hoveredStage === index ? "#ffffff" : `${stage.color}CC`}
                    strokeWidth={hoveredStage === index ? 2 : 1}
                    filter={hoveredStage === index ? "url(#glow)" : ""}
                    onMouseEnter={() => setHoveredStage(index)}
                    onMouseLeave={() => setHoveredStage(null)}
                    whileHover={{ scale: 1.01 }}
                    transition={{ duration: 0.2 }}
                  />

                  {/* Stage labels */}
                  <foreignObject
                    x={funnelWidth / 2 - 75}
                    y={cumulativeHeights[index] + stageHeights[index] / 2 - 20}
                    width={150}
                    height={40}
                  >
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <span className="text-white font-medium text-sm">{stage.name}</span>
                      <span className="text-white font-bold text-lg">{stage.value.toLocaleString()}</span>
                    </div>
                  </foreignObject>

                  {/* Conversion rate indicators (between stages) */}
                  {index < data.length - 1 && (
                    <g>
                      <foreignObject x={funnelWidth - 70} y={cumulativeHeights[index + 1] - 15} width={70} height={30}>
                        <div className="flex items-center justify-end h-full">
                          <div className="bg-gray-800/70 px-2 py-1 rounded-md backdrop-blur-sm border border-gray-700/50">
                            <span className="text-xs font-medium text-green-400">
                              {conversionRates[index].toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      </foreignObject>
                      <path
                        d={`M ${funnelWidth - 75} ${cumulativeHeights[index + 1]}
                            L ${funnelWidth - 85} ${cumulativeHeights[index + 1] - 5}
                            L ${funnelWidth - 85} ${cumulativeHeights[index + 1] + 5} Z`}
                        fill="#10b981"
                      />
                    </g>
                  )}
                </motion.g>
              ))}
            </svg>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
