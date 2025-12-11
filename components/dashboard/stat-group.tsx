import type React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface StatItemProps {
  label: string
  value: string | number
  color?: string
  icon?: React.ReactNode
}

interface StatGroupProps {
  items: StatItemProps[]
  className?: string
  columns?: 2 | 3 | 4 | 5
}

export function StatGroup({ items, className, columns = 4 }: StatGroupProps) {
  const gridCols = {
    2: "grid-cols-2",
    3: "grid-cols-3",
    4: "grid-cols-2 md:grid-cols-4",
    5: "grid-cols-2 md:grid-cols-5",
  }[columns]

  return (
    <Card
      className={cn(
        "bg-m8bs-card shadow-sm",
        className,
      )}
    >
      <CardContent className="p-6">
        <div className={cn("grid gap-4", gridCols)}>
          {items.map((item, index) => (
            <div
              key={index}
              className="flex flex-col items-center justify-center p-4 rounded-lg bg-m8bs-card/80 hover:bg-m8bs-card-alt transition-all duration-300 shadow-md"
            >
              {item.icon && <div className={cn("mb-3 p-2 rounded-full bg-m8bs-card", item.color)}>{item.icon}</div>}
              <div className="text-2xl font-bold text-white">
                {typeof item.value === "number" ? item.value.toLocaleString() : item.value}
              </div>
              <div className="text-xs text-gray-400 text-center mt-2">{item.label}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
