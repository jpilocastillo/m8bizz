import type React from "react"
import { cn } from "@/lib/utils"

interface Column {
  key: string
  header: string
  cell?: (row: any) => React.ReactNode
  className?: string
}

interface DataTableProps {
  data: any[]
  columns: Column[]
  className?: string
  rowClassName?: string
  headerClassName?: string
  cellClassName?: string
  emptyMessage?: string
}

export function DataTable({
  data,
  columns,
  className,
  rowClassName,
  headerClassName,
  cellClassName,
  emptyMessage = "No data available",
}: DataTableProps) {
  return (
    <div className={cn("w-full overflow-auto", className)}>
      <table className="w-full border-collapse">
        <thead>
          <tr className={cn("border-b border-[#1f2037]", headerClassName)}>
            {columns.map((column) => (
              <th
                key={column.key}
                className={cn(
                  "px-4 py-3 text-left text-sm font-semibold text-gray-300 bg-[#0f1029]/30",
                  column.className,
                )}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className={cn(
                  "border-b border-[#1f2037] hover:bg-[#1f2037]/30 transition-colors",
                  rowIndex % 2 === 0 ? "bg-[#131525]/50" : "bg-[#131525]",
                  rowClassName,
                )}
              >
                {columns.map((column) => (
                  <td
                    key={`${rowIndex}-${column.key}`}
                    className={cn("px-4 py-3 text-sm text-gray-200", cellClassName, column.className)}
                  >
                    {column.cell ? column.cell(row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="px-4 py-6 text-center text-sm text-gray-400">
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
