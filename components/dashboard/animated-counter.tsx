"use client"

import { useEffect, useState } from "react"
import { motion, useSpring, useTransform } from "framer-motion"

interface AnimatedCounterProps {
  value: number
  duration?: number
  formatFn?: (value: number) => string
  className?: string
  color?: string
}

export function AnimatedCounter({
  value,
  duration = 1,
  formatFn = (v) => v.toLocaleString(),
  className,
  color = "text-white",
}: AnimatedCounterProps) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const springValue = useSpring(0, {
    stiffness: 80,
    damping: 20,
    duration,
  })

  const displayValue = useTransform(springValue, (current) => formatFn(Math.floor(current)))

  useEffect(() => {
    springValue.set(value)
  }, [springValue, value])

  if (!isMounted) {
    return <span className={`font-bold ${className} ${color}`}>{formatFn(value)}</span>
  }

  return <motion.span className={`font-bold ${className} ${color}`}>{displayValue}</motion.span>
}
