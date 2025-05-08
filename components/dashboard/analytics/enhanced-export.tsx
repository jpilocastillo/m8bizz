"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Download, FileSpreadsheet, FileText, Loader2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface EnhancedExportProps {
  data: any
}

export function EnhancedExport({ data }: EnhancedExportProps) {
  const [isExporting, setIsExporting] = useState(false)

  // Function to export data as CSV
  const exportAsCSV = () => {
    setIsExporting(true)

    try {
      // Process events data for export
      const events = data.events.map((event) => ({
        Name: event.name,
        Date: new Date(event.date).toLocaleDateString(),
        Location: event.location,
        Type: event.type,
        Attendees: event.attendees,
        Clients: event.clients,
        Revenue: event.revenue,
        Expenses: event.expenses,
        Profit: event.profit,
        ROI: `${event.roi.toFixed(1)}%`,
      }))

      // Convert to CSV
      const headers = Object.keys(events[0]).join(",")
      const rows = events.map((event) => Object.values(event).join(","))
      const csv = [headers, ...rows].join("\n")

      // Create download link
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.setAttribute("href", url)
      link.setAttribute("download", `marketing_events_${new Date().toISOString().split("T")[0]}.csv`)
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error("Error exporting data:", error)
    } finally {
      setIsExporting(false)
    }
  }

  // Function to export data as JSON
  const exportAsJSON = () => {
    setIsExporting(true)

    try {
      const exportData = {
        summary: data.summary,
        events: data.events,
        exportDate: new Date().toISOString(),
      }

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.setAttribute("href", url)
      link.setAttribute("download", `marketing_analytics_${new Date().toISOString().split("T")[0]}.json`)
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error("Error exporting data:", error)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="bg-[#1f2037] border-[#1f2037] text-white hover:bg-[#2a2b47]"
          disabled={isExporting}
        >
          {isExporting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Export Data
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-[#131525] border-[#1f2037] text-white">
        <DropdownMenuItem onClick={exportAsCSV} className="cursor-pointer hover:bg-[#1f2037]">
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportAsJSON} className="cursor-pointer hover:bg-[#1f2037]">
          <FileText className="mr-2 h-4 w-4" />
          Export as JSON
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
