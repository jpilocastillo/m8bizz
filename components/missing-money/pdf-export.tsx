"use client"

import { Button } from '@/components/ui/button'
import { MissingMoneyData } from '@/app/tools/missing-money/page'
import { FileText, Download } from 'lucide-react'

interface PDFExportProps {
  data: MissingMoneyData
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

      const calculateDifference = (center: any) => {
        return center.proposed - center.current
      }

      const currentTotal = data.costCenters.reduce((sum, center) => sum + center.current, 0)
      const proposedTotal = data.costCenters.reduce((sum, center) => sum + center.proposed, 0)
      const totalDifference = proposedTotal - currentTotal

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Missing Money Report - ${profile?.company || "Your Firm"}</title>
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
            .summary {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 20px;
              margin-bottom: 30px;
            }
            .summary-card {
              background: #f9fafb;
              padding: 20px;
              border-radius: 8px;
              text-align: center;
              border: 1px solid #e5e7eb;
            }
            .summary-card h3 {
              margin: 0 0 10px 0;
              color: #374151;
              font-size: 14px;
            }
            .summary-card .value {
              font-size: 24px;
              font-weight: bold;
              color: #1f2937;
            }
            .table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 30px;
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
            .positive {
              color: #059669;
              font-weight: bold;
            }
            .negative {
              color: #dc2626;
              font-weight: bold;
            }
            .total-row {
              background: #f9fafb;
              font-weight: bold;
            }
            .color-indicator {
              display: inline-block;
              width: 12px;
              height: 12px;
              border-radius: 50%;
              margin-right: 8px;
            }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>MISSING MONEY REPORT</h1>
            <p>Presented by ${profile?.company || "Your Firm"}</p>
          </div>

          <div class="summary">
            <div class="summary-card">
              <h3>1 Year Missing Money</h3>
              <div class="value ${totalDifference >= 0 ? 'positive' : 'negative'}">
                ${formatCurrency(totalDifference)}
              </div>
            </div>
            <div class="summary-card">
              <h3>5 Years Missing Money</h3>
              <div class="value ${totalDifference * 5 >= 0 ? 'positive' : 'negative'}">
                ${formatCurrency(totalDifference * 5)}
              </div>
            </div>
            <div class="summary-card">
              <h3>10 Years Missing Money</h3>
              <div class="value ${totalDifference * 10 >= 0 ? 'positive' : 'negative'}">
                ${formatCurrency(totalDifference * 10)}
              </div>
            </div>
          </div>

          <h2>COST ANALYSIS</h2>
          <table class="table">
            <thead>
              <tr>
                <th>Cost Center</th>
                <th class="number">Current Numbers</th>
                <th class="number">Proposed Numbers</th>
                <th class="number">1 Year Difference</th>
                <th class="number">5 Year Difference</th>
                <th class="number">10 Year Difference</th>
              </tr>
            </thead>
            <tbody>
              ${data.costCenters.map(center => {
                const difference = calculateDifference(center)
                return `
                  <tr>
                    <td>
                      <span class="color-indicator" style="background-color: ${center.color}"></span>
                      ${center.name}
                    </td>
                    <td class="number">${formatCurrency(center.current)}</td>
                    <td class="number">${formatCurrency(center.proposed)}</td>
                    <td class="number ${difference >= 0 ? 'positive' : 'negative'}">
                      ${formatCurrency(difference)}
                    </td>
                    <td class="number ${difference * 5 >= 0 ? 'positive' : 'negative'}">
                      ${formatCurrency(difference * 5)}
                    </td>
                    <td class="number ${difference * 10 >= 0 ? 'positive' : 'negative'}">
                      ${formatCurrency(difference * 10)}
                    </td>
                  </tr>
                `
              }).join('')}
              <tr class="total-row">
                <td><strong>Total</strong></td>
                <td class="number"><strong>${formatCurrency(currentTotal)}</strong></td>
                <td class="number"><strong>${formatCurrency(proposedTotal)}</strong></td>
                <td class="number ${totalDifference >= 0 ? 'positive' : 'negative'}">
                  <strong>${formatCurrency(totalDifference)}</strong>
                </td>
                <td class="number ${totalDifference * 5 >= 0 ? 'positive' : 'negative'}">
                  <strong>${formatCurrency(totalDifference * 5)}</strong>
                </td>
                <td class="number ${totalDifference * 10 >= 0 ? 'positive' : 'negative'}">
                  <strong>${formatCurrency(totalDifference * 10)}</strong>
                </td>
              </tr>
            </tbody>
          </table>

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
