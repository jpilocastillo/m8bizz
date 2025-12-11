"use client"

import { Button } from "@/components/ui/button"
import { Download, FileSpreadsheet } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { AdvisorBasecampData } from "@/lib/advisor-basecamp"

interface CSVExportProps {
  data: AdvisorBasecampData
  profile: any
}

export function CSVExport({ data, profile }: CSVExportProps) {
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
      csvData.push(['Advisor Basecamp Report', `Generated: ${new Date().toLocaleDateString()}`])
      csvData.push(['Advisor:', `${profile?.first_name || ''} ${profile?.last_name || ''}`])
      csvData.push([])
      
      // Business Goals
      if (data.businessGoals) {
        csvData.push(['BUSINESS GOALS'])
        csvData.push(['Business Goal', formatCurrency(data.businessGoals.business_goal || 0)])
        csvData.push(['AUM Goal %', `${data.businessGoals.aum_goal_percentage || 0}%`])
        csvData.push(['Annuity Goal %', `${data.businessGoals.annuity_goal_percentage || 0}%`])
        csvData.push(['Life Target Goal %', `${data.businessGoals.life_target_goal_percentage || 0}%`])
        csvData.push([])
      }
      
      // Current Values
      if (data.currentValues) {
        csvData.push(['CURRENT VALUES'])
        csvData.push(['Current AUM', formatCurrency(data.currentValues.current_aum || 0)])
        csvData.push(['Current Annuity', formatCurrency(data.currentValues.current_annuity || 0)])
        csvData.push(['Life Insurance Cash Value', formatCurrency(data.currentValues.life_insurance_cash_value || 0)])
        csvData.push([])
      }
      
      // Client Metrics
      if (data.clientMetrics) {
        csvData.push(['CLIENT METRICS'])
        csvData.push(['Average Annuity Size', formatCurrency(data.clientMetrics.avg_annuity_size || 0)])
        csvData.push(['Average AUM Size', formatCurrency(data.clientMetrics.avg_aum_size || 0)])
        csvData.push(['Average Net Worth Needed', formatCurrency(data.clientMetrics.avg_net_worth_needed || 0)])
        csvData.push(['Appointment Attrition', `${data.clientMetrics.appointment_attrition || 0}%`])
        csvData.push(['Average Close Ratio', `${data.clientMetrics.avg_close_ratio || 0}%`])
        csvData.push(['Annuity Closed', formatNumber(data.clientMetrics.annuity_closed || 0)])
        csvData.push(['AUM Accounts', formatNumber(data.clientMetrics.aum_accounts || 0)])
        csvData.push(['Monthly Ideal Prospects', formatNumber(data.clientMetrics.monthly_ideal_prospects || 0)])
        csvData.push(['Appointments Per Campaign', formatNumber(data.clientMetrics.appointments_per_campaign || 0)])
        csvData.push([])
      }
      
      // Commission Rates
      if (data.commissionRates) {
        csvData.push(['COMMISSION RATES'])
        csvData.push(['Average Planning Fee Rate', formatCurrency(data.commissionRates.planning_fee_rate || 0)])
        csvData.push(['Annuity Commission', `${data.commissionRates.annuity_commission || 0}%`])
        csvData.push(['AUM Commission', `${data.commissionRates.aum_commission || 0}%`])
        csvData.push(['Life Commission', `${data.commissionRates.life_commission || 0}%`])
        csvData.push(['Trail Income %', `${data.commissionRates.trail_income_percentage || 0}%`])
        csvData.push([])
      }
      
      // Financial Book
      if (data.financialBook) {
        csvData.push(['FINANCIAL BOOK'])
        csvData.push(['Annuity Book Value', formatCurrency(data.financialBook.annuity_book_value || 0)])
        csvData.push(['AUM Book Value', formatCurrency(data.financialBook.aum_book_value || 0)])
        csvData.push(['Qualified Money Value', formatCurrency(data.financialBook.qualified_money_value || 0)])
        csvData.push([])
      }
      
      // Campaigns
      if (data.campaigns && data.campaigns.length > 0) {
        csvData.push(['MARKETING CAMPAIGNS'])
        csvData.push(['Campaign Name', 'Marketing Costs', 'Number of Events', 'Leads Generated', 'Status', 'Food Costs'])
        data.campaigns.forEach(campaign => {
          csvData.push([
            campaign.campaign_name || '',
            formatCurrency(campaign.marketing_costs || 0),
            formatNumber(campaign.number_of_events || 0),
            formatNumber(campaign.leads_generated || 0),
            campaign.status || '',
            formatCurrency(campaign.food_costs || 0)
          ])
        })
        csvData.push([])
      }
      
      // Monthly Data Entries
      if (data.monthlyDataEntries && data.monthlyDataEntries.length > 0) {
        csvData.push(['MONTHLY DATA ENTRIES'])
        csvData.push(['Month/Year', 'New Clients', 'New Appointments', 'New Leads', 'Annuity Sales', 'AUM Sales', 'Life Sales', 'Marketing Expenses', 'Notes'])
        data.monthlyDataEntries.forEach(entry => {
          csvData.push([
            entry.month_year || '',
            formatNumber(entry.new_clients || 0),
            formatNumber(entry.new_appointments || 0),
            formatNumber(entry.new_leads || 0),
            formatCurrency(entry.annuity_sales || 0),
            formatCurrency(entry.aum_sales || 0),
            formatCurrency(entry.life_sales || 0),
            formatCurrency(entry.marketing_expenses || 0),
            entry.notes || ''
          ])
        })
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
      link.setAttribute('download', `advisor-basecamp-${profile?.first_name || 'report'}-${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      toast({
        title: "CSV Export Successful",
        description: "Your advisor basecamp data has been exported as a CSV file.",
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
    <Button
      onClick={generateCSV}
      variant="outline"
      className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
    >
      <FileSpreadsheet className="h-4 w-4 mr-2" />
      Export CSV
    </Button>
  )
}
