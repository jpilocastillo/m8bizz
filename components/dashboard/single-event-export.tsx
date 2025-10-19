"use client"

import { Button } from "@/components/ui/button"
import { Download, FileText, FileSpreadsheet } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { DashboardData } from "./dashboard-content"

interface SingleEventExportProps {
  data: DashboardData
  eventName: string
}

export function SingleEventExport({ data, eventName }: SingleEventExportProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US').format(value)
  }

  const generateCSV = () => {
    try {
      const csvData = []
      
      // Header
      csvData.push(['Single Event Marketing Dashboard Report', `Generated: ${new Date().toLocaleDateString()}`])
      csvData.push(['Event:', eventName])
      csvData.push([])
      
      // Event Details
      csvData.push(['EVENT DETAILS'])
      csvData.push(['Event Name', eventName])
      csvData.push(['Date', data.eventDetails?.date || 'N/A'])
      csvData.push(['Location', data.eventDetails?.location || 'N/A'])
      csvData.push(['Marketing Type', data.eventDetails?.marketing_type || 'N/A'])
      csvData.push(['Topic', data.eventDetails?.topic || 'N/A'])
      csvData.push(['Age Range', data.eventDetails?.age_range || 'N/A'])
      csvData.push(['Mile Radius', data.eventDetails?.mile_radius || 'N/A'])
      csvData.push(['Income Assets', data.eventDetails?.income_assets || 'N/A'])
      csvData.push(['Time', data.eventDetails?.time || 'N/A'])
      csvData.push(['Marketing Audience', formatNumber(data.eventDetails?.marketing_audience || 0)])
      csvData.push([])
      
      // Financial Metrics
      csvData.push(['FINANCIAL METRICS'])
      csvData.push(['ROI', `${data.roi?.value || 0}%`])
      csvData.push(['Written Business', formatCurrency(data.writtenBusiness || 0)])
      csvData.push(['Total Income', formatCurrency(data.income?.total || 0)])
      csvData.push(['Marketing Expenses', formatCurrency(data.marketingExpenses?.total || 0)])
      csvData.push(['Profit', formatCurrency((data.income?.total || 0) - (data.marketingExpenses?.total || 0))])
      csvData.push([])
      
      // Income Breakdown
      if (data.income?.breakdown) {
        csvData.push(['INCOME BREAKDOWN'])
        csvData.push(['Fixed Annuity', formatCurrency(data.income.breakdown.fixedAnnuity || 0)])
        csvData.push(['Life Insurance', formatCurrency(data.income.breakdown.life || 0)])
        csvData.push(['AUM', formatCurrency(data.income.breakdown.aum || 0)])
        csvData.push(['Financial Planning', formatCurrency(data.income.breakdown.financialPlanning || 0)])
        csvData.push(['AUM Fees', formatCurrency(data.income.breakdown.aumFees || 0)])
        csvData.push([])
      }
      
      // Marketing Expenses Breakdown
      if (data.marketingExpenses) {
        csvData.push(['MARKETING EXPENSES BREAKDOWN'])
        csvData.push(['Advertising', formatCurrency(data.marketingExpenses.advertising || 0)])
        csvData.push(['Food & Venue', formatCurrency(data.marketingExpenses.foodVenue || 0)])
        csvData.push(['Other', formatCurrency(data.marketingExpenses.other || 0)])
        csvData.push(['Total', formatCurrency(data.marketingExpenses.total || 0)])
        csvData.push([])
      }
      
      // Attendance Data
      if (data.attendance) {
        csvData.push(['ATTENDANCE DATA'])
        csvData.push(['Registrant Responses', formatNumber(data.attendance.registrantResponses || 0)])
        csvData.push(['Confirmations', formatNumber(data.attendance.confirmations || 0)])
        csvData.push(['Attendees', formatNumber(data.attendance.attendees || 0)])
        csvData.push(['Clients from Event', formatNumber(data.attendance.clients_from_event || 0)])
        csvData.push(['Plate Lickers', formatNumber(data.attendance.plate_lickers || 0)])
        csvData.push([])
      }
      
      // Conversion Metrics
      csvData.push(['CONVERSION METRICS'])
      csvData.push(['Conversion Rate', `${data.conversionRate?.value || 0}%`])
      csvData.push(['Attendees', formatNumber(data.conversionRate?.attendees || 0)])
      csvData.push(['Clients', formatNumber(data.conversionRate?.clients || 0)])
      csvData.push([])
      
      // Appointments Data
      if (data.appointments) {
        csvData.push(['APPOINTMENTS DATA'])
        csvData.push(['Set at Event', formatNumber(data.appointments.setAtEvent || 0)])
        csvData.push(['Set After Event', formatNumber(data.appointments.setAfterEvent || 0)])
        csvData.push(['First Appointment Attended', formatNumber(data.appointments.firstAppointmentAttended || 0)])
        csvData.push(['First Appointment No Shows', formatNumber(data.appointments.firstAppointmentNoShows || 0)])
        csvData.push(['Second Appointment Attended', formatNumber(data.appointments.secondAppointmentAttended || 0)])
        csvData.push(['Not Qualified', formatNumber(data.appointments.notQualified || 0)])
        csvData.push([])
      }
      
      // Financial Production
      if (data.financialProduction) {
        csvData.push(['FINANCIAL PRODUCTION'])
        csvData.push(['Annuity Premium', formatCurrency(data.financialProduction.annuity_premium || 0)])
        csvData.push(['Life Insurance Premium', formatCurrency(data.financialProduction.life_insurance_premium || 0)])
        csvData.push(['AUM', formatCurrency(data.financialProduction.aum || 0)])
        csvData.push(['Financial Planning', formatCurrency(data.financialProduction.financial_planning || 0)])
        csvData.push(['Annuities Sold', formatNumber(data.financialProduction.annuities_sold || 0)])
        csvData.push(['Life Policies Sold', formatNumber(data.financialProduction.life_policies_sold || 0)])
        csvData.push(['Annuity Commission', formatCurrency(data.financialProduction.annuity_commission || 0)])
        csvData.push(['Life Insurance Commission', formatCurrency(data.financialProduction.life_insurance_commission || 0)])
        csvData.push(['AUM Fees', formatCurrency(data.financialProduction.aum_fees || 0)])
        csvData.push(['AUM Accounts Opened', formatNumber(data.financialProduction.aum_accounts_opened || 0)])
      }
      
      // Convert to CSV string
      const csvString = csvData.map(row => 
        row.map(cell => `"${cell}"`).join(',')
      ).join('\n')
      
      // Create and download file
      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `single-event-report-${eventName.replace(/[^a-zA-Z0-9]/g, '-')}-${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      toast({
        title: "CSV Export Successful",
        description: "Your single event data has been exported as a CSV file.",
      })
      
    } catch (error) {
      console.error('Error generating CSV:', error)
      toast({
        title: "CSV Export Failed",
        description: "There was an error generating your CSV file. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        onClick={generateCSV}
        variant="outline"
        size="sm"
        className="border-m8bs-border text-m8bs-muted hover:bg-m8bs-card-alt hover:text-white"
      >
        <FileSpreadsheet className="h-4 w-4 mr-2" />
        Export CSV
      </Button>
    </div>
  )
}
