"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { behaviorScorecardService, type ScorecardRole, type ScorecardMetric } from '@/lib/behavior-scorecard'
import { Save, Calendar, Calculator, Plus, Trash2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { ScrollArea } from '@/components/ui/scroll-area'

interface DataEntryFormProps {
  roleName: ScorecardRole
  roleId: string
  metrics: ScorecardMetric[]
  year: number
  month: number
  onSave?: () => void
}

export function DataEntryForm({ roleName, roleId, metrics, year, month, onSave }: DataEntryFormProps) {
  const { toast } = useToast()
  const [weekData, setWeekData] = useState<Record<string, Record<number, number>>>({})
  const [goalData, setGoalData] = useState<Record<string, number>>({})
  const [saving, setSaving] = useState(false)

  // Initialize week data structure and goals
  useEffect(() => {
    const initialData: Record<string, Record<number, number>> = {}
    const initialGoals: Record<string, number> = {}
    metrics.forEach(metric => {
      initialData[metric.id] = {}
      initialGoals[metric.id] = metric.goalValue
      for (let week = 1; week <= 4; week++) {
        initialData[metric.id][week] = 0
      }
    })
    setWeekData(initialData)
    setGoalData(initialGoals)

    // Load existing data
    loadWeeklyData()
  }, [metrics, year])

  const loadWeeklyData = async () => {
    for (const metric of metrics) {
      const result = await behaviorScorecardService.getWeeklyData(metric.id, year)
      if (result.success && result.data) {
        setWeekData(prev => {
          const updated = { ...prev }
          updated[metric.id] = {}
          result.data!.forEach(wd => {
            updated[metric.id][wd.weekNumber] = wd.actualValue
          })
          return updated
        })
      }
    }
  }

  const handleWeekValueChange = (metricId: string, week: number, value: string) => {
    const numValue = parseFloat(value) || 0
    setWeekData(prev => ({
      ...prev,
      [metricId]: {
        ...prev[metricId],
        [week]: numValue,
      },
    }))
  }

  const handleGoalChange = (metricId: string, value: string) => {
    const numValue = parseFloat(value) || 0
    setGoalData(prev => ({
      ...prev,
      [metricId]: numValue,
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      // Save goal values
      for (const metric of metrics) {
        const newGoalValue = goalData[metric.id] ?? metric.goalValue
        if (newGoalValue !== metric.goalValue) {
          await behaviorScorecardService.updateMetricGoal(metric.id, newGoalValue)
        }
      }

      // Save weekly data
      for (const metric of metrics) {
        for (let week = 1; week <= 4; week++) {
          const value = weekData[metric.id]?.[week] || 0
          // Save even if 0, to allow clearing values
          await behaviorScorecardService.saveWeeklyData(metric.id, week, year, value)
        }
      }

      // Calculate monthly summary
      await behaviorScorecardService.calculateMonthlySummary(month, year)

      toast({
        title: "Data saved successfully",
        description: `Goals and weekly data for ${roleName} have been saved.`,
      })

      if (onSave) {
        onSave()
      }
    } catch (error) {
      toast({
        title: "Error saving data",
        description: "Failed to save data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const formatValue = (value: number, metricType: string) => {
    if (metricType === 'currency') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value)
    }
    if (metricType === 'percentage') {
      return `${value}%`
    }
    if (metricType === 'time') {
      return `${value} ${value === 1 ? 'day' : 'days'}`
    }
    if (metricType === 'rating_1_5' || metricType === 'rating_scale') {
      return value.toFixed(1)
    }
    return value.toString()
  }

  const calculateTotal = (metricId: string) => {
    const data = weekData[metricId] || {}
    return Object.values(data).reduce((sum, val) => sum + val, 0)
  }

  const calculateAverage = (metricId: string) => {
    const data = weekData[metricId] || {}
    const values = Object.values(data).filter(v => v > 0)
    if (values.length === 0) return 0
    return values.reduce((sum, val) => sum + val, 0) / values.length
  }

  const getMetricType = (metricId: string): string => {
    const metric = metrics.find(m => m.id === metricId)
    return metric?.metricType || 'count'
  }

  const getInputStep = (metricType: string) => {
    if (metricType === 'currency') return '100'
    if (metricType === 'rating_1_5' || metricType === 'rating_scale') return '0.1'
    return '1'
  }

  const getInputMax = (metricType: string) => {
    if (metricType === 'rating_1_5' || metricType === 'rating_scale') return '5'
    return undefined
  }

  return (
    <Card className="bg-black border-gray-800 shadow-lg">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
              <Calendar className="h-5 w-5 text-m8bs-blue" />
              {roleName} - Data Entry Form
            </CardTitle>
            <CardDescription className="text-m8bs-muted mt-1">
              Enter weekly data for {new Date(year, month - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </CardDescription>
          </div>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Saving...' : 'Save Data'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="w-full">
          <div className="rounded-md border border-m8bs-border">
            <Table>
              <TableHeader>
                <TableRow className="bg-m8bs-card-alt hover:bg-m8bs-card-alt">
                  <TableHead className="w-[250px] text-white font-semibold sticky left-0 bg-m8bs-card-alt z-10 border-r border-m8bs-border">
                    Monthly Statistics
                  </TableHead>
                  <TableHead className="text-center text-white font-semibold min-w-[120px]">
                    Goal
                  </TableHead>
                  <TableHead className="text-center text-white font-semibold min-w-[120px]">
                    Week 1
                  </TableHead>
                  <TableHead className="text-center text-white font-semibold min-w-[120px]">
                    Week 2
                  </TableHead>
                  <TableHead className="text-center text-white font-semibold min-w-[120px]">
                    Week 3
                  </TableHead>
                  <TableHead className="text-center text-white font-semibold min-w-[120px]">
                    Week 4
                  </TableHead>
                  <TableHead className="text-center text-white font-semibold min-w-[120px]">
                    Total
                  </TableHead>
                  {metrics.some(m => m.metricType === 'rating_1_5' || m.metricType === 'rating_scale') && (
                    <TableHead className="text-center text-white font-semibold min-w-[120px]">
                      Average
                    </TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {metrics.map((metric, index) => {
                  const total = calculateTotal(metric.id)
                  const average = calculateAverage(metric.id)
                  const showAverage = metric.metricType === 'rating_1_5' || metric.metricType === 'rating_scale'
                  
                  return (
                    <TableRow 
                      key={metric.id} 
                      className={index % 2 === 0 ? 'bg-m8bs-card-alt/30' : 'bg-m8bs-card-alt/50'}
                    >
                      <TableCell className="font-medium text-white sticky left-0 bg-inherit z-10 border-r border-m8bs-border">
                        <div>
                          <div className="font-semibold">{metric.metricName}</div>
                          {metric.isInverted && (
                            <div className="text-xs text-m8bs-muted">(lower is better)</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="p-2">
                        <Input
                          type="number"
                          step={getInputStep(metric.metricType)}
                          min="0"
                          value={goalData[metric.id] ?? metric.goalValue}
                          onChange={(e) => handleGoalChange(metric.id, e.target.value)}
                          className="w-full text-center bg-m8bs-card-alt border-m8bs-border text-white focus:border-m8bs-blue h-9"
                          placeholder="0"
                        />
                      </TableCell>
                      {[1, 2, 3, 4].map(week => (
                        <TableCell key={week} className="p-2">
                          <Input
                            type="number"
                            step={getInputStep(metric.metricType)}
                            min="0"
                            max={getInputMax(metric.metricType)}
                            value={weekData[metric.id]?.[week] || 0}
                            onChange={(e) => handleWeekValueChange(metric.id, week, e.target.value)}
                            className="w-full text-center bg-m8bs-card-alt border-m8bs-border text-white focus:border-m8bs-blue h-9"
                            placeholder="0"
                          />
                        </TableCell>
                      ))}
                      <TableCell className="text-center font-semibold text-white">
                        {formatValue(total, metric.metricType)}
                      </TableCell>
                      {showAverage && (
                        <TableCell className="text-center font-semibold text-white">
                          {average.toFixed(1)}
                        </TableCell>
                      )}
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </ScrollArea>

        <div className="mt-6 p-4 bg-m8bs-card-alt rounded-lg border border-m8bs-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calculator className="h-4 w-4 text-m8bs-muted" />
              <span className="text-sm text-m8bs-muted">
                Enter Values For Each Week. Totals And Averages Are Calculated Automatically.
              </span>
            </div>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Saving...' : 'Save All Data'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
