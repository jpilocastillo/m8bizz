"use client"

import type React from "react"

import { useState, useRef } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { AnimatedCounter } from "./animated-counter"

interface ThreeDMetricCardProps {
  title: string
  value: number
  format?: "percent" | "currency" | "number"
  icon?: React.ReactNode
  description?: string
  color?: "blue" | "green" | "purple" | "amber" | "red" | "cyan"
  className?: string
}

export function ThreeDMetricCard({
  title,
  value,
  format = "number",
  icon,
  description,
  color = "blue",
  className,
}: ThreeDMetricCardProps) {
  const [rotateX, setRotateX] = useState(0)
  const [rotateY, setRotateY] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  const formatValue = (val: number) => {
    if (format === "percent") {
      return `${val.toFixed(1)}%`
    } else if (format === "currency") {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      }).format(val)
    } else {
      return val.toLocaleString()
    }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return

    const rect = cardRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2

    const rotateXValue = ((y - centerY) / centerY) * -10
    const rotateYValue = ((x - centerX) / centerX) * 10

    setRotateX(rotateXValue)
    setRotateY(rotateYValue)
  }

  const resetRotation = () => {
    setRotateX(0)
    setRotateY(0)
    setIsHovered(false)
  }

  const colorVariants = {
    blue: "from-blue-500/20 to-blue-600/5 border-blue-500/20 shadow-blue-500/10",
    green: "from-green-500/20 to-green-600/5 border-green-500/20 shadow-green-500/10",
    purple: "from-purple-500/20 to-purple-600/5 border-purple-500/20 shadow-purple-500/10",
    amber: "from-amber-500/20 to-amber-600/5 border-amber-500/20 shadow-amber-500/10",
    red: "from-red-500/20 to-red-600/5 border-red-500/20 shadow-red-500/10",
    cyan: "from-cyan-500/20 to-cyan-600/5 border-cyan-500/20 shadow-cyan-500/10",
  }

  const glowVariants = {
    blue: "after:bg-blue-500/10",
    green: "after:bg-green-500/10",
    purple: "after:bg-purple-500/10",
    amber: "after:bg-amber-500/10",
    red: "after:bg-red-500/10",
    cyan: "after:bg-cyan-500/10",
  }

  return (
    <motion.div
      ref={cardRef}
      className={cn("relative h-full perspective-1000 transform-gpu", isHovered ? "z-10" : "z-0", className)}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={resetRotation}
      style={{
        transformStyle: "preserve-3d",
      }}
    >
      <motion.div
        className={cn(
          "relative h-full w-full rounded-xl overflow-hidden",
          "after:absolute after:inset-0 after:rounded-xl after:opacity-0 after:transition-opacity after:duration-300",
          isHovered ? "after:opacity-100" : "",
          glowVariants[color],
        )}
        animate={{
          rotateX,
          rotateY,
          scale: isHovered ? 1.02 : 1,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        style={{
          transformStyle: "preserve-3d",
        }}
      >
        <Card
          className={cn(
            "bg-gradient-to-br border rounded-xl overflow-hidden shadow-lg h-full transition-all duration-300",
            colorVariants[color],
          )}
        >
          <CardContent className="p-5 relative">
            {/* Floating 3D elements */}
            <motion.div
              className={cn("absolute top-2 right-2 w-12 h-12 rounded-full opacity-20", `bg-${color}-500/30`)}
              animate={{
                translateZ: isHovered ? "20px" : "0px",
                scale: isHovered ? 1.2 : 1,
              }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              style={{ transformStyle: "preserve-3d" }}
            />

            <motion.div
              className={cn("absolute bottom-2 left-2 w-8 h-8 rounded-full opacity-20", `bg-${color}-500/30`)}
              animate={{
                translateZ: isHovered ? "15px" : "0px",
                scale: isHovered ? 1.1 : 1,
              }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              style={{ transformStyle: "preserve-3d" }}
            />

            <div className="flex items-center justify-between mb-3">
              <motion.h3
                className="text-base font-bold text-white tracking-wide"
                animate={{
                  translateZ: isHovered ? "30px" : "0px",
                }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                style={{ transformStyle: "preserve-3d" }}
              >
                {title}
              </motion.h3>
              {icon && (
                <motion.div
                  className={cn("p-2 rounded-lg", `bg-${color}-500/10`)}
                  animate={{
                    translateZ: isHovered ? "40px" : "0px",
                    rotateZ: isHovered ? 10 : 0,
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  style={{ transformStyle: "preserve-3d" }}
                >
                  {icon}
                </motion.div>
              )}
            </div>
            <motion.div
              className="text-3xl font-extrabold text-white tracking-tight"
              animate={{
                translateZ: isHovered ? "50px" : "0px",
              }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              style={{ transformStyle: "preserve-3d" }}
            >
              <AnimatedCounter value={value} formatFn={formatValue} duration={1.5} />
            </motion.div>
            {description && (
              <motion.p
                className="text-sm text-gray-400 mt-2"
                animate={{
                  translateZ: isHovered ? "20px" : "0px",
                }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                style={{ transformStyle: "preserve-3d" }}
              >
                {description}
              </motion.p>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
