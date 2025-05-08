"use client"

import { useEffect, useRef, useState } from "react"
import { EnhancedChart } from "./enhanced-chart"
import { motion } from "framer-motion"

interface AnimatedChartProps {
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

export function AnimatedChart({ title, type, data, height = 300, className, options = {} }: AnimatedChartProps) {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      {
        threshold: 0.1,
      },
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => {
      observer.disconnect()
    }
  }, [])

  // Create animated data
  const [animatedData, setAnimatedData] = useState({
    ...data,
    datasets: data.datasets.map((dataset) => ({
      ...dataset,
      data: Array(dataset.data.length).fill(0),
    })),
  })

  useEffect(() => {
    if (isVisible) {
      setAnimatedData(data)
    }
  }, [isVisible, data])

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={className}
    >
      <EnhancedChart title={title} type={type} data={animatedData} height={height} options={options} />
    </motion.div>
  )
}
