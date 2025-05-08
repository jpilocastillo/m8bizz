"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Calendar, ChevronDown } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

interface TimePeriodSelectorProps {
  onChange?: (period: string) => void
  className?: string
}

export function TimePeriodSelector({ onChange, className }: TimePeriodSelectorProps) {
  const [selected, setSelected] = useState("Last 6 Months")

  const periods = ["Last 30 Days", "Last 3 Months", "Last 6 Months", "Last 12 Months", "Year to Date", "All Time"]

  const handleSelect = (period: string) => {
    setSelected(period)
    onChange?.(period)
  }

  return (
    <div className={cn("flex items-center", className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="border-[#1f2037] text-white">
            <Calendar className="mr-2 h-4 w-4" />
            {selected}
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 bg-[#131525] border-[#1f2037] text-white">
          {periods.map((period) => (
            <DropdownMenuItem
              key={period}
              onClick={() => handleSelect(period)}
              className={cn("hover:bg-[#1f2037] cursor-pointer", selected === period && "bg-[#1f2037] font-medium")}
            >
              {period}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
