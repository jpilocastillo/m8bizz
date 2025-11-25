"use client"

import { Button } from '@/components/ui/button'
import { type MonthlyScorecardData } from '@/lib/behavior-scorecard'
import { FileText } from 'lucide-react'

interface PDFExportProps {
  data: MonthlyScorecardData
  profile?: any
}

export function PDFExport({ data, profile }: PDFExportProps) {
  const handleExport = async () => {
    try {
      // Create a new window with the report content
      const printWindow = window.open('', '_blank')
      if (!printWindow) return

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

      const getGradeColor = (grade: string) => {
        switch (grade) {
          case 'A': return '#10b981'
          case 'B': return '#3b82f6'
          case 'C': return '#eab308'
          case 'D': return '#f97316'
          case 'F': return '#ef4444'
          default: return '#6b7280'
        }
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

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Business Behavior Scorecard - ${profile?.company || "Your Firm"}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 20px;
              background: white;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 2px solid #f3f4f6;
              padding-bottom: 20px;
            }
            .header h1 {
              color: #1f2937;
              margin: 0;
              font-size: 28px;
            }
            .header p {
              color: #6b7280;
              margin: 5px 0 0 0;
              font-size: 16px;
            }
            .company-summary {
              background: #f9fafb;
              padding: 20px;
              border-radius: 8px;
              margin-bottom: 30px;
              border: 2px solid #e5e7eb;
              text-align: center;
            }
            .company-summary h2 {
              margin: 0 0 10px 0;
              color: #374151;
              font-size: 20px;
            }
            .company-grade {
              font-size: 48px;
              font-weight: bold;
              margin: 10px 0;
            }
            .company-average {
              color: #6b7280;
              font-size: 16px;
            }
            .role-section {
              margin-bottom: 40px;
              page-break-inside: avoid;
            }
            .role-header {
              background: #f3f4f6;
              padding: 15px;
              border-radius: 8px 8px 0 0;
              border: 1px solid #d1d5db;
              border-bottom: none;
            }
            .role-header h3 {
              margin: 0;
              color: #1f2937;
              font-size: 18px;
            }
            .role-grade {
              display: inline-block;
              padding: 4px 12px;
              border-radius: 4px;
              font-weight: bold;
              margin-left: 10px;
            }
            .table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
            }
            .table th {
              background: #f3f4f6;
              padding: 12px;
              text-align: left;
              font-weight: bold;
              color: #374151;
              border: 1px solid #d1d5db;
            }
            .table td {
              padding: 12px;
              border: 1px solid #d1d5db;
            }
            .table .number {
              text-align: right;
            }
            .grade-badge {
              display: inline-block;
              padding: 4px 8px;
              border-radius: 4px;
              font-weight: bold;
              font-size: 12px;
            }
            .average-row {
              background: #f9fafb;
              font-weight: bold;
            }
            .role-summary {
              background: #f9fafb;
              padding: 15px;
              border-radius: 0 0 8px 8px;
              border: 1px solid #d1d5db;
              border-top: none;
              text-align: right;
            }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
              .role-section { page-break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>BUSINESS BEHAVIOR SCORECARD</h1>
            <p>Presented by ${profile?.company || "Your Firm"}</p>
            <p>Period: ${periodLabel}</p>
          </div>

          <div class="company-summary">
            <h2>Company Summary</h2>
            <div class="company-grade" style="color: ${getGradeColor(data.companySummary.companyGrade)}">
              ${data.companySummary.companyGrade}
            </div>
            <div class="company-average">
              Company Average: ${data.companySummary.companyAverage.toFixed(1)}%
            </div>
          </div>

          ${data.roleScorecards.map(roleScorecard => `
            <div class="role-section">
              <div class="role-header">
                <h3>
                  ${roleScorecard.roleName}
                  <span class="role-grade" style="background-color: ${getGradeColor(roleScorecard.averageGrade)}20; color: ${getGradeColor(roleScorecard.averageGrade)}; border: 1px solid ${getGradeColor(roleScorecard.averageGrade)}50;">
                    ${roleScorecard.averageGrade}
                  </span>
                </h3>
              </div>
              <table class="table">
                <thead>
                  <tr>
                    <th>Monthly Statistics</th>
                    <th class="number">Goal</th>
                    <th class="number">Actual</th>
                    <th class="number">% of Goal</th>
                    <th class="number">Grade</th>
                  </tr>
                </thead>
                <tbody>
                  ${roleScorecard.metrics.map(metric => `
                    <tr>
                      <td>${metric.metricName}</td>
                      <td class="number">${formatValue(metric.goalValue, 'count')}</td>
                      <td class="number">${formatValue(metric.actualValue, 'count')}</td>
                      <td class="number">${metric.percentageOfGoal.toFixed(1)}%</td>
                      <td class="number">
                        <span class="grade-badge" style="background-color: ${getGradeColor(metric.grade)}20; color: ${getGradeColor(metric.grade)}; border: 1px solid ${getGradeColor(metric.grade)}50;">
                          ${metric.grade}
                        </span>
                      </td>
                    </tr>
                  `).join('')}
                  <tr class="average-row">
                    <td><strong>Average Grade</strong></td>
                    <td class="number"></td>
                    <td class="number"></td>
                    <td class="number"><strong>${roleScorecard.averageGradePercentage.toFixed(1)}%</strong></td>
                    <td class="number">
                      <span class="grade-badge" style="background-color: ${getGradeColor(roleScorecard.averageGrade)}20; color: ${getGradeColor(roleScorecard.averageGrade)}; border: 1px solid ${getGradeColor(roleScorecard.averageGrade)}50;">
                        ${roleScorecard.averageGrade}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          `).join('')}

          <div style="margin-top: 40px; text-align: center; color: #6b7280; font-size: 12px;">
            Generated on ${new Date().toLocaleDateString()} by M8 Business Suite
          </div>
        </body>
        </html>
      `

      printWindow.document.write(htmlContent)
      printWindow.document.close()
      
      // Wait for content to load, then print
      printWindow.onload = () => {
        printWindow.print()
      }
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Error generating PDF. Please try again.')
    }
  }

  return (
    <Button onClick={handleExport} variant="outline" className="flex items-center gap-2">
      <FileText className="h-4 w-4" />
      Export PDF
    </Button>
  )
}

