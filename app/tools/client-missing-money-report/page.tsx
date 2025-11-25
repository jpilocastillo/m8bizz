"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell, PieChart, Pie, ResponsiveContainer as PieResponsiveContainer, Legend as PieLegend, Tooltip as PieTooltip } from 'recharts'
import { useAuth } from "@/components/auth-provider"
import { createClient } from "@/lib/supabase/client"
import { missingMoneyService } from "@/lib/missing-money"
import { DollarSign, Download, FileText, Calculator, Save, Edit2 } from "lucide-react"

export interface CostCenter {
  id: string
  name: string
  current: number
  proposed: number
  color: string
}

export interface MissingMoneyData {
  costCenters: CostCenter[]
  oneYearTotal: number
  fiveYearTotal: number
  tenYearTotal: number
}

// Color palette matching the screenshot
const costCenterColors = [
  "#16a34a", // Green - Taxes
  "#3b82f6", // Blue - Investment Management Fees
  "#dc2626", // Red - Investment Performance
  "#9333ea", // Purple - Life Insurance
  "#a3a3a3", // Gray - Long Term Care
  "#f97316", // Orange - Cash/CD Money
  "#6b7280", // Slate - Financial Planning Fee
]

export default function ClientMissingMoneyReportPage() {
  const { user } = useAuth()
  const [data, setData] = useState<MissingMoneyData>({
    costCenters: [],
    oneYearTotal: 0,
    fiveYearTotal: 0,
    tenYearTotal: 0
  })
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [editMode, setEditMode] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function fetchData() {
      if (!user) {
        setLoading(false)
        return
      }
      
      // Fetch user profile
      const supabase = createClient()
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()
      setProfile(profileData)

      // Define default cost centers from screenshot
      const defaultCostCenters: CostCenter[] = [
        {
          id: "taxes",
          name: "Taxes",
          current: 0,
          proposed: 0,
          color: costCenterColors[0]
        },
        {
          id: "investment-management-fees",
          name: "Investment Management Fees",
          current: 0,
          proposed: 0,
          color: costCenterColors[1]
        },
        {
          id: "investment-performance",
          name: "Investment Performance",
          current: 0,
          proposed: 0,
          color: costCenterColors[2]
        },
        {
          id: "life-insurance",
          name: "Life Insurance",
          current: 0,
          proposed: 0,
          color: costCenterColors[3]
        },
        {
          id: "long-term-care",
          name: "Long Term Care",
          current: 0,
          proposed: 0,
          color: costCenterColors[4]
        },
        {
          id: "cash-cd-money",
          name: "Cash/CD Money 0%",
          current: 0,
          proposed: 0,
          color: costCenterColors[5]
        },
        {
          id: "financial-planning-fee",
          name: "Financial Planning Fee",
          current: 0,
          proposed: 0,
          color: costCenterColors[6]
        }
      ]

      // Fetch missing money report data
      const result = await missingMoneyService.getMissingMoneyReport()
      if (result.success && result.data && result.data.costCenters && result.data.costCenters.length > 0) {
        // Merge existing data with default cost centers
        // For each default cost center, check if it exists in the data, otherwise use default
        const mergedCostCenters = defaultCostCenters.map(defaultCenter => {
          const existingCenter = result.data!.costCenters.find(
            (cc: CostCenter) => cc.name === defaultCenter.name
          )
          return existingCenter || defaultCenter
        })
        
        setData({
          costCenters: mergedCostCenters,
          oneYearTotal: result.data.oneYearTotal || 0,
          fiveYearTotal: result.data.fiveYearTotal || 0,
          tenYearTotal: result.data.tenYearTotal || 0
        })
      } else {
        // Initialize with default cost centers
        setData({
          costCenters: defaultCostCenters,
          oneYearTotal: 0,
          fiveYearTotal: 0,
          tenYearTotal: 0
        })
      }
      setLoading(false)
    }
    fetchData()
  }, [user])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
  }

  const handleInputChange = (id: string, field: 'current' | 'proposed', value: string) => {
    const numericValue = parseFloat(value) || 0
    setData(prev => ({
      ...prev,
      costCenters: prev.costCenters.map(center => {
        if (center.id === id) {
          let updatedCenter = { ...center, [field]: numericValue }
          
          // Special handling for Investment Performance: Proposed = -Current
          if (center.name === "Investment Performance") {
            if (field === 'current') {
              updatedCenter.proposed = -numericValue
            } else {
              updatedCenter.current = -numericValue
            }
          }
          
          // Special handling for Cash/CD Money: Proposed = Current * 0.0365
          if (center.name === "Cash/CD Money 0%") {
            if (field === 'current') {
              updatedCenter.proposed = numericValue * 0.0365
            }
            // If proposed is changed, calculate current (though this is less common)
          }
          
          return updatedCenter
        }
        return center
      })
    }))
  }

  const handleSave = async () => {
    if (!user) return
    
    setSaving(true)
    try {
      // Recalculate totals before saving
      const oneYear = (data.costCenters || []).reduce((sum, center) => {
        return sum + calculateDifference(center)
      }, 0)
      
      const fiveYear = (data.costCenters || []).reduce((sum, center) => {
        const oneYearDiff = calculateDifference(center)
        const fiveYearDiff = center.name === "Financial Planning Fee" ? oneYearDiff : oneYearDiff * 5
        return sum + fiveYearDiff
      }, 0)
      
      const tenYear = (data.costCenters || []).reduce((sum, center) => {
        const oneYearDiff = calculateDifference(center)
        const tenYearDiff = center.name === "Financial Planning Fee" ? oneYearDiff : oneYearDiff * 10
        return sum + tenYearDiff
      }, 0)

      const result = await missingMoneyService.saveMissingMoneyReport({
        costCenters: data.costCenters,
        oneYearTotal: oneYear,
        fiveYearTotal: fiveYear,
        tenYearTotal: tenYear
      })

      if (result.success) {
        setEditMode(false)
      } else {
        console.error('Error saving:', result.error)
        alert('Failed to save data: ' + (result.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error saving missing money report:', error)
      alert('Failed to save data')
    } finally {
      setSaving(false)
    }
  }

  const calculateDifference = (center: CostCenter) => {
    // For Investment Performance: Proposed = -Current, Difference = Proposed
    if (center.name === "Investment Performance") {
      return center.proposed
    }
    // For Cash/CD Money: Proposed = Current * 0.0365, Difference = Proposed
    if (center.name === "Cash/CD Money 0%") {
      return center.proposed
    }
    // For Financial Planning Fee: Difference = Proposed (negative value)
    if (center.name === "Financial Planning Fee") {
      return center.proposed
    }
    // For others (Taxes, Investment Management Fees, Life Insurance, Long Term Care): 
    // Difference = Current - Proposed (savings)
    return center.current - center.proposed
  }

  // Calculate totals
  const oneYearTotal = (data.costCenters || []).reduce((sum, center) => {
    return sum + calculateDifference(center)
  }, 0)
  
  const fiveYearTotal = (data.costCenters || []).reduce((sum, center) => {
    const oneYearDiff = calculateDifference(center)
    // Financial Planning Fee doesn't multiply by years
    const fiveYearDiff = center.name === "Financial Planning Fee" ? oneYearDiff : oneYearDiff * 5
    return sum + fiveYearDiff
  }, 0)
  
  const tenYearTotal = (data.costCenters || []).reduce((sum, center) => {
    const oneYearDiff = calculateDifference(center)
    // Financial Planning Fee doesn't multiply by years
    const tenYearDiff = center.name === "Financial Planning Fee" ? oneYearDiff : oneYearDiff * 10
    return sum + tenYearDiff
  }, 0)

  // Chart data for opportunity costs
  const opportunityCostsData = [
    {
      name: "1 Year Missing Money",
      value: oneYearTotal,
      color: "#16a34a"
    },
    {
      name: "5 Years Missing Money",
      value: fiveYearTotal,
      color: "#3b82f6"
    },
    {
      name: "10 Years Missing Money",
      value: tenYearTotal,
      color: "#9333ea"
    }
  ]

  // Pie chart data
  const pieChartData = (data.costCenters || []).map(center => {
    const difference = calculateDifference(center)
    return {
      name: center.name,
      value: Math.abs(difference),
      difference: difference,
      color: center.color
    }
  }).filter(item => Math.abs(item.value) > 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-m8bs-blue mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading client missing money report...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-m8bs-blue to-m8bs-blue-dark p-3 rounded-xl">
            <DollarSign className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Client Missing Money Report</h1>
            <p className="text-m8bs-muted mt-1">
              Financial Opportunity Analysis - {profile?.company || "Your Firm"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={() => setEditMode(!editMode)}
            className="flex items-center gap-2 text-blue-300 border-m8bs-border/50 hover:bg-m8bs-card-alt/50"
          >
            {editMode ? (
              <>
                <FileText className="h-4 w-4" />
                View Report
              </>
            ) : (
              <>
                <Edit2 className="h-4 w-4" />
                Edit Values
              </>
            )}
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Edit Form */}
      {editMode && (
        <Card className="bg-m8bs-card border-m8bs-border shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Calculator className="h-5 w-5" />
              Enter Cost Center Values
            </CardTitle>
            <CardDescription className="text-m8bs-muted">
              Enter current and proposed values for each cost center. Some values are calculated automatically.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4">
              {data.costCenters && data.costCenters.length > 0 ? (
                data.costCenters.map((center) => {
                  const oneYearDiff = calculateDifference(center)
                  const fiveYearDiff = center.name === "Financial Planning Fee" ? oneYearDiff : oneYearDiff * 5
                  const tenYearDiff = center.name === "Financial Planning Fee" ? oneYearDiff : oneYearDiff * 10
                  
                  return (
                    <Card key={center.id} className="p-4 bg-m8bs-card-alt/70 border-m8bs-border/50">
                      <div className="flex items-center gap-3 mb-4">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: center.color }}
                        />
                        <h3 className="font-semibold text-lg text-blue-300">{center.name}</h3>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor={`${center.id}-current`} className="text-m8bs-muted">
                            Current Numbers
                            {center.name === "Investment Performance" && (
                              <span className="text-xs text-yellow-400 block">(Negative value)</span>
                            )}
                          </Label>
                          <Input
                            id={`${center.id}-current`}
                            type="number"
                            value={center.current}
                            onChange={(e) => handleInputChange(center.id, 'current', e.target.value)}
                            className="text-right bg-m8bs-card-alt/50 border-m8bs-border/50 text-white focus:border-m8bs-blue"
                          />
                          {center.name === "Cash/CD Money 0%" && (
                            <p className="text-xs text-m8bs-muted">
                              Proposed will be calculated as Current × 3.65%
                            </p>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor={`${center.id}-proposed`} className="text-m8bs-muted">
                            Proposed Numbers
                            {center.name === "Investment Performance" && (
                              <span className="text-xs text-yellow-400 block">(Auto: -Current)</span>
                            )}
                            {center.name === "Cash/CD Money 0%" && (
                              <span className="text-xs text-yellow-400 block">(Auto: Current × 3.65%)</span>
                            )}
                          </Label>
                          <Input
                            id={`${center.id}-proposed`}
                            type="number"
                            value={center.proposed}
                            onChange={(e) => handleInputChange(center.id, 'proposed', e.target.value)}
                            className="text-right bg-m8bs-card-alt/50 border-m8bs-border/50 text-white focus:border-m8bs-blue"
                            disabled={center.name === "Investment Performance" || center.name === "Cash/CD Money 0%"}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label className="text-m8bs-muted">1 Year Difference</Label>
                          <div className={`p-2 rounded-md text-right font-semibold ${
                            oneYearDiff >= 0 
                              ? 'bg-green-900/50 text-green-400 border border-green-700' 
                              : 'bg-red-900/50 text-red-400 border border-red-700'
                          }`}>
                            {formatCurrency(oneYearDiff)}
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="text-right">
                              <span className="text-m8bs-muted">5 Year: </span>
                              <span className={`font-semibold ${
                                fiveYearDiff >= 0 ? 'text-green-400' : 'text-red-400'
                              }`}>
                                {formatCurrency(fiveYearDiff)}
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="text-m8bs-muted">10 Year: </span>
                              <span className={`font-semibold ${
                                tenYearDiff >= 0 ? 'text-green-400' : 'text-red-400'
                              }`}>
                                {formatCurrency(tenYearDiff)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  )
                })
              ) : (
                <Card className="p-8 bg-m8bs-card-alt/70 border-m8bs-border/50 border-dashed">
                  <div className="text-center text-m8bs-muted">
                    <p>No cost centers available.</p>
                  </div>
                </Card>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-m8bs-border">
              <Button 
                variant="outline" 
                onClick={() => setEditMode(false)}
                className="border-m8bs-border/50 text-blue-300 hover:bg-m8bs-card-alt/50"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSave} 
                disabled={saving}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
              >
                <Save className="h-4 w-4" />
                {saving ? "Saving..." : "Save Values"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Charts and Table - Only show when not in edit mode */}
      {!editMode && (
        <>
          {/* Pie Chart - Cost Breakdown */}
          <Card className="bg-m8bs-card border-m8bs-border shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl text-white">Cost Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96">
            <PieResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <PieTooltip 
                  formatter={(value: any) => formatCurrency(value)}
                  contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                />
                <PieLegend 
                  verticalAlign="top"
                  height={36}
                  formatter={(value: any, entry: any) => (
                    <span style={{ color: entry.color }}>{value}</span>
                  )}
                />
              </PieChart>
            </PieResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Opportunity Costs Chart */}
      <Card className="bg-m8bs-card border-m8bs-border shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl text-white">1, 5 and 10 Year Opportunity Costs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={opportunityCostsData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: '#9CA3AF', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fill: '#9CA3AF', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={formatCurrency}
                />
                <Tooltip 
                  formatter={(value: any) => formatCurrency(value)}
                  contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                />
                <Legend />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {opportunityCostsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Cost Analysis Table */}
      <Card className="bg-m8bs-card border-m8bs-border shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl text-white">COST ANALYSIS</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-blue-600/20">
                  <TableHead className="font-semibold text-white">Cost Center</TableHead>
                  <TableHead className="text-right font-semibold text-white">Current Numbers</TableHead>
                  <TableHead className="text-right font-semibold text-white">Proposed Numbers</TableHead>
                  <TableHead className="text-right font-semibold text-white">1 Year Difference</TableHead>
                  <TableHead className="text-right font-semibold text-white">5 Year Difference</TableHead>
                  <TableHead className="text-right font-semibold text-white">10 Year Difference</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.costCenters && data.costCenters.length > 0 ? (
                  data.costCenters.map((center) => {
                    const oneYearDiff = calculateDifference(center)
                    // Financial Planning Fee doesn't multiply by years
                    const fiveYearDiff = center.name === "Financial Planning Fee" ? oneYearDiff : oneYearDiff * 5
                    const tenYearDiff = center.name === "Financial Planning Fee" ? oneYearDiff : oneYearDiff * 10
                    
                    return (
                      <TableRow key={center.id} className="border-m8bs-border">
                        <TableCell className="font-medium text-white">
                          {center.name}
                        </TableCell>
                        <TableCell className="text-right text-white">
                          {formatCurrency(center.current)}
                        </TableCell>
                        <TableCell className="text-right text-white">
                          {formatCurrency(center.proposed)}
                        </TableCell>
                        <TableCell className={`text-right font-semibold ${
                          oneYearDiff >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {formatCurrency(oneYearDiff)}
                        </TableCell>
                        <TableCell className={`text-right font-semibold ${
                          fiveYearDiff >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {formatCurrency(fiveYearDiff)}
                        </TableCell>
                        <TableCell className={`text-right font-semibold ${
                          tenYearDiff >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {formatCurrency(tenYearDiff)}
                        </TableCell>
                      </TableRow>
                    )
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      No cost centers available. Please add data in the Missing Money Report tool.
                    </TableCell>
                  </TableRow>
                )}
                <TableRow className="border-t-2 border-m8bs-border bg-m8bs-card-alt">
                  <TableCell className="font-bold text-lg text-white">Total</TableCell>
                  <TableCell className="text-right text-white"></TableCell>
                  <TableCell className="text-right font-semibold text-white">
                    {formatCurrency((data.costCenters || []).reduce((sum, c) => sum + c.proposed, 0))}
                  </TableCell>
                  <TableCell className={`text-right font-bold text-lg ${
                    oneYearTotal >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {formatCurrency(oneYearTotal)}
                  </TableCell>
                  <TableCell className={`text-right font-bold text-lg ${
                    fiveYearTotal >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {formatCurrency(fiveYearTotal)}
                  </TableCell>
                  <TableCell className={`text-right font-bold text-lg ${
                    tenYearTotal >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {formatCurrency(tenYearTotal)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
        </>
      )}
    </div>
  )
}

