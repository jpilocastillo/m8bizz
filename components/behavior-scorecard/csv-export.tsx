"use client"

import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import { type MonthlyScorecardData } from '@/lib/behavior-scorecard'

interface CSVExportProps {
  data: MonthlyScorecardData
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

      const formatValue = (value: number, metricType: string) => {
        if (metricType === 'currency') {
          return formatCurrency(value)
        }
        if (metricType === 'percentage') {
          return `${value}%`
        }
        if (metricType === 'time') {
          return `${value} days`
        }
        if (metricType === 'rating_1_5' || metricType === 'rating_scale') {
          return value.toFixed(1)
        }
        return value.toString()
      }

      const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ]

      const quarterNames = ['Q1 (Jan-Mar)', 'Q2 (Apr-Jun)', 'Q3 (Jul-Sep)', 'Q4 (Oct-Dec)']

      let periodLabel = ''
      if (data.periodType === 'month' && data.month) {
        periodLabel = `${monthNames[data.month - 1]} ${data.year}`
      } else if (data.periodType === 'quarter' && data.quarter) {
        periodLabel = `${quarterNames[data.quarter - 1]} ${data.year}`
      } else {
        periodLabel = `Year ${data.year}`
      }

      const csvContent = [
        // Header
        [`Business Behavior Scorecard - ${profile?.company || "Your Firm"}`],
        [`Generated on ${new Date().toLocaleDateString()}`],
        [`Period: ${periodLabel}`],
        [''],
        // Company Summary
        ['COMPANY SUMMARY'],
        ['Company Average', `${data.companySummary.companyAverage.toFixed(1)}%`],
        ['Company Grade', data.companySummary.companyGrade],
        [''],
        // Role Scorecards
        ...data.roleScorecards.flatMap(roleScorecard => [
          [''],
          [`${roleScorecard.roleName.toUpperCase()} SCORECARD`],
          ['Monthly Statistics', 'Goal', 'Actual', '% of Goal', 'Grade'],
          ...roleScorecard.metrics.map(metric => [
            metric.metricName,
            formatValue(metric.goalValue, 'count'),
            formatValue(metric.actualValue, 'count'),
            `${metric.percentageOfGoal.toFixed(1)}%`,
            metric.grade,
          ]),
          ['Average Grade', '', '', `${roleScorecard.averageGradePercentage.toFixed(1)}%`, roleScorecard.averageGrade],
        ]),
      ]

      // Convert to CSV string
      const csvString = csvContent.map(row => 
        row.map(cell => `"${cell}"`).join(',')
      ).join('\n')

      // Create and download file
      let filename = `behavior-scorecard-${data.year}`
      if (data.periodType === 'month' && data.month) {
        filename += `-${String(data.month).padStart(2, '0')}`
      } else if (data.periodType === 'quarter' && data.quarter) {
        filename += `-Q${data.quarter}`
      } else {
        filename += '-year'
      }
      
      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `${filename}.csv`)
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

