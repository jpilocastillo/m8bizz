"use client"

import React, { useRef, useState } from 'react'
import { AdvisorBasecampData } from '@/lib/advisor-basecamp'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, Loader2, AlertCircle, Target } from 'lucide-react'
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
} from 'recharts'

interface PDFExportProps {
  data: AdvisorBasecampData
  profile: any
  year?: number
}

export function PDFExport({ data, profile, year }: PDFExportProps) {
  const pdfRef = useRef<HTMLDivElement>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const formatCurrency = (value: number | null | undefined) => {
    if (value === null || value === undefined) return '$0'
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`
    }
    return `$${value.toLocaleString()}`
  }

  const formatNumber = (value: number | null | undefined) => {
    if (value === null || value === undefined) return '0'
    return new Intl.NumberFormat('en-US').format(value)
  }

  // Calculate all metrics using same formulas as dashboard components
  const calculateMetrics = () => {
    const currentAUM = data.currentValues?.current_aum || 0
    const currentAnnuity = data.currentValues?.current_annuity || 0
    const avgAnnuitySize = data.clientMetrics?.avg_annuity_size || 0
    const avgAUMSize = data.clientMetrics?.avg_aum_size || 0
    const annuityClosed = data.clientMetrics?.annuity_closed || 0
    const appointmentAttrition = data.clientMetrics?.appointment_attrition || 0
    const avgCloseRatio = data.clientMetrics?.avg_close_ratio || 0
    const monthlyIdealProspects = data.clientMetrics?.monthly_ideal_prospects || 0

    // Calculate clients needed: (E11 + E10) / 2
    const E11 = avgAUMSize > 0 ? annuityClosed / avgAUMSize : 0
    const E10 = avgAnnuitySize > 0 ? currentAUM / avgAnnuitySize : 0
    const calculatedClientsNeeded = Math.ceil((E11 + E10) / 2)
    const clientsNeeded = data.clientMetrics?.clients_needed || calculatedClientsNeeded

    // Calculate appointment and prospect metrics
    const annualIdealClosingProspects = avgCloseRatio > 0 
      ? Math.ceil((clientsNeeded / (avgCloseRatio / 100)) * (1 + appointmentAttrition / 100))
      : Math.ceil(monthlyIdealProspects * 12)
    const calculatedMonthlyIdealProspects = annualIdealClosingProspects / 12
    const monthlyNewAppointmentsNeeded = Math.ceil(calculatedMonthlyIdealProspects * 3)
    const annualTotalProspectsNecessary = monthlyNewAppointmentsNeeded * 12

    // Calculate total book value
    const totalBookValue = currentAUM + currentAnnuity + (data.currentValues?.current_life_production || 0)

    // Calculate campaign metrics
    const totalEvents = (data.campaigns || []).reduce((sum, c) => sum + (c.events || 0), 0) * 12
    const totalLeads = (data.campaigns || []).reduce((sum, c) => sum + (c.leads || 0), 0) * 12
    const totalBudget = (data.campaigns || []).reduce((sum, c) => sum + (c.budget || 0), 0) * 12
    const appointmentsPerCampaign = data.clientMetrics?.appointments_per_campaign || 0
    const totalAppointments = appointmentsPerCampaign > 0 
      ? totalEvents * appointmentsPerCampaign
      : Math.round(totalLeads * 0.4)
    const totalProspects = Math.round(totalAppointments * (1 - appointmentAttrition / 100))
    const totalClients = Math.round(totalProspects * (avgCloseRatio / 100))
    const costPerLead = totalLeads > 0 ? totalBudget / totalLeads : 0
    const costPerAppointment = totalAppointments > 0 ? totalBudget / totalAppointments : 0
    const costPerClient = totalClients > 0 ? totalBudget / totalClients : 0
    const leadToAppointmentRatio = totalLeads > 0 ? (totalAppointments / totalLeads) * 100 : 0
    const appointmentToClientRatio = totalAppointments > 0 ? (totalClients / totalAppointments) * 100 : 0
    const avgClientAnnuitySize = data.clientMetrics?.avg_annuity_size || 0
    const avgClientAUMSize = data.clientMetrics?.avg_aum_size || 0
    const avgClientValue = (avgClientAnnuitySize + avgClientAUMSize) / 2
    const totalRevenue = totalClients * avgClientValue
    const marketingROI = totalBudget > 0 ? ((totalRevenue - totalBudget) / totalBudget) * 100 : 0

    return {
      clientsNeeded,
      monthlyNewAppointmentsNeeded,
      annualIdealClosingProspects,
      annualTotalProspectsNecessary,
      totalBookValue,
      calculatedMonthlyIdealProspects,
      totalEvents,
      totalLeads,
      totalBudget,
      costPerLead,
      costPerAppointment,
      costPerClient,
      leadToAppointmentRatio,
      appointmentToClientRatio,
      marketingROI,
    }
  }

  const metrics = calculateMetrics()

  const handleDownloadPDF = async () => {
    if (!pdfRef.current) {
      setError('PDF content not found')
      return
    }

    setIsGenerating(true)
    setError(null)

    try {
      const canvas = await html2canvas(pdfRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      })

      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('portrait', 'mm', 'a4')
      const imgWidth = 210
      const pageHeight = 297
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      let heightLeft = imgHeight
      let position = 0

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight

      while (heightLeft > 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }

      const fileName = `M8-Advisor-Basecamp-${year || new Date().getFullYear()}-${format(new Date(), 'yyyy-MM-dd')}.pdf`
      pdf.save(fileName)
      toast({
        title: 'Success',
        description: 'PDF downloaded successfully',
      })
    } catch (err) {
      console.error('Error generating PDF:', err)
      setError('Failed to generate PDF. Please try again.')
      toast({
        title: 'Error',
        description: 'Failed to generate PDF',
        variant: 'destructive',
      })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">PDF Report</h2>
          <p className="text-m8bs-muted">Generate a comprehensive yearly goals summary</p>
        </div>
        <Button
          onClick={handleDownloadPDF}
          disabled={isGenerating}
          className="bg-gradient-to-r from-m8bs-blue to-m8bs-purple hover:from-m8bs-blue-dark hover:to-m8bs-purple text-white"
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

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 flex items-center gap-2 text-red-400">
          <AlertCircle className="h-5 w-5" />
          <span>{error}</span>
        </div>
      )}

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
      
        {/* PAGE 1: Header and Business Goals Summary */}
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
            {year && (
              <h3 className="text-xl text-blue-600 font-semibold mb-2">
                Year: {year}
              </h3>
            )}
            <p className="text-gray-500 text-lg mb-0">
              Yearly Goals Summary Report
            </p>
            <p className="text-gray-400 text-sm">
              Generated on {format(new Date(), 'MMMM dd, yyyy')}
            </p>
          </div>

          {/* Main Business Goal Hero Section */}
          <Card className="border-none shadow-lg bg-gradient-to-br from-gray-50 to-gray-100 mb-8">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 shadow-xl">
                  <Target className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-3xl font-extrabold text-gray-800">Your Business Goal</h3>
                  <p className="text-gray-600 mt-1">Your total annual target to achieve</p>
                </div>
              </div>
              <div className="flex items-center justify-between bg-white rounded-xl p-6 border border-gray-200">
                <div>
                  <p className="text-sm text-gray-500 mb-2 uppercase tracking-wide">Total Annual Target</p>
                  <div className="text-4xl font-extrabold text-gray-800 tabular-nums">
                    {formatCurrency(data.businessGoals?.business_goal || 0)}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500 mb-2">Breakdown</p>
                  <div className="space-y-1">
                    <div className="text-lg font-semibold text-gray-700">
                      AUM: <span className="text-blue-500">{formatCurrency(data.businessGoals?.aum_goal || 0)}</span>
                    </div>
                    <div className="text-lg font-semibold text-gray-700">
                      Annuity: <span className="text-orange-500">{formatCurrency(data.businessGoals?.annuity_goal || 0)}</span>
                    </div>
                    <div className="text-lg font-semibold text-gray-700">
                      Life: <span className="text-purple-500">{formatCurrency(data.businessGoals?.life_target_goal || 0)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dashboard Metrics - 5 Cards */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4">What's Needed to Reach Your Business Goal</h3>
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {[
                { title: "Clients Needed", value: metrics.clientsNeeded.toString(), description: "Target clients needed", color: "red" },
                { title: "Monthly New Appointments Needed", value: metrics.monthlyNewAppointmentsNeeded.toString(), description: "Monthly target", color: "blue" },
                { title: "Annual Ideal Closing Prospects Needed", value: metrics.annualIdealClosingProspects.toString(), description: "Prospects needed", color: "green" },
                { title: "Annual Total Prospects Necessary", value: metrics.annualTotalProspectsNecessary.toString(), description: "Annual prospects needed", color: "purple" },
                { title: "Total Advisor Book", value: formatCurrency(metrics.totalBookValue), description: "Current book value", color: "yellow" },
              ].map((metric, index) => (
                <Card key={index} className="border-none shadow-lg overflow-hidden h-full flex flex-col bg-white">
                  <div className={`h-2 w-full ${
                    metric.color === 'red' ? 'bg-red-500' :
                    metric.color === 'blue' ? 'bg-blue-500' :
                    metric.color === 'green' ? 'bg-green-500' :
                    metric.color === 'purple' ? 'bg-purple-500' :
                    'bg-yellow-500'
                  }`}></div>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold text-center text-gray-700">
                      {metric.title}
                    </CardTitle>
                    <p className="text-xs text-gray-500 text-center mt-1">
                      {metric.description}
                    </p>
                  </CardHeader>
                  <CardContent className="flex-1 flex items-center justify-center">
                    <div className={`text-3xl font-bold text-center ${
                      metric.color === 'red' ? 'text-red-500' :
                      metric.color === 'blue' ? 'text-blue-500' :
                      metric.color === 'green' ? 'text-green-500' :
                      metric.color === 'purple' ? 'text-purple-500' :
                      'text-yellow-500'
                    }`}>
                      {metric.value}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Component Goals Cards */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Reach These Targets To Achieve Your Business Goal</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { 
                  name: "AUM Goal", 
                  goal: data.businessGoals?.aum_goal || 0, 
                  percentage: data.businessGoals?.aum_goal_percentage || 0,
                  color: "#3b82f6",
                  description: "Assets Under Management target"
                },
                { 
                  name: "Annuity Goal", 
                  goal: data.businessGoals?.annuity_goal || 0, 
                  percentage: data.businessGoals?.annuity_goal_percentage || 0,
                  color: "#f97316",
                  description: "Annuity sales target"
                },
                { 
                  name: "Life Target Goal", 
                  goal: data.businessGoals?.life_target_goal || 0, 
                  percentage: data.businessGoals?.life_target_goal_percentage || 0,
                  color: "#a855f7",
                  description: "Life insurance production target"
                },
              ].map((item, index) => {
                const businessGoal = data.businessGoals?.business_goal || 0
                const goalPercentage = businessGoal > 0 ? (item.goal / businessGoal) * 100 : 0
                return (
                  <Card key={index} className="border-none shadow-lg bg-white">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className={`p-3 rounded-lg`} style={{ backgroundColor: `${item.color}20` }}>
                          <div className="w-6 h-6 rounded" style={{ backgroundColor: item.color }}></div>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-white text-xs font-bold`} style={{ backgroundColor: item.color }}>
                          {item.percentage.toFixed(1)}%
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">{item.name}</h4>
                        <div className="text-2xl font-extrabold text-gray-800 tabular-nums">
                          {formatCurrency(item.goal)}
                        </div>
                        <p className="text-xs text-gray-500">{item.description}</p>
                      </div>
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex items-center justify-between text-xs mb-2">
                          <span className="text-gray-500">Of Business Goal</span>
                          <span className="text-gray-700 font-semibold">{goalPercentage.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{ 
                              width: `${goalPercentage}%`,
                              backgroundColor: item.color
                            }}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </div>

        {/* PAGE 2: Current Advisor Book and Performance */}
        <div className="page-break">
          <div className="mb-6">
            <h2 className="text-2xl font-extrabold text-gray-800 mb-2">Current Advisor Book</h2>
            <p className="text-gray-600 mb-6">Your Current Book Of Business{year ? ` (${year})` : ''}</p>
          </div>
          
          {/* Current Advisor Book Summary */}
          <Card className="border-none shadow-lg bg-white mb-8">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-semibold text-gray-800">Current Advisor Book</CardTitle>
              <div className="text-sm text-gray-600">Your Current Book Of Business{year ? ` (${year})` : ''}</div>
            </CardHeader>
            <CardContent>
              {/* Total Book Value */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6">
                <div className="text-center">
                  <div className="text-sm font-semibold text-gray-500 tracking-wide uppercase mb-2">Total Book Value</div>
                  <div className="text-4xl font-extrabold text-gray-800 tabular-nums leading-none">
                    ${metrics.totalBookValue.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Book Breakdown */}
              <div className="space-y-4 mb-6">
                {[
                  { name: "Annuity Book", value: data.currentValues?.current_annuity || 0, color: "#3b82f6" },
                  { name: "AUM Book", value: data.currentValues?.current_aum || 0, color: "#10b981" },
                  { name: "Life Production", value: data.currentValues?.current_life_production || 0, color: "#a855f7" },
                ].map((item, index) => {
                  const percentage = metrics.totalBookValue > 0 ? (item.value / metrics.totalBookValue) * 100 : 0
                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="text-sm font-medium text-gray-700">{item.name}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-gray-800">${item.value.toLocaleString()}</div>
                          <div className="text-xs text-gray-500">{percentage.toFixed(1)}%</div>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{ 
                            width: `${percentage}%`,
                            backgroundColor: item.color
                          }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                {[
                  { name: "Annuity Book", value: data.currentValues?.current_annuity || 0, color: "#3b82f6" },
                  { name: "AUM Book", value: data.currentValues?.current_aum || 0, color: "#10b981" },
                  { name: "Life Production", value: data.currentValues?.current_life_production || 0, color: "#a855f7" },
                ].map((item, index) => {
                  const percentage = metrics.totalBookValue > 0 ? (item.value / metrics.totalBookValue) * 100 : 0
                  return (
                    <div 
                      key={index}
                      className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center"
                    >
                      <div className="text-xs font-semibold text-gray-500 tracking-wide uppercase mb-2">
                        {item.name}
                      </div>
                      <div className="text-2xl font-extrabold text-gray-800 tabular-nums">
                        ${item.value.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {percentage.toFixed(1)}% of total
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Book Distribution Chart */}
          <Card className="border-none shadow-lg bg-white mb-8">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-semibold text-gray-800">Book Distribution</CardTitle>
              <div className="text-sm text-gray-600">Annuity vs AUM vs Life Production distribution</div>
            </CardHeader>
            <CardContent>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: "Annuity", value: data.currentValues?.current_annuity || 0, color: "#3b82f6" },
                        { name: "AUM", value: data.currentValues?.current_aum || 0, color: "#f97316" },
                        { name: "Life Production", value: data.currentValues?.current_life_production || 0, color: "#a855f7" },
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={90}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }: { name: string; percent: number }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      isAnimationActive={false}
                    >
                      {[
                        { name: "Annuity", value: data.currentValues?.current_annuity || 0, color: "#3b82f6" },
                        { name: "AUM", value: data.currentValues?.current_aum || 0, color: "#f97316" },
                        { name: "Life Production", value: data.currentValues?.current_life_production || 0, color: "#a855f7" },
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
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
                      iconType="circle"
                      wrapperStyle={{ fontSize: '14px', fontWeight: '500' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Performance Ratios */}
          <Card className="border-none shadow-lg bg-white">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-semibold text-gray-800">Performance Ratios</CardTitle>
              <div className="text-sm text-gray-600">Attrition vs Close Ratio</div>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart data={[
                    { name: "Appointment Attrition", value: data.clientMetrics?.appointment_attrition || 0 },
                    { name: "Average Close Ratio", value: data.clientMetrics?.avg_close_ratio || 0 },
                  ]} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fontSize: 12, fill: '#6b7280' }}
                    />
                    <YAxis 
                      domain={[0, 100]} 
                      tick={{ fontSize: 12, fill: '#6b7280' }}
                      tickFormatter={(value) => `${value}%`}
                    />
                    <Tooltip
                      formatter={(value: number) => [`${value}%`, 'Percentage']}
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        fontSize: '14px'
                      }}
                    />
                    <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                      <Cell fill="#ef4444" />
                      <Cell fill="#22c55e" />
                    </Bar>
                  </RechartsBarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* PAGE 3: Client Acquisition and Campaigns */}
        <div className="page-break">
          <div className="mb-6">
            <h2 className="text-2xl font-extrabold text-gray-800 mb-2">Client Acquisition Goals</h2>
            <p className="text-gray-600 mb-6">Annual Goals Based On Campaign Data{year ? ` (${year})` : ''}</p>
          </div>

          {/* Annual Goals Cards */}
          <Card className="border-none shadow-lg bg-white mb-8">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-semibold text-gray-800">Annual Goals - {year || new Date().getFullYear()}</CardTitle>
              <div className="text-sm text-gray-600">Key Annual Goals Based On Campaign Data</div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { name: "Clients Needed", value: metrics.clientsNeeded, color: "#ef4444" },
                  { name: "Monthly New Appointments Needed", value: metrics.monthlyNewAppointmentsNeeded, color: "#3b82f6" },
                  { name: "Annual Ideal Closing Prospects Needed", value: metrics.annualIdealClosingProspects, color: "#22c55e" },
                  { name: "Annual Total Prospects Necessary", value: metrics.annualTotalProspectsNecessary, color: "#8b5cf6" },
                ].map((goal, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-lg border border-gray-200 bg-gray-50"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className="p-2 rounded-lg"
                        style={{ backgroundColor: `${goal.color}20` }}
                      >
                        <div className="w-5 h-5 rounded" style={{ backgroundColor: goal.color }}></div>
                      </div>
                      <h3 className="text-sm font-semibold text-gray-700">{goal.name}</h3>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span
                        className="text-2xl font-extrabold"
                        style={{ color: goal.color }}
                      >
                        {goal.value.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Lead Sources Cards */}
          {data.campaigns && data.campaigns.length > 0 && (
            <Card className="border-none shadow-lg bg-white mb-8">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-semibold text-gray-800">Lead Sources - {year || new Date().getFullYear()}</CardTitle>
                <div className="text-sm text-gray-600">Campaign Lead Generation Goals</div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {data.campaigns.map((campaign, index) => {
                    const colors = ["#3b82f6", "#8b5cf6", "#f97316", "#ef4444", "#64748b", "#22c55e", "#eab308", "#ec4899"]
                    const color = colors[index % colors.length]
                    const annualLeads = (campaign.leads || 0) * 12
                    const monthlyLeads = campaign.leads || 0
                    const totalLeads = data.campaigns.reduce((sum, c) => sum + ((c.leads || 0) * 12), 0)
                    const percentage = totalLeads > 0 ? (annualLeads / totalLeads) * 100 : 0
                    
                    return (
                      <div
                        key={campaign.id || index}
                        className="p-4 rounded-lg border border-gray-200 bg-gray-50"
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: color }}
                          />
                          <h3 className="text-sm font-semibold text-gray-700 truncate">{campaign.name || `Campaign ${index + 1}`}</h3>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-baseline gap-2">
                            <span
                              className="text-2xl font-extrabold"
                              style={{ color: color }}
                            >
                              {annualLeads.toLocaleString()}
                            </span>
                            <span className="text-sm text-gray-600">leads</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span>{monthlyLeads.toLocaleString()}/month</span>
                            <span>•</span>
                            <span>{percentage.toFixed(1)}% of total</span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Client Metrics and Appointment Metrics */}
          <div className="grid gap-6 md:grid-cols-2 mb-8">
            <Card className="border-none shadow-lg bg-white">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-semibold text-gray-800">Client Metrics</CardTitle>
                <div className="text-sm text-gray-600">Key Client Performance Indicators</div>
              </CardHeader>
              <CardContent>
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b-2 border-gray-200 bg-gray-50">
                      <th className="text-left p-3 font-semibold text-gray-800">Metric</th>
                      <th className="text-right p-3 font-semibold text-gray-800">Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { metric: "Avg Annuity Size", value: formatCurrency(data.clientMetrics?.avg_annuity_size || 0) },
                      { metric: "Avg AUM Size", value: formatCurrency(data.clientMetrics?.avg_aum_size || 0) },
                      { metric: "Avg Net Worth Needed", value: formatCurrency(data.clientMetrics?.avg_net_worth_needed || 0) },
                      { metric: "Appointment Attrition", value: `${formatNumber(data.clientMetrics?.appointment_attrition || 0)}%` },
                      { metric: "Average Close Ratio", value: `${formatNumber(data.clientMetrics?.avg_close_ratio || 0)}%` },
                      { metric: "# of Annuity Closed", value: formatNumber(data.clientMetrics?.annuity_closed || 0) },
                      { metric: "# of AUM Accounts", value: formatNumber(data.clientMetrics?.aum_accounts || 0) },
                      { metric: "Clients Needed", value: formatNumber(metrics.clientsNeeded) },
                    ].map((item, index) => (
                      <tr key={index} className={index < 7 ? "border-b border-gray-100" : ""}>
                        <td className="p-3 font-medium text-gray-700">{item.metric}</td>
                        <td className="p-3 text-right text-gray-600">{item.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg bg-white">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-semibold text-gray-800">Appointment & Prospect Metrics</CardTitle>
                <div className="text-sm text-gray-600">Appointment And Prospect Tracking</div>
              </CardHeader>
              <CardContent>
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b-2 border-gray-200 bg-gray-50">
                      <th className="text-left p-3 font-semibold text-gray-800">Metric</th>
                      <th className="text-right p-3 font-semibold text-gray-800">Value</th>
                      <th className="text-left p-3 font-semibold text-gray-800">Metric</th>
                      <th className="text-right p-3 font-semibold text-gray-800">Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { metric: "Monthly Ideal Prospects", value: Math.ceil(metrics.calculatedMonthlyIdealProspects).toString(), metric2: "Total New Monthly Appointments Needed", value2: metrics.monthlyNewAppointmentsNeeded.toString() },
                      { metric: "Annual Ideal Closing Prospects Needed", value: metrics.annualIdealClosingProspects.toString(), metric2: "Annual Total Prospects Necessary", value2: metrics.annualTotalProspectsNecessary.toString() },
                      { metric: "Appointments Per Campaign", value: formatNumber(data.clientMetrics?.appointments_per_campaign || 0), metric2: "# of Campaigns Monthly", value2: formatNumber((data.clientMetrics?.appointments_per_campaign || 0) > 0 ? Math.ceil(metrics.monthlyNewAppointmentsNeeded / (data.clientMetrics?.appointments_per_campaign || 1)) : 0) },
                    ].map((item, index) => (
                      <tr key={index} className={index < 2 ? "border-b border-gray-100" : ""}>
                        <td className="p-3 font-medium text-gray-700">{item.metric}</td>
                        <td className="p-3 text-right text-gray-600">{item.value}</td>
                        <td className="p-3 font-medium text-gray-700">{item.metric2}</td>
                        <td className={`p-3 text-right ${item.metric2 === "Annual Total Prospects Necessary" ? "text-red-600 font-bold" : "text-gray-600"}`}>
                          {item.value2}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* PAGE 4: Campaigns and Income */}
        <div className="page-break">
          <div className="mb-6">
            <h2 className="text-2xl font-extrabold text-gray-800 mb-2">Annual Campaign Goals</h2>
            <p className="text-gray-600 mb-6">Your Campaign Goals For The Year{year ? ` (${year})` : ''}</p>
          </div>

          {/* Annual Campaign Goals Table */}
          <Card className="border-none shadow-lg bg-white mb-8">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-semibold text-gray-800">Annual Campaign Goals</CardTitle>
              <div className="text-sm text-gray-600">Your Annual Campaign Goals For The Year</div>
            </CardHeader>
            <CardContent>
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b-2 border-gray-200 bg-gray-50">
                    <th className="text-left p-4 font-semibold text-gray-800">Campaign Goal</th>
                    <th className="text-right p-4 font-semibold text-gray-800">Annual Target</th>
                    <th className="text-right p-4 font-semibold text-gray-800">Monthly Average</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { goal: "Total Annual Events", annual: Math.round(metrics.totalEvents), monthly: `${Math.round(metrics.totalEvents / 12).toLocaleString()} events/month` },
                    { goal: "Total Annual Leads", annual: Math.round(metrics.totalLeads), monthly: `${Math.round(metrics.totalLeads / 12).toLocaleString()} leads/month` },
                    { goal: "Total Annual Budget", annual: `$${Math.round(metrics.totalBudget).toLocaleString()}`, monthly: `$${Math.round(metrics.totalBudget / 12).toLocaleString()}/month` },
                    { goal: "Annual Appointments Goal", annual: Math.round(metrics.monthlyNewAppointmentsNeeded * 12), monthly: `${metrics.monthlyNewAppointmentsNeeded.toLocaleString()} appointments/month` },
                  ].map((row, index) => (
                    <tr key={index} className={index < 3 ? "border-b border-gray-100" : ""}>
                      <td className="p-4 font-medium text-gray-700">{row.goal}</td>
                      <td className="p-4 text-right font-semibold text-gray-800">{typeof row.annual === 'number' ? row.annual.toLocaleString() : row.annual}</td>
                      <td className="p-4 text-right text-gray-600">{row.monthly}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          {/* Individual Campaign Goals Table */}
          {data.campaigns && data.campaigns.length > 0 && (
            <Card className="border-none shadow-lg bg-white mb-8">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-semibold text-gray-800">Individual Campaign Goals</CardTitle>
                <div className="text-sm text-gray-600">Campaign goals that make up your annual targets</div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b-2 border-gray-200 bg-gray-50">
                        <th className="text-left p-4 font-semibold text-gray-800">Campaign Name</th>
                        <th className="text-right p-4 font-semibold text-gray-800">Monthly Events</th>
                        <th className="text-right p-4 font-semibold text-gray-800">Monthly Leads</th>
                        <th className="text-right p-4 font-semibold text-gray-800">Monthly Budget</th>
                        <th className="text-right p-4 font-semibold text-gray-800">Annual Budget</th>
                        <th className="text-right p-4 font-semibold text-gray-800">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.campaigns.map((campaign, index) => (
                        <tr key={campaign.id || index} className={index < data.campaigns.length - 1 ? "border-b border-gray-100" : ""}>
                          <td className="p-4 font-medium text-gray-700">{campaign.name || `Campaign ${index + 1}`}</td>
                          <td className="p-4 text-right text-gray-600">{campaign.events || 0}</td>
                          <td className="p-4 text-right text-gray-600">{campaign.leads || 0}</td>
                          <td className="p-4 text-right text-gray-600">${(campaign.budget || 0).toLocaleString()}</td>
                          <td className="p-4 text-right text-gray-600">${((campaign.budget || 0) * 12).toLocaleString()}</td>
                          <td className="p-4 text-right text-gray-600">{campaign.status || 'Planned'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Annual Campaign ROI */}
          <Card className="border-none shadow-lg bg-white mb-8">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-semibold text-gray-800">Annual Campaign ROI</CardTitle>
              <div className="text-sm text-gray-600">Return on investment metrics for annual campaigns</div>
            </CardHeader>
            <CardContent>
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b-2 border-gray-200 bg-gray-50">
                    <th className="text-left p-4 font-semibold text-gray-800">Metric</th>
                    <th className="text-right p-4 font-semibold text-gray-800">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { metric: "Cost Per Lead", value: `$${metrics.costPerLead.toFixed(2)}` },
                    { metric: "Cost Per Appointment", value: `$${metrics.costPerAppointment.toFixed(2)}` },
                    { metric: "Cost Per Client", value: `$${metrics.costPerClient.toFixed(2)}` },
                    { metric: "Lead to Appointment Ratio", value: `${metrics.leadToAppointmentRatio.toFixed(1)}%` },
                    { metric: "Appointment to Client Ratio", value: `${metrics.appointmentToClientRatio.toFixed(1)}%` },
                    { metric: "Marketing ROI", value: `${metrics.marketingROI.toFixed(1)}%` },
                  ].map((row, index) => (
                    <tr key={index} className={index < 5 ? "border-b border-gray-100" : ""}>
                      <td className="p-4 font-medium text-gray-700">{row.metric}</td>
                      <td className={`p-4 text-right ${row.metric === "Marketing ROI" ? (metrics.marketingROI >= 0 ? "text-green-600 font-semibold" : "text-red-600 font-semibold") : "text-gray-600"}`}>
                        {row.value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          {/* Income Breakdown */}
          {(() => {
            if (!data.businessGoals || !data.currentValues || !data.clientMetrics || !data.commissionRates) {
              return null
            }

            const businessGoalAmount = data.businessGoals.business_goal || 0
            const aumGoalAmount = (businessGoalAmount * (data.businessGoals.aum_goal_percentage || 0)) / 100
            const annuityGoalAmount = (businessGoalAmount * (data.businessGoals.annuity_goal_percentage || 0)) / 100
            const lifeTargetGoalAmount = (businessGoalAmount * (data.businessGoals.life_target_goal_percentage || 0)) / 100

            const annuityIncome = (annuityGoalAmount * (data.commissionRates.annuity_commission || 0)) / 100
            const aumIncome = (aumGoalAmount * (data.commissionRates.aum_commission || 0)) / 100
            const lifeIncome = (lifeTargetGoalAmount * (data.commissionRates.life_commission || 0)) / 100
            const trailIncome = ((data.currentValues.current_aum || 0) * (data.commissionRates.trail_income_percentage || 0)) / 100
            
            const clientsNeeded = Math.round(((data.clientMetrics.annuity_closed || 0) + (data.clientMetrics.aum_accounts || 0)) / 2)
            const planningFeesValue = (data.commissionRates.planning_fee_rate || 0) * clientsNeeded

            const incomeData = [
              { source: `Planning Fees (@ $${(data.commissionRates.planning_fee_rate || 0).toLocaleString()})`, amount: planningFeesValue, commission: "-", color: "#64748b" },
              { source: "Annuity", amount: annuityIncome, commission: `${data.commissionRates.annuity_commission || 0}%`, color: "#3b82f6" },
              { source: "AUM", amount: aumIncome, commission: `${data.commissionRates.aum_commission || 0}%`, color: "#f97316" },
              { source: "Life Production", amount: lifeIncome, commission: `${data.commissionRates.life_commission || 0}%`, color: "#a855f7" },
              { source: "Trail Income", amount: trailIncome, commission: `${data.commissionRates.trail_income_percentage || 0}%`, color: "#10b981" },
            ]

            const totalIncome = incomeData.reduce((sum, item) => sum + item.amount, 0)

            return (
              <Card className="border-none shadow-lg bg-white">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-semibold text-gray-800">Income Breakdown</CardTitle>
                  <div className="text-sm text-gray-600">Breakdown of income sources from annual goals</div>
                </CardHeader>
                <CardContent>
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b-2 border-gray-200 bg-gray-50">
                        <th className="text-left p-4 font-semibold text-gray-800">Income Source</th>
                        <th className="text-right p-4 font-semibold text-gray-800">Commission Rate</th>
                        <th className="text-right p-4 font-semibold text-gray-800">Annual Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {incomeData.map((item, index) => (
                        <tr key={index} className={index < incomeData.length - 1 ? "border-b border-gray-100" : ""}>
                          <td className="p-4 font-medium text-gray-700">{item.source}</td>
                          <td className="p-4 text-right text-gray-600">{item.commission}</td>
                          <td className="p-4 text-right font-semibold text-gray-800">{formatCurrency(item.amount)}</td>
                        </tr>
                      ))}
                      <tr className="border-t-2 border-gray-300 bg-gray-50">
                        <td className="p-4 font-bold text-gray-800">Total Annual Income</td>
                        <td className="p-4 text-right"></td>
                        <td className="p-4 text-right font-bold text-gray-800 text-lg">{formatCurrency(totalIncome)}</td>
                      </tr>
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            )
          })()}
        </div>
      </div>
    </div>
  )
}
