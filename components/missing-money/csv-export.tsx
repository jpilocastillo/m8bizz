"use client"

import { Button } from '@/components/ui/button'
import { MissingMoneyData } from '@/app/tools/missing-money/page'
import { Download } from 'lucide-react'

interface CSVExportProps {
  data: MissingMoneyData
  profile?: any
}

export function CSVExport({ data, profile }: CSVExportProps) {
  const handleExport = () => {
    try {
      const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(value)
      }

      const calculateDifference = (center: any) => {
        return center.proposed - center.current
      }

      const currentTotal = data.costCenters.reduce((sum, center) => sum + center.current, 0)
      const proposedTotal = data.costCenters.reduce((sum, center) => sum + center.proposed, 0)
      const totalDifference = proposedTotal - currentTotal

      // Create CSV content
      const csvContent = [
        // Header
        ['Missing Money Report - ${profile?.company || "Your Firm"}'],
        ['Generated on', new Date().toLocaleDateString()],
        [''],
        // Summary
        ['SUMMARY'],
        ['1 Year Missing Money', formatCurrency(totalDifference)],
        ['5 Years Missing Money', formatCurrency(totalDifference * 5)],
        ['10 Years Missing Money', formatCurrency(totalDifference * 10)],
        [''],
        // Cost Analysis Table
        ['COST ANALYSIS'],
        ['Cost Center', 'Current Numbers', 'Proposed Numbers', '1 Year Difference', '5 Year Difference', '10 Year Difference'],
        // Data rows
        ...data.costCenters.map(center => {
          const difference = calculateDifference(center)
          return [
            center.name,
            formatCurrency(center.current),
            formatCurrency(center.proposed),
            formatCurrency(difference),
            formatCurrency(difference * 5),
            formatCurrency(difference * 10)
          ]
        }),
        // Total row
        [
          'TOTAL',
          formatCurrency(currentTotal),
          formatCurrency(proposedTotal),
          formatCurrency(totalDifference),
          formatCurrency(totalDifference * 5),
          formatCurrency(totalDifference * 10)
        ]
      ]

      // Convert to CSV string
      const csvString = csvContent.map(row => 
        row.map(cell => `"${cell}"`).join(',')
      ).join('\n')

      // Create and download file
      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `missing-money-report-${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('Error generating CSV:', error)
      alert('Error generating CSV. Please try again.')
    }
  }

  return (
    <Button onClick={handleExport} variant="outline" className="flex items-center gap-2">
      <Download className="h-4 w-4" />
      Export CSV
    </Button>
  )
}
