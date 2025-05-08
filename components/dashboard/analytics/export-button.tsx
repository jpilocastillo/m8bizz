"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Download, FileSpreadsheet, FileIcon as FilePdf, Loader2 } from "lucide-react"

interface ExportButtonProps {
  data?: any
}

export function ExportButton({ data }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false)
  const [exportType, setExportType] = useState<string | null>(null)

  const handleExport = async (type: string) => {
    setIsExporting(true)
    setExportType(type)

    try {
      // Simulate export delay
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // In a real implementation, you would generate and download the file here
      console.log(`Exporting ${type} with data:`, data)

      // Create a sample CSV or PDF download
      if (type === "csv") {
        downloadCSV()
      } else if (type === "pdf") {
        alert("PDF export would be generated here")
      }
    } catch (error) {
      console.error("Export failed:", error)
    } finally {
      setIsExporting(false)
      setExportType(null)
    }
  }

  const downloadCSV = () => {
    // Simple CSV generation example
    if (!data) return

    const events = data.events || []
    const headers = ["Event Name", "Date", "Location", "Attendees", "Revenue", "ROI"]

    const csvContent = [
      headers.join(","),
      ...events.map((event: any) =>
        [
          `"${event.name || "Unnamed Event"}"`,
          `"${event.date || ""}"`,
          `"${event.location || ""}"`,
          event.attendees || 0,
          event.revenue || 0,
          `${(event.roi || 0).toFixed(1)}%`,
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", "marketing_events_analytics.csv")
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="bg-[#131525] border-[#1f2037] text-white hover:bg-[#1f2037] hover:text-white"
          disabled={isExporting}
        >
          {isExporting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Exporting {exportType}...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Export
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-[#131525] border-[#1f2037] text-white">
        <DropdownMenuItem onClick={() => handleExport("csv")} className="cursor-pointer hover:bg-[#1f2037]">
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport("pdf")} className="cursor-pointer hover:bg-[#1f2037]">
          <FilePdf className="mr-2 h-4 w-4" />
          Export as PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
