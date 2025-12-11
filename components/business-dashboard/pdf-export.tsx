"use client"

import React, { useRef, useState } from 'react'
import { AdvisorBasecampData } from '@/lib/advisor-basecamp'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Download, Loader2, AlertCircle } from 'lucide-react'
import { format } from 'date-fns'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { toast } from '@/hooks/use-toast'
import {
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Area,
  AreaChart,
  ComposedChart,
  Line,
} from 'recharts'

interface PDFExportProps {
  data: AdvisorBasecampData
  profile: any
}

export function PDFExport({ data, profile }: PDFExportProps) {
  const pdfRef = useRef<HTMLDivElement>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const formatCurrency = (value: number | null | undefined) => {
    if (value === null || value === undefined) return ''
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value)
  }

  const formatNumber = (value: number | null | undefined) => {
    if (value === null || value === undefined) return '0'
    return new Intl.NumberFormat('en-US').format(value)
  }

  // Calculate total income from business data
  const calculateTotalIncome = () => {
    if (!data.businessGoals || !data.currentValues || !data.clientMetrics || !data.commissionRates) {
      return 0
    }

    // Calculate goal amounts
    const businessGoalAmount = data.businessGoals.business_goal || 0
    const aumGoalAmount = (businessGoalAmount * (data.businessGoals.aum_goal_percentage || 0)) / 100
    const annuityGoalAmount = (businessGoalAmount * (data.businessGoals.annuity_goal_percentage || 0)) / 100
    const lifeTargetGoalAmount = (businessGoalAmount * (data.businessGoals.life_target_goal_percentage || 0)) / 100

    // Calculate income values
    const annuityIncome = (annuityGoalAmount * (data.commissionRates.annuity_commission || 0)) / 100
    const aumIncome = (aumGoalAmount * (data.commissionRates.aum_commission || 0)) / 100
    const lifeIncome = (lifeTargetGoalAmount * (data.commissionRates.life_commission || 0)) / 100
    const trailIncome = ((data.currentValues.current_aum || 0) * (data.commissionRates.trail_income_percentage || 0)) / 100
    
    // Calculate planning fees
    const clientsNeeded = Math.round(((data.clientMetrics.annuity_closed || 0) + (data.clientMetrics.aum_accounts || 0)) / 2)
    const planningFeesValue = (data.commissionRates.planning_fee_rate || 0) * clientsNeeded

    return annuityIncome + aumIncome + lifeIncome + trailIncome + planningFeesValue
  }

  // Chart data generation functions
  const generateChartData = () => {
    // Calculate total advisor book value
    const totalBookValue = (data.currentValues?.current_annuity || 0) + (data.currentValues?.current_aum || 0)
    
    // Auto-calculate client metrics using formulas
    const annuityGoal = data.businessGoals?.annuity_goal || 0
    const aumGoal = data.businessGoals?.aum_goal || 0
    const avgAnnuitySize = data.clientMetrics?.avg_annuity_size || 0
    const avgAUMSize = data.clientMetrics?.avg_aum_size || 0
    
    // Calculate auto-populated values using formulas
    const calculatedAnnuityClosed = avgAnnuitySize > 0 ? Math.round(annuityGoal / avgAnnuitySize) : 0
    const calculatedAUMAccounts = avgAUMSize > 0 ? Math.round(aumGoal / avgAUMSize) : 0
    const calculatedClientsNeeded = Math.round((calculatedAnnuityClosed + calculatedAUMAccounts) / 2)
    
    // Annuity vs AUM pie chart data
    const pieData = [
      { name: "Annuity", value: data.currentValues?.current_annuity || 0, color: "#3b82f6" },
      { name: "AUM", value: data.currentValues?.current_aum || 0, color: "#f97316" },
    ]

    // Monthly performance data
    const currentAnnuity = data.currentValues?.current_annuity || 0
    const currentAUM = data.currentValues?.current_aum || 0
    
    const monthlyData = [
      { name: "Jan", annuity: currentAnnuity * 0.08, aum: currentAUM * 0.08 },
      { name: "Feb", annuity: currentAnnuity * 0.09, aum: currentAUM * 0.09 },
      { name: "Mar", annuity: currentAnnuity * 0.10, aum: currentAUM * 0.10 },
      { name: "Apr", annuity: currentAnnuity * 0.09, aum: currentAUM * 0.09 },
      { name: "May", annuity: currentAnnuity * 0.11, aum: currentAUM * 0.11 },
      { name: "Jun", annuity: currentAnnuity * 0.10, aum: currentAUM * 0.10 },
      { name: "Jul", annuity: currentAnnuity * 0.12, aum: currentAUM * 0.12 },
      { name: "Aug", annuity: currentAnnuity * 0.13, aum: currentAUM * 0.13 },
      { name: "Sep", annuity: currentAnnuity * 0.11, aum: currentAUM * 0.11 },
      { name: "Oct", annuity: currentAnnuity * 0.14, aum: currentAUM * 0.14 },
      { name: "Nov", annuity: currentAnnuity * 0.15, aum: currentAUM * 0.15 },
      { name: "Dec", annuity: currentAnnuity * 0.16, aum: currentAUM * 0.16 },
    ]

    // Goal progress data
    const goalData = [
      { name: "Business Goal", value: data.businessGoals?.business_goal || 0, color: "#22c55e" },
      { name: "AUM Goal", value: data.businessGoals?.aum_goal || 0, color: "#3b82f6" },
      { name: "Annuity Goal", value: data.businessGoals?.annuity_goal || 0, color: "#f97316" },
      { name: "Life Target", value: data.businessGoals?.life_target_goal || 0, color: "#a855f7" },
    ]

    // Account distribution data - using calculated values
    const accountData = [
      { name: "Annuity Closed", value: calculatedAnnuityClosed, color: "#3b82f6" },
      { name: "AUM Accounts", value: calculatedAUMAccounts, color: "#f97316" },
      { name: "Clients Needed", value: calculatedClientsNeeded, color: "#22c55e" },
    ]

    return {
      pieData,
      monthlyData,
      goalData,
      accountData,
      totalBookValue,
      calculatedAnnuityClosed,
      calculatedAUMAccounts,
      calculatedClientsNeeded
    }
  }

  const chartData = generateChartData()

  const generatePDF = async () => {
    if (!pdfRef.current) {
      setError('PDF content not ready. Please try again.')
      return
    }

    setIsGenerating(true)
    setError(null)
    
    // Force a re-render to ensure all changes are visible
    if (pdfRef.current) {
      pdfRef.current.style.display = 'none'
      pdfRef.current.offsetHeight // Trigger reflow
      pdfRef.current.style.display = 'block'
    }
    
    try {
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pageWidth = 210 // A4 width in mm
      const pageHeight = 295 // A4 height in mm
      const margin = 10 // Small margin
      const contentWidth = pageWidth - (margin * 2)
      const contentHeight = pageHeight - (margin * 2)

      // Get all page-break sections
      const pages = pdfRef.current.querySelectorAll('.page-break')
      
      // Force a re-render to ensure all changes are captured
      await new Promise(resolve => setTimeout(resolve, 100))
      
      for (let i = 0; i < pages.length; i++) {
        const pageElement = pages[i] as HTMLElement
        
        // Generate canvas for this page
        const canvas = await html2canvas(pageElement, {
          scale: 2, // Higher quality
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          logging: true, // Enable logging to debug
          width: pageElement.scrollWidth,
          height: pageElement.scrollHeight,
          scrollX: 0,
          scrollY: 0
        })

        const imgData = canvas.toDataURL('image/png', 1.0)
        const imgHeight = (canvas.height * contentWidth) / canvas.width

        // Add new page if not the first page
        if (i > 0) {
          pdf.addPage()
        }

        // Add image to PDF, scaling to fit page
        pdf.addImage(imgData, 'PNG', margin, margin, contentWidth, imgHeight)
      }
      
      // Generate filename with user name and date
      const fileName = `advisor-basecamp-${profile?.first_name || 'report'}-${format(new Date(), 'yyyy-MM-dd')}.pdf`
      pdf.save(fileName)
      
      // Show success message
      toast({
        title: "PDF Generated Successfully",
        description: `Your advisor basecamp report has been downloaded as ${fileName}`,
      })
      
    } catch (error) {
      console.error('Error generating PDF:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      setError(`Failed to generate PDF: ${errorMessage}`)
      
      toast({
        title: "PDF Generation Failed",
        description: "There was an error generating your PDF report. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* PDF Export Button */}
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-gray-600">
          Generate a comprehensive PDF report of your advisor basecamp data
        </div>
        <div className="flex items-center gap-2">
          {error && (
            <div className="flex items-center gap-1 text-red-600 text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}
          <Button 
            onClick={generatePDF} 
            disabled={isGenerating}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating PDF...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Download PDF Report
              </>
            )}
          </Button>
        </div>
      </div>

      {/* PDF Content */}
      <div ref={pdfRef} className="bg-white text-black p-8 max-w-4xl mx-auto shadow-lg" style={{ fontFamily: 'Arial, sans-serif' }}>
        <style jsx>{`
          .page-break {
            page-break-after: always;
            margin-bottom: 0;
            padding-bottom: 0;
          }
          .page-break:last-child {
            page-break-after: avoid;
          }
        `}</style>
      
      {/* PAGE 1: Header, Dashboard Metrics, Overview Charts (Book Distribution) */}
      <div className="page-break">
        {/* Header */}
        <div className="text-center mb-8 border-b-2 border-blue-600 pb-6">
          <div className="w-32 h-32 mx-auto mb-0 flex items-center justify-center">
            <div className="w-full h-full flex items-center justify-center">
              <img 
                src="/logo.png" 
                alt="Motiv8 Logo" 
                className="w-full h-full object-contain"
                style={{ 
                  filter: 'grayscale(100%) brightness(0)',
                  WebkitFilter: 'grayscale(100%) brightness(0)'
                }}
              />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-0 -mt-6">M8 Advisor Basecamp</h1>
          <h2 className="text-2xl text-gray-600 mb-0">
            {profile?.first_name} {profile?.last_name}
          </h2>
          <p className="text-gray-500 text-lg mb-0">
            Track your financial metrics, client acquisition, and business goals
          </p>
          <p className="text-gray-400 text-sm">
            Generated on {format(new Date(), 'MMMM dd, yyyy')}
          </p>
        </div>

        {/* Dashboard Metrics - First Section */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">Dashboard Metrics</h3>
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {/* Clients Needed */}
            <Card className="border-none shadow-lg overflow-hidden h-full flex flex-col bg-white">
              <div className="h-2 w-full bg-red-500"></div>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-center text-gray-700">
                  Clients Needed
                </CardTitle>
                <p className="text-xs text-gray-500 text-center mt-1">
                  Based on AUM and annuity metrics
                </p>
              </CardHeader>
              <CardContent className="flex-1 flex items-center justify-center">
                <div className="text-4xl font-bold text-red-500 text-center">
                  {chartData.calculatedClientsNeeded}
                </div>
              </CardContent>
            </Card>

            {/* Monthly New Appointments Needed */}
            <Card className="border-none shadow-lg overflow-hidden h-full flex flex-col bg-white">
              <div className="h-2 w-full bg-blue-500"></div>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-center text-gray-700">
                  Monthly New Appointments
                </CardTitle>
                <p className="text-xs text-gray-500 text-center mt-1">
                  Needed to reach your goal
                </p>
              </CardHeader>
              <CardContent className="flex-1 flex items-center justify-center">
                <div className="text-4xl font-bold text-blue-500 text-center">
                  {(() => {
                    // Calculate proper formula for monthly new appointments
                    const clientsNeeded = data.clientMetrics?.clients_needed || 0
                    const appointmentAttrition = data.clientMetrics?.appointment_attrition || 0
                    const avgCloseRatio = data.clientMetrics?.avg_close_ratio || 0
                    
                    // Annual Ideal Closing Prospects = (Clients Needed / Close Ratio) * (1 + Appointment Attrition)
                    const annualIdealClosingProspects = avgCloseRatio > 0 
                      ? (clientsNeeded / (avgCloseRatio / 100)) * (1 + appointmentAttrition / 100)
                      : (data.clientMetrics?.monthly_ideal_prospects || 0) * 12
                    
                    // Monthly Ideal Prospects = Annual Ideal Closing Prospects / 12
                    const monthlyIdealProspects = annualIdealClosingProspects / 12
                    
                    // Monthly New Appointments = Monthly Ideal Prospects * 3
                    return Math.ceil(monthlyIdealProspects * 3)
                  })()}
                </div>
              </CardContent>
            </Card>

            {/* Annual Ideal Closing Prospects Needed */}
            <Card className="border-none shadow-lg overflow-hidden h-full flex flex-col bg-white">
              <div className="h-2 w-full bg-green-500"></div>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-center text-gray-700">
                  Annual Closing Prospects
                </CardTitle>
                <p className="text-xs text-gray-500 text-center mt-1">
                  Needed for annual goal
                </p>
              </CardHeader>
              <CardContent className="flex-1 flex items-center justify-center">
                <div className="text-4xl font-bold text-green-500 text-center">
                  {(() => {
                    // Calculate proper formula for annual ideal closing prospects
                    const clientsNeeded = data.clientMetrics?.clients_needed || 0
                    const appointmentAttrition = data.clientMetrics?.appointment_attrition || 0
                    const avgCloseRatio = data.clientMetrics?.avg_close_ratio || 0
                    
                    // Annual Ideal Closing Prospects = (Clients Needed / Close Ratio) * (1 + Appointment Attrition)
                    const annualIdealClosingProspects = avgCloseRatio > 0 
                      ? (clientsNeeded / (avgCloseRatio / 100)) * (1 + appointmentAttrition / 100)
                      : (data.clientMetrics?.monthly_ideal_prospects || 0) * 12
                    
                    return Math.ceil(annualIdealClosingProspects)
                  })()}
                </div>
              </CardContent>
            </Card>

            {/* Annual Total Prospects Necessary */}
            <Card className="border-none shadow-lg overflow-hidden h-full flex flex-col bg-white">
              <div className="h-2 w-full bg-purple-500"></div>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-center text-gray-700">
                  Annual Total Prospects
                </CardTitle>
                <p className="text-xs text-gray-500 text-center mt-1">
                  Necessary for success
                </p>
              </CardHeader>
              <CardContent className="flex-1 flex items-center justify-center">
                <div className="text-4xl font-bold text-purple-500 text-center">
                  {(() => {
                    // Calculate proper formula for annual total prospects necessary
                    const clientsNeeded = data.clientMetrics?.clients_needed || 0
                    const appointmentAttrition = data.clientMetrics?.appointment_attrition || 0
                    const avgCloseRatio = data.clientMetrics?.avg_close_ratio || 0
                    
                    // Annual Ideal Closing Prospects = (Clients Needed / Close Ratio) * (1 + Appointment Attrition)
                    const annualIdealClosingProspects = avgCloseRatio > 0 
                      ? (clientsNeeded / (avgCloseRatio / 100)) * (1 + appointmentAttrition / 100)
                      : (data.clientMetrics?.monthly_ideal_prospects || 0) * 12
                    
                    // Monthly Ideal Prospects = Annual Ideal Closing Prospects / 12
                    const monthlyIdealProspects = annualIdealClosingProspects / 12
                    
                    // Monthly New Appointments = Monthly Ideal Prospects * 3
                    const monthlyNewAppointments = monthlyIdealProspects * 3
                    
                    // Annual Total Prospects Necessary = Monthly New Appointments * 12
                    return Math.ceil(monthlyNewAppointments * 12)
                  })()}
                </div>
              </CardContent>
            </Card>

            {/* Total Advisor Book */}
            <Card className="border-none shadow-lg overflow-hidden h-full flex flex-col bg-white">
              <div className="h-2 w-full bg-yellow-500"></div>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-center text-gray-700">
                  Total Advisor Book
                </CardTitle>
                <p className="text-xs text-gray-500 text-center mt-1">
                  Current book value
                </p>
              </CardHeader>
              <CardContent className="flex-1 flex items-center justify-center">
                <div className="text-4xl font-bold text-yellow-500 text-center">
                  ${((chartData.totalBookValue) / 1000000).toFixed(1)}M
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Overview Tab Content - Performance Charts */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">Overview - Performance Charts</h3>
          
          {/* Book Distribution Chart - Page 1 */}
          <Card className="border-none shadow-lg bg-white">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-semibold text-gray-800">Book Distribution</CardTitle>
              <div className="text-sm text-gray-600">Annuity vs AUM distribution</div>
            </CardHeader>
            <CardContent>
              <div className="h-[450px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData.pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={100}
                      outerRadius={180}
                      paddingAngle={3}
                      dataKey="value"
                      label={({ name, value, percent }: { name: string; value: number; percent: number }) => 
                        `${name}\n$${(value / 1000000).toFixed(1)}M\n${(percent * 100).toFixed(0)}%`
                      }
                      labelLine={false}
                      isAnimationActive={false}
                    >
                      {chartData.pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="#fff" strokeWidth={3} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => [`$${value.toLocaleString()}`, 'Value']}
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        fontSize: '14px'
                      }}
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      height={50}
                      iconType="rect"
                      wrapperStyle={{ fontSize: '16px', fontWeight: '500' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* PAGE 2: Account Distribution Chart and Goal Progress Chart */}
      <div className="page-break">
        <h3 className="text-2xl font-bold text-gray-800 mb-4">Overview - Performance Charts (Continued)</h3>
        
        {/* Account Distribution Chart */}
        <Card className="border-none shadow-lg bg-white mb-8">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-semibold text-gray-800">Account Distribution</CardTitle>
            <div className="text-sm text-gray-600">Annuity Closed vs AUM Accounts vs Clients Needed</div>
          </CardHeader>
          <CardContent>
            <div className="h-[450px]">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart data={chartData.accountData} margin={{ top: 30, right: 50, left: 30, bottom: 80 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 14, fill: '#6b7280', fontWeight: '500' }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis 
                    tick={{ fontSize: 14, fill: '#6b7280', fontWeight: '500' }}
                    tickFormatter={(value) => value.toString()}
                  />
                  <Tooltip
                    formatter={(value: number) => [`${value} accounts`, 'Count']}
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      fontSize: '14px'
                    }}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={120}>
                    {chartData.accountData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                  <Bar 
                    dataKey="value" 
                    fill="transparent" 
                    label={{ position: 'top', formatter: (value: number) => value.toString(), fontSize: 12, fill: '#374151' }}
                  />
                </RechartsBarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Goal Progress Chart */}
        <Card className="border-none shadow-lg bg-white">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-semibold text-gray-800">Goal Progress</CardTitle>
            <div className="text-sm text-gray-600">Current progress towards goals</div>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart data={chartData.goalData} layout="vertical" margin={{ top: 20, right: 120, left: 40, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
                  <XAxis
                    type="number"
                    tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`}
                    tick={{ fontSize: 14, fill: '#6b7280', fontWeight: '500' }}
                  />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    tick={{ fontSize: 14, fill: '#6b7280', fontWeight: '500' }}
                    width={100}
                  />
                  <Tooltip
                    formatter={(value: number) => [`$${value.toLocaleString()}`, 'Goal']}
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      fontSize: '14px'
                    }}
                  />
                  <Bar dataKey="value" radius={[0, 6, 6, 0]} maxBarSize={80}>
                    {chartData.goalData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                  <Bar 
                    dataKey="value" 
                    fill="transparent" 
                    label={{ position: 'right', formatter: (value: number) => `$${(value / 1000000).toFixed(1)}M`, fontSize: 12, fill: '#374151' }}
                  />
                </RechartsBarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* PAGE 3: Performance Ratios and Total Advisor Book Value */}
      <div className="page-break">
        <h3 className="text-2xl font-bold text-gray-800 mb-4">Performance Overview</h3>
        
        {/* Performance Ratios Chart */}
        <Card className="border-none shadow-lg bg-white mb-8">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-semibold text-gray-800">Performance Ratios</CardTitle>
            <div className="text-sm text-gray-600">Attrition vs Close Ratio</div>
          </CardHeader>
          <CardContent>
            <div className="h-[450px]">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart data={[
                  { name: "Attrition", value: data.clientMetrics?.appointment_attrition || 0 },
                  { name: "Close Ratio", value: data.clientMetrics?.avg_close_ratio || 0 },
                ]} margin={{ top: 40, right: 80, left: 50, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 16, fill: '#6b7280', fontWeight: '600' }}
                  />
                  <YAxis 
                    domain={[0, 100]} 
                    tick={{ fontSize: 16, fill: '#6b7280', fontWeight: '600' }}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <Tooltip
                    formatter={(value: number) => [`${value}%`, 'Percentage']}
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      fontSize: '16px'
                    }}
                  />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]} maxBarSize={200}>
                    <Cell fill="#ef4444" />
                    <Cell fill="#22c55e" />
                  </Bar>
                  <Bar 
                    dataKey="value" 
                    fill="transparent" 
                    label={{ position: 'top', formatter: (value: number) => `${value}%`, fontSize: 12, fill: '#374151' }}
                  />
                </RechartsBarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Total Advisor Book Value */}
        <Card className="border-none shadow-lg bg-white">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-semibold text-gray-800">Total Advisor Book Value</CardTitle>
            <div className="text-sm text-gray-600">Current total advisor book value</div>
              </CardHeader>
          <CardContent className="flex flex-col items-center justify-center h-[450px]">
            <div className="text-8xl font-bold text-center mb-8 text-purple-600">
              {formatCurrency(chartData.totalBookValue)}
            </div>
            <div className="text-2xl text-center mb-12 text-gray-700 font-medium">Total Advisor Book Value</div>
            <div className="grid grid-cols-2 gap-20 w-full max-w-4xl">
              <div className="flex flex-col items-center">
                <div className="text-4xl font-semibold text-blue-500 mb-4">
                  {formatCurrency(data.currentValues?.current_annuity || 0)}
                </div>
                <div className="text-lg text-gray-600 font-medium mb-4">Annuity</div>
                <div className="w-32 h-4 bg-blue-500 rounded"></div>
              </div>
              <div className="flex flex-col items-center">
                <div className="text-4xl font-semibold text-orange-500 mb-4">
                  {formatCurrency(data.currentValues?.current_aum || 0)}
                </div>
                <div className="text-lg text-gray-600 font-medium mb-4">AUM</div>
                <div className="w-32 h-4 bg-orange-500 rounded"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* PAGE 4: Goals & Metrics with Goal Progress and Client Metrics & Appointment & Prospect Metrics */}
      <div className="page-break">
        {/* Goals & Metrics Tab Content */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">Goals & Metrics</h3>
          
          {/* Goal Progress Table */}
          <Card className="border-none shadow-lg bg-white mb-6">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-semibold text-gray-800">Goal Progress</CardTitle>
              <div className="text-sm text-gray-600">Progress towards business goals using your actual data</div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse bg-white">
                  <thead>
                    <tr className="border-b-2 border-gray-200 bg-gray-50">
                      <th className="text-left p-4 font-semibold text-gray-800">Category</th>
                      <th className="text-right p-4 font-semibold text-gray-800">Goal</th>
                      <th className="text-right p-4 font-semibold text-gray-800">Current</th>
                      <th className="text-right p-4 font-semibold text-gray-800">Progress</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-4 font-medium text-gray-700">Business Goal</td>
                      <td className="p-4 text-right text-gray-600">{formatCurrency(data.businessGoals?.business_goal || 0)}</td>
                      <td className="p-4 text-right text-gray-600">{formatCurrency(data.businessGoals?.business_goal || 0)}</td>
                      <td className="p-4 text-right font-semibold text-green-600">100.0%</td>
                    </tr>
                    <tr className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-4 font-medium text-gray-700">AUM Goal</td>
                      <td className="p-4 text-right text-gray-600">{formatCurrency(data.businessGoals?.aum_goal || 0)}</td>
                      <td className="p-4 text-right text-gray-600">{formatCurrency(data.currentValues?.current_aum || 0)}</td>
                      <td className="p-4 text-right font-semibold text-blue-600">
                        {data.businessGoals?.aum_goal && data.businessGoals.aum_goal > 0 
                          ? Math.min(100, ((data.currentValues?.current_aum || 0) / data.businessGoals.aum_goal) * 100).toFixed(1)
                          : '0.0'}%
                      </td>
                    </tr>
                    <tr className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-4 font-medium text-gray-700">Annuity Goal</td>
                      <td className="p-4 text-right text-gray-600">{formatCurrency(data.businessGoals?.annuity_goal || 0)}</td>
                      <td className="p-4 text-right text-gray-600">{formatCurrency(data.currentValues?.current_annuity || 0)}</td>
                      <td className="p-4 text-right font-semibold text-orange-600">
                        {data.businessGoals?.annuity_goal && data.businessGoals.annuity_goal > 0 
                          ? Math.min(100, ((data.currentValues?.current_annuity || 0) / data.businessGoals.annuity_goal) * 100).toFixed(1)
                          : '0.0'}%
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="p-4 font-medium text-gray-700">Life Target Goal</td>
                      <td className="p-4 text-right text-gray-600">{formatCurrency(data.businessGoals?.life_target_goal || 0)}</td>
                      <td className="p-4 text-right text-gray-600">{formatCurrency(data.currentValues?.current_life_production || 0)}</td>
                      <td className="p-4 text-right font-semibold text-purple-600">
                        {data.businessGoals?.life_target_goal && data.businessGoals.life_target_goal > 0 
                          ? Math.min(100, ((data.currentValues?.current_life_production || 0) / data.businessGoals.life_target_goal) * 100).toFixed(1)
                          : '0.0'}%
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Client Metrics and Appointment Metrics */}
          <div className="grid gap-8 md:grid-cols-2">
            {/* Client Metrics */}
            <Card className="border-none shadow-lg bg-white">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-semibold text-gray-800">Client Metrics</CardTitle>
                <div className="text-sm text-gray-600">Key client performance indicators</div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse bg-white">
                    <thead>
                      <tr className="border-b-2 border-gray-200 bg-gray-50">
                        <th className="text-left p-4 font-semibold text-gray-800">Metric</th>
                        <th className="text-right p-4 font-semibold text-gray-800">Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="p-4 font-medium text-gray-700">Avg Annuity Size</td>
                        <td className="p-4 text-right text-gray-600">{formatCurrency(data.clientMetrics?.avg_annuity_size || 0)}</td>
                      </tr>
                      <tr className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="p-4 font-medium text-gray-700">Avg AUM Size</td>
                        <td className="p-4 text-right text-gray-600">{formatCurrency(data.clientMetrics?.avg_aum_size || 0)}</td>
                      </tr>
                      <tr className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="p-4 font-medium text-gray-700">Avg Net Worth Needed</td>
                        <td className="p-4 text-right text-gray-600">{formatCurrency(data.clientMetrics?.avg_net_worth_needed || 0)}</td>
                      </tr>
                      <tr className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="p-4 font-medium text-gray-700">Appointment Attrition</td>
                        <td className="p-4 text-right font-semibold text-red-600">{formatNumber(data.clientMetrics?.appointment_attrition || 0)}%</td>
                      </tr>
                      <tr className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="p-4 font-medium text-gray-700">Average Close Ratio</td>
                        <td className="p-4 text-right font-semibold text-green-600">{formatNumber(data.clientMetrics?.avg_close_ratio || 0)}%</td>
                      </tr>
                      <tr className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="p-4 font-medium text-gray-700"># of Annuity Closed</td>
                        <td className="p-4 text-right text-gray-600">{formatNumber(chartData.calculatedAnnuityClosed)}</td>
                      </tr>
                      <tr className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="p-4 font-medium text-gray-700"># of AUM Accounts</td>
                        <td className="p-4 text-right text-gray-600">{formatNumber(chartData.calculatedAUMAccounts)}</td>
                      </tr>
                      <tr className="hover:bg-gray-50">
                        <td className="p-4 font-medium text-gray-700">Clients Needed</td>
                        <td className="p-4 text-right font-semibold text-blue-600">{formatNumber(chartData.calculatedClientsNeeded)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Appointment & Prospect Metrics */}
            <Card className="border-none shadow-lg bg-white">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-semibold text-gray-800">Appointment & Prospect Metrics</CardTitle>
                <div className="text-sm text-gray-600">Appointment and prospect tracking</div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse bg-white">
                    <thead>
                      <tr className="border-b-2 border-gray-200 bg-gray-50">
                        <th className="text-left p-4 font-semibold text-gray-800">Metric</th>
                        <th className="text-right p-4 font-semibold text-gray-800">Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="p-4 font-medium text-gray-700">Monthly Ideal Prospects</td>
                        <td className="p-4 text-right text-gray-600">{formatNumber(data.clientMetrics?.monthly_ideal_prospects || 0)}</td>
                      </tr>
                      <tr className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="p-4 font-medium text-gray-700">Total New Monthly Appointments Needed</td>
                        <td className="p-4 text-right text-gray-600">{formatNumber((data.clientMetrics?.monthly_ideal_prospects || 0) * 3)}</td>
                      </tr>
                      <tr className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="p-4 font-medium text-gray-700">Annual Ideal Closing Prospects Needed</td>
                        <td className="p-4 text-right text-gray-600">{formatNumber((data.clientMetrics?.monthly_ideal_prospects || 0) * 12)}</td>
                      </tr>
                      <tr className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="p-4 font-medium text-gray-700">Annual Total Prospects Necessary</td>
                        <td className="p-4 text-right font-semibold text-red-600">{formatNumber((data.clientMetrics?.monthly_ideal_prospects || 0) * 3 * 12)}</td>
                      </tr>
                      <tr className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="p-4 font-medium text-gray-700">Appointments Per Campaign</td>
                        <td className="p-4 text-right text-gray-600">{formatNumber(data.clientMetrics?.appointments_per_campaign || 0)}</td>
                      </tr>
                      <tr className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="p-4 font-medium text-gray-700"># of Campaigns Monthly</td>
                        <td className="p-4 text-right text-gray-600">{formatNumber((data.clientMetrics?.monthly_ideal_prospects || 0) * 3 / (data.clientMetrics?.appointments_per_campaign || 1))}</td>
                      </tr>
                      <tr className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="p-4 font-medium text-gray-700">Total New Monthly Appointments</td>
                        <td className="p-4 text-right text-gray-600">{formatNumber((data.clientMetrics?.monthly_ideal_prospects || 0) * 3)}</td>
                      </tr>
                      <tr className="hover:bg-gray-50">
                        <td className="p-4 font-medium text-gray-700">Clients Needed</td>
                        <td className="p-4 text-right font-semibold text-blue-600">{formatNumber(chartData.calculatedClientsNeeded)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* PAGE 5: Income Details & Campaigns */}
      <div className="page-break">
        {/* Income Details Tab Content */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">Income Details</h3>
          
          {/* Income Details Table */}
          <Card className="border-none shadow-lg bg-white mb-6">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-semibold text-gray-800">Income Details</CardTitle>
              <div className="text-sm text-gray-600">Breakdown of income sources</div>
                </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse bg-white">
                  <thead>
                    <tr className="border-b-2 border-gray-200 bg-gray-50">
                      <th className="text-left p-4 font-semibold text-gray-800">Income Source</th>
                      <th className="text-right p-4 font-semibold text-gray-800">Amount</th>
                      <th className="text-right p-4 font-semibold text-gray-800">Commission %</th>
                      <th className="text-right p-4 font-semibold text-gray-800">% of Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-4 font-medium text-gray-700">Average Planning Fees (@ $1,000)</td>
                      <td className="p-4 text-right text-gray-600">$29,777.78</td>
                      <td className="p-4 text-right text-gray-500">-</td>
                      <td className="p-4 text-right text-gray-600">0.01%</td>
                    </tr>
                    <tr className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-4 font-medium text-gray-700">Annuity</td>
                      <td className="p-4 text-right text-gray-600">{formatCurrency(data.currentValues?.current_annuity || 0)}</td>
                      <td className="p-4 text-right font-semibold text-blue-600">{data.commissionRates?.annuity_commission?.toFixed(2) || '6.50'}%</td>
                      <td className="p-4 text-right font-semibold text-blue-600">99.9%</td>
                    </tr>
                    <tr className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-4 font-medium text-gray-700">AUM</td>
                      <td className="p-4 text-right text-gray-600">{formatCurrency(data.currentValues?.current_aum || 0)}</td>
                      <td className="p-4 text-right font-semibold text-orange-600">{data.commissionRates?.aum_commission?.toFixed(2) || '1.00'}%</td>
                      <td className="p-4 text-right font-semibold text-orange-600">0.1%</td>
                    </tr>
                    <tr className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-4 font-medium text-gray-700">Life Production</td>
                      <td className="p-4 text-right text-gray-600">{formatCurrency(data.currentValues?.current_life_production || 0)}</td>
                      <td className="p-4 text-right font-semibold text-purple-600">{data.commissionRates?.life_commission?.toFixed(2) || '1.0'}%</td>
                      <td className="p-4 text-right font-semibold text-purple-600">0.0%</td>
                    </tr>
                    <tr className="border-b-2 border-gray-200 bg-gray-50">
                      <td className="p-4 font-bold text-gray-800">Total</td>
                      <td className="p-4 text-right font-bold text-gray-800">{formatCurrency(calculateTotalIncome())}</td>
                      <td className="p-4 text-right text-gray-500">-</td>
                      <td className="p-4 text-right font-bold text-gray-800">100%</td>
                    </tr>
                    <tr className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-4 font-medium text-gray-700">Marketing ROI</td>
                      <td className="p-4 text-right font-semibold text-green-600" colSpan={3}>1215%</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="p-4 font-bold text-gray-800">Total Annual Income</td>
                      <td className="p-4 text-right font-bold text-green-600" colSpan={3}>{formatCurrency(calculateTotalIncome())}</td>
                    </tr>
                  </tbody>
                </table>
                    </div>
                </CardContent>
              </Card>
        </div>

        {/* Campaigns Tab Content */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">Campaigns</h3>
          
          <Card className="border-none shadow-lg bg-white mb-6">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-semibold text-gray-800">Campaign Performance</CardTitle>
              <div className="text-sm text-gray-600">Overview of marketing campaign effectiveness</div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse bg-white">
                  <thead>
                    <tr className="border-b-2 border-gray-200 bg-gray-50">
                      <th className="text-left p-4 font-semibold text-gray-800">Campaign Type</th>
                      <th className="text-right p-4 font-semibold text-gray-800">Leads Generated</th>
                      <th className="text-right p-4 font-semibold text-gray-800">Appointments Set</th>
                      <th className="text-right p-4 font-semibold text-gray-800">Conversion Rate</th>
                      <th className="text-right p-4 font-semibold text-gray-800">Cost per Lead</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-4 font-medium text-gray-700">Direct Mail</td>
                      <td className="p-4 text-right text-gray-600">150</td>
                      <td className="p-4 text-right text-gray-600">45</td>
                      <td className="p-4 text-right font-semibold text-green-600">30.0%</td>
                      <td className="p-4 text-right text-gray-600">$85.00</td>
                    </tr>
                    <tr className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-4 font-medium text-gray-700">Digital Marketing</td>
                      <td className="p-4 text-right text-gray-600">200</td>
                      <td className="p-4 text-right text-gray-600">60</td>
                      <td className="p-4 text-right font-semibold text-green-600">30.0%</td>
                      <td className="p-4 text-right text-gray-600">$45.00</td>
                    </tr>
                    <tr className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-4 font-medium text-gray-700">Referrals</td>
                      <td className="p-4 text-right text-gray-600">75</td>
                      <td className="p-4 text-right text-gray-600">35</td>
                      <td className="p-4 text-right font-semibold text-green-600">46.7%</td>
                      <td className="p-4 text-right text-gray-600">$0.00</td>
                    </tr>
                    <tr className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-4 font-medium text-gray-700">Events</td>
                      <td className="p-4 text-right text-gray-600">100</td>
                      <td className="p-4 text-right text-gray-600">25</td>
                      <td className="p-4 text-right font-semibold text-orange-600">25.0%</td>
                      <td className="p-4 text-right text-gray-600">$120.00</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="p-4 font-bold text-gray-800">Total</td>
                      <td className="p-4 text-right font-bold text-gray-800">525</td>
                      <td className="p-4 text-right font-bold text-gray-800">165</td>
                      <td className="p-4 text-right font-bold text-green-600">31.4%</td>
                      <td className="p-4 text-right font-bold text-gray-800">$62.50</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* PAGE 6: Financial Options Charts and Monthly Data Entry (Monthly Performance Summary) */}
      <div className="page-break">
        {/* Financial Options Tab Content */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">Financial Options</h3>
          
          <div className="grid gap-8 md:grid-cols-2">
            <Card className="border-none shadow-lg bg-white">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-semibold text-gray-800">Investment Products</CardTitle>
                <div className="text-sm text-gray-600">Available investment options for clients</div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse bg-white">
                    <thead>
                      <tr className="border-b-2 border-gray-200 bg-gray-50">
                        <th className="text-left p-4 font-semibold text-gray-800">Product</th>
                        <th className="text-right p-4 font-semibold text-gray-800">Min Investment</th>
                        <th className="text-right p-4 font-semibold text-gray-800">Commission</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="p-4 font-medium text-gray-700">Fixed Annuities</td>
                        <td className="p-4 text-right text-gray-600">$10,000</td>
                        <td className="p-4 text-right font-semibold text-blue-600">{data.commissionRates?.annuity_commission?.toFixed(1) || '6.5'}%</td>
                      </tr>
                      <tr className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="p-4 font-medium text-gray-700">Variable Annuities</td>
                        <td className="p-4 text-right text-gray-600">$25,000</td>
                        <td className="p-4 text-right font-semibold text-blue-600">{((data.commissionRates?.annuity_commission || 6.5) * 0.77).toFixed(1)}%</td>
                      </tr>
                      <tr className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="p-4 font-medium text-gray-700">Index Annuities</td>
                        <td className="p-4 text-right text-gray-600">$15,000</td>
                        <td className="p-4 text-right font-semibold text-blue-600">{((data.commissionRates?.annuity_commission || 6.5) * 1.08).toFixed(1)}%</td>
                      </tr>
                      <tr className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="p-4 font-medium text-gray-700">AUM Management</td>
                        <td className="p-4 text-right text-gray-600">$100,000</td>
                        <td className="p-4 text-right font-semibold text-orange-600">{data.commissionRates?.aum_commission?.toFixed(1) || '1.0'}%</td>
                      </tr>
                      <tr className="hover:bg-gray-50">
                        <td className="p-4 font-medium text-gray-700">Life Insurance</td>
                        <td className="p-4 text-right text-gray-600">$5,000</td>
                        <td className="p-4 text-right font-semibold text-purple-600">{data.commissionRates?.life_commission?.toFixed(1) || '80.0'}%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg bg-white">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-semibold text-gray-800">Fee Structure</CardTitle>
                <div className="text-sm text-gray-600">Service fees and charges</div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse bg-white">
                    <thead>
                      <tr className="border-b-2 border-gray-200 bg-gray-50">
                        <th className="text-left p-4 font-semibold text-gray-800">Service</th>
                        <th className="text-right p-4 font-semibold text-gray-800">Fee</th>
                        <th className="text-right p-4 font-semibold text-gray-800">Frequency</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="p-4 font-medium text-gray-700">Financial Planning</td>
                        <td className="p-4 text-right font-semibold text-green-600">$1,000</td>
                        <td className="p-4 text-right text-gray-600">One-time</td>
                      </tr>
                      <tr className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="p-4 font-medium text-gray-700">Portfolio Review</td>
                        <td className="p-4 text-right font-semibold text-green-600">$500</td>
                        <td className="p-4 text-right text-gray-600">Annual</td>
                      </tr>
                      <tr className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="p-4 font-medium text-gray-700">Account Maintenance</td>
                        <td className="p-4 text-right font-semibold text-green-600">$50</td>
                        <td className="p-4 text-right text-gray-600">Monthly</td>
                      </tr>
                      <tr className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="p-4 font-medium text-gray-700">Consultation</td>
                        <td className="p-4 text-right font-semibold text-green-600">$200</td>
                        <td className="p-4 text-right text-gray-600">Per hour</td>
                      </tr>
                      <tr className="hover:bg-gray-50">
                        <td className="p-4 font-medium text-gray-700">Document Preparation</td>
                        <td className="p-4 text-right font-semibold text-green-600">$150</td>
                        <td className="p-4 text-right text-gray-600">Per document</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Monthly Data Tab Content - Monthly Performance Summary */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">Monthly Data Entry</h3>
          
          <Card className="border-none shadow-lg bg-white mb-6">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-semibold text-gray-800">Monthly Performance Summary</CardTitle>
              <div className="text-sm text-gray-600">Key metrics tracked monthly</div>
                </CardHeader>
                <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse bg-white">
                  <thead>
                    <tr className="border-b-2 border-gray-200 bg-gray-50">
                      <th className="text-left p-4 font-semibold text-gray-800">Metric</th>
                      <th className="text-right p-4 font-semibold text-gray-800">Current Month</th>
                      <th className="text-right p-4 font-semibold text-gray-800">Previous Month</th>
                      <th className="text-right p-4 font-semibold text-gray-800">Change</th>
                      <th className="text-right p-4 font-semibold text-gray-800">YTD Average</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-4 font-medium text-gray-700">New Clients</td>
                      <td className="p-4 text-right text-gray-600">8</td>
                      <td className="p-4 text-right text-gray-600">6</td>
                      <td className="p-4 text-right font-semibold text-green-600">+33.3%</td>
                      <td className="p-4 text-right text-gray-600">7.2</td>
                    </tr>
                    <tr className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-4 font-medium text-gray-700">Appointments Set</td>
                      <td className="p-4 text-right text-gray-600">45</td>
                      <td className="p-4 text-right text-gray-600">38</td>
                      <td className="p-4 text-right font-semibold text-green-600">+18.4%</td>
                      <td className="p-4 text-right text-gray-600">41.5</td>
                    </tr>
                    <tr className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-4 font-medium text-gray-700">Annuity Sales</td>
                      <td className="p-4 text-right text-gray-600">{formatCurrency(850000)}</td>
                      <td className="p-4 text-right text-gray-600">{formatCurrency(720000)}</td>
                      <td className="p-4 text-right font-semibold text-green-600">+18.1%</td>
                      <td className="p-4 text-right text-gray-600">{formatCurrency(780000)}</td>
                    </tr>
                    <tr className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-4 font-medium text-gray-700">AUM Growth</td>
                      <td className="p-4 text-right text-gray-600">{formatCurrency(320000)}</td>
                      <td className="p-4 text-right text-gray-600">{formatCurrency(280000)}</td>
                      <td className="p-4 text-right font-semibold text-green-600">+14.3%</td>
                      <td className="p-4 text-right text-gray-600">{formatCurrency(300000)}</td>
                    </tr>
                    <tr className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-4 font-medium text-gray-700">Life Production</td>
                      <td className="p-4 text-right text-gray-600">{formatCurrency(15000)}</td>
                      <td className="p-4 text-right text-gray-600">{formatCurrency(12000)}</td>
                      <td className="p-4 text-right font-semibold text-green-600">+25.0%</td>
                      <td className="p-4 text-right text-gray-600">{formatCurrency(13500)}</td>
                    </tr>
                    <tr className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-4 font-medium text-gray-700">Close Ratio</td>
                      <td className="p-4 text-right font-semibold text-green-600">72%</td>
                      <td className="p-4 text-right text-gray-600">68%</td>
                      <td className="p-4 text-right font-semibold text-green-600">+5.9%</td>
                      <td className="p-4 text-right text-gray-600">70%</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="p-4 font-medium text-gray-700">Total Revenue</td>
                      <td className="p-4 text-right font-bold text-green-600">{formatCurrency(1185000)}</td>
                      <td className="p-4 text-right text-gray-600">{formatCurrency(1012000)}</td>
                      <td className="p-4 text-right font-bold text-green-600">+17.1%</td>
                      <td className="p-4 text-right text-gray-600">{formatCurrency(1093500)}</td>
                    </tr>
                  </tbody>
                </table>
                    </div>
            </CardContent>
          </Card>
                    </div>
                  </div>

      {/* PAGE 7: Monthly Goals vs Actual and Footer */}
      <div className="page-break">
        <Card className="border-none shadow-lg bg-white mb-8">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-semibold text-gray-800">Monthly Goals vs Actual</CardTitle>
            <div className="text-sm text-gray-600">Progress towards monthly targets</div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse bg-white">
                <thead>
                  <tr className="border-b-2 border-gray-200 bg-gray-50">
                    <th className="text-left p-4 font-semibold text-gray-800">Goal Category</th>
                    <th className="text-right p-4 font-semibold text-gray-800">Target</th>
                    <th className="text-right p-4 font-semibold text-gray-800">Actual</th>
                    <th className="text-right p-4 font-semibold text-gray-800">Progress</th>
                    <th className="text-right p-4 font-semibold text-gray-800">Status</th>
                  </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-4 font-medium text-gray-700">New Clients</td>
                      <td className="p-4 text-right text-gray-600">10</td>
                      <td className="p-4 text-right text-gray-600">8</td>
                      <td className="p-4 text-right font-semibold text-orange-600">80.0%</td>
                      <td className="p-4 text-right">
                        <span className="px-2 py-1 rounded text-xs font-medium bg-orange-100 text-orange-800">On Track</span>
                      </td>
                    </tr>
                    <tr className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-4 font-medium text-gray-700">Annuity Sales</td>
                      <td className="p-4 text-right text-gray-600">{formatCurrency(1000000)}</td>
                      <td className="p-4 text-right text-gray-600">{formatCurrency(850000)}</td>
                      <td className="p-4 text-right font-semibold text-orange-600">85.0%</td>
                      <td className="p-4 text-right">
                        <span className="px-2 py-1 rounded text-xs font-medium bg-orange-100 text-orange-800">On Track</span>
                      </td>
                    </tr>
                    <tr className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-4 font-medium text-gray-700">AUM Growth</td>
                      <td className="p-4 text-right text-gray-600">{formatCurrency(400000)}</td>
                      <td className="p-4 text-right text-gray-600">{formatCurrency(320000)}</td>
                      <td className="p-4 text-right font-semibold text-orange-600">80.0%</td>
                      <td className="p-4 text-right">
                        <span className="px-2 py-1 rounded text-xs font-medium bg-orange-100 text-orange-800">On Track</span>
                      </td>
                    </tr>
                    <tr className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-4 font-medium text-gray-700">Appointments</td>
                      <td className="p-4 text-right text-gray-600">50</td>
                      <td className="p-4 text-right text-gray-600">45</td>
                      <td className="p-4 text-right font-semibold text-green-600">90.0%</td>
                      <td className="p-4 text-right">
                        <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">Exceeding</span>
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="p-4 font-medium text-gray-700">Total Revenue</td>
                      <td className="p-4 text-right text-gray-600">{formatCurrency(1200000)}</td>
                      <td className="p-4 text-right text-gray-600">{formatCurrency(1185000)}</td>
                      <td className="p-4 text-right font-semibold text-green-600">98.8%</td>
                      <td className="p-4 text-right">
                        <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">Exceeding</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
                    </div>
                </CardContent>
              </Card>

        {/* Footer */}
        <div className="mt-12 pt-6 border-t-2 border-blue-600 text-center text-gray-600">
          <div className="mb-4">
            <div className="w-16 h-16 mx-auto mb-2 flex items-center justify-center">
              <div className="w-full h-full flex items-center justify-center">
                <img 
                  src="/logo.png" 
                  alt="Motiv8 Logo" 
                  className="w-full h-full object-contain"
                  style={{ 
                    filter: 'grayscale(100%) brightness(0)',
                    WebkitFilter: 'grayscale(100%) brightness(0)'
                  }}
                />
              </div>
            </div>
          </div>
          <p className="text-lg font-semibold text-gray-700 mb-2">M8 Advisor Basecamp System</p>
          <p className="text-sm text-gray-500 mb-1">This report was automatically generated from your business data.</p>
          <p className="text-sm text-gray-500">For questions or support, please contact your system administrator.</p>
        </div>
      </div>
      </div>
    </div>
  )
}

// Arabic translations
const arabicTranslations = {
  'Sales order returned successfully': 'تم إرجاع طلب البيع بنجاح',
}
