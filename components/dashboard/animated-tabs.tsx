"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

interface AnimatedTabsProps {
  tabs: {
    id: string
    label: React.ReactNode
    icon?: React.ReactNode
  }[]
  activeTab: string
  onChange: (id: string) => void
  className?: string
}

export function AnimatedTabs({ tabs, activeTab, onChange, className }: AnimatedTabsProps) {
  const [hoveredTab, setHoveredTab] = React.useState<string | null>(null)
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className={cn("flex space-x-1 bg-[#0f1029] p-1 rounded-lg shadow-md", className)}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={cn(
              "relative rounded-md px-3 py-2 text-sm font-medium transition-all",
              tab.id === activeTab ? "text-white" : "text-muted-foreground hover:text-white hover:bg-[#1f2037]/50",
            )}
          >
            <div className="flex items-center gap-2">
              {tab.icon}
              {tab.label}
            </div>
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className={cn("flex space-x-1 bg-[#0f1029] p-1 rounded-lg shadow-md", className)}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={cn(
            "relative rounded-md px-3 py-2 text-sm font-medium transition-all",
            tab.id === activeTab ? "text-white" : "text-muted-foreground hover:text-white hover:bg-[#1f2037]/50",
          )}
          onClick={() => onChange(tab.id)}
          onMouseEnter={() => setHoveredTab(tab.id)}
          onMouseLeave={() => setHoveredTab(null)}
        >
          {tab.id === activeTab && (
            <motion.div
              layoutId="active-tab"
              className="absolute inset-0 bg-gradient-to-b from-[#1f2037] to-[#131525] rounded-md"
              transition={{ type: "spring", duration: 0.5 }}
            />
          )}
          {hoveredTab === tab.id && tab.id !== activeTab && (
            <motion.div
              layoutId="hovered-tab"
              className="absolute inset-0 bg-[#1f2037]/30 rounded-md"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            />
          )}
          <div className="relative z-10 flex items-center gap-2">
            {tab.icon && <span className={tab.id === activeTab ? "text-blue-400" : ""}>{tab.icon}</span>}
            {tab.label}
          </div>
        </button>
      ))}
    </div>
  )
}
