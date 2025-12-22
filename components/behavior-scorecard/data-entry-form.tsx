"use client"

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { behaviorScorecardService, type ScorecardRole, type ScorecardMetric } from '@/lib/behavior-scorecard'
import { Save, Calendar, Calculator, Plus, Trash2, TrendingUp, TrendingDown, AlertCircle, CheckCircle2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

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
  const [monthlyData, setMonthlyData] = useState<Record<string, number>>({})
  const [goalData, setGoalData] = useState<Record<string, number>>({})
  const [monthlyDataInput, setMonthlyDataInput] = useState<Record<string, string>>({})
  const [goalDataInput, setGoalDataInput] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  const loadMonthlyData = useCallback(async () => {
    for (const metric of metrics) {
      // Load monthly data from week 1 (where we store monthly values)
      const result = await behaviorScorecardService.getWeeklyData(metric.id, year)
      if (result.success && result.data) {
        // Find week 1 data for this month (we use week 1 to store monthly value)
        const week1Data = result.data.find(wd => wd.weekNumber === 1)
        if (week1Data) {
          setMonthlyData(prev => ({
            ...prev,
            [metric.id]: week1Data.actualValue,
          }))
        }
      }
    }
  }, [metrics, year])

  // Initialize monthly data structure and goals
  useEffect(() => {
    const initialData: Record<string, number> = {}
    const initialGoals: Record<string, number> = {}
    const initialDataInput: Record<string, string> = {}
    const initialGoalsInput: Record<string, string> = {}
    metrics.forEach(metric => {
      initialData[metric.id] = 0
      initialGoals[metric.id] = metric.goalValue
      initialDataInput[metric.id] = ''
      initialGoalsInput[metric.id] = metric.goalValue.toString()
    })
    setMonthlyData(initialData)
    setGoalData(initialGoals)
    setMonthlyDataInput(initialDataInput)
    setGoalDataInput(initialGoalsInput)

    // Load existing data
    loadMonthlyData()
  }, [metrics, year, month, loadMonthlyData])

  // Update input values when monthly data is loaded
  useEffect(() => {
    setMonthlyDataInput(prev => {
      const updated = { ...prev }
      metrics.forEach(metric => {
        const value = monthlyData[metric.id]
        if (value !== undefined && value !== null) {
          updated[metric.id] = value.toString()
        }
      })
      return updated
    })
  }, [monthlyData, metrics])

  const handleMonthlyValueChange = (metricId: string, value: string) => {
    // Allow empty string for easier editing
    setMonthlyDataInput(prev => ({
      ...prev,
      [metricId]: value,
    }))
    
    // Update numeric value only if value is not empty
    const numValue = value === '' ? 0 : parseFloat(value) || 0
    setMonthlyData(prev => ({
      ...prev,
      [metricId]: numValue,
    }))
  }

  const handleGoalChange = (metricId: string, value: string) => {
    // Allow empty string for easier editing
    setGoalDataInput(prev => ({
      ...prev,
      [metricId]: value,
    }))
    
    // Update numeric value only if value is not empty
    const numValue = value === '' ? 0 : parseFloat(value) || 0
    setGoalData(prev => ({
      ...prev,
      [metricId]: numValue,
    }))
  }

  const handleMonthlyValueBlur = (metricId: string) => {
    // When field loses focus, ensure we have a valid number
    const currentInput = monthlyDataInput[metricId] || ''
    if (currentInput === '' || isNaN(parseFloat(currentInput))) {
      setMonthlyDataInput(prev => ({
        ...prev,
        [metricId]: '0',
      }))
      setMonthlyData(prev => ({
        ...prev,
        [metricId]: 0,
      }))
    } else {
      // Normalize the input value
      const numValue = parseFloat(currentInput) || 0
      setMonthlyDataInput(prev => ({
        ...prev,
        [metricId]: numValue.toString(),
      }))
    }
  }

  const handleGoalBlur = (metricId: string) => {
    // When field loses focus, ensure we have a valid number
    const currentInput = goalDataInput[metricId] || ''
    if (currentInput === '' || isNaN(parseFloat(currentInput))) {
      const defaultValue = goalData[metricId] || 0
      setGoalDataInput(prev => ({
        ...prev,
        [metricId]: defaultValue.toString(),
      }))
    } else {
      // Normalize the input value
      const numValue = parseFloat(currentInput) || 0
      setGoalDataInput(prev => ({
        ...prev,
        [metricId]: numValue.toString(),
      }))
    }
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

      // Save monthly data (store in week 1, set weeks 2-4 to 0)
      for (const metric of metrics) {
        const monthlyValue = monthlyData[metric.id] || 0
        // Save monthly value in week 1
        await behaviorScorecardService.saveWeeklyData(metric.id, 1, year, monthlyValue)
        // Clear weeks 2-4 to indicate this is monthly data
        for (let week = 2; week <= 4; week++) {
          await behaviorScorecardService.saveWeeklyData(metric.id, week, year, 0)
        }
      }

      // Calculate monthly summary
      await behaviorScorecardService.calculateMonthlySummary(month, year)

      toast({
        title: "Data saved successfully",
        description: `Goals and monthly data for ${roleName} have been saved.`,
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

  const calculateProgress = (metricId: string): number => {
    const actual = monthlyData[metricId] || 0
    const goal = goalData[metricId] || 0
    if (goal === 0) return 0
    const metric = metrics.find(m => m.id === metricId)
    if (metric?.isInverted) {
      return Math.min(100, (goal / actual) * 100)
    }
    return Math.min(100, (actual / goal) * 100)
  }

  const getProgressColor = (progress: number): string => {
    if (progress >= 90) return 'bg-green-500'
    if (progress >= 80) return 'bg-blue-500'
    if (progress >= 70) return 'bg-yellow-500'
    if (progress >= 60) return 'bg-orange-500'
    return 'bg-red-500'
  }

  const getStatusIcon = (metricId: string) => {
    const progress = calculateProgress(metricId)
    if (progress >= 90) return <CheckCircle2 className="h-4 w-4 text-green-400" />
    if (progress >= 70) return <TrendingUp className="h-4 w-4 text-yellow-400" />
    return <AlertCircle className="h-4 w-4 text-red-400" />
  }

  const hasUnsavedChanges = () => {
    return metrics.some(metric => {
      const currentGoal = goalData[metric.id] ?? metric.goalValue
      const currentValue = monthlyData[metric.id] ?? 0
      return currentGoal !== metric.goalValue || currentValue !== 0
    })
  }

  const getMonthlyValue = (metricId: string) => {
    return monthlyData[metricId] || 0
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
    <Card className="bg-m8bs-card border-m8bs-card-alt shadow-lg">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl text-white flex items-center gap-2">
              <Calendar className="h-5 w-5 text-m8bs-blue" />
              {roleName} - Data Entry Form
            </CardTitle>
            <CardDescription className="text-m8bs-muted">
              Enter Monthly Data For {new Date(year, month - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </CardDescription>
          </div>
          {hasUnsavedChanges() && (
            <Badge variant="outline" className="border-yellow-500 text-yellow-400">
              Unsaved Changes
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <ScrollArea className="w-full max-h-[600px]">
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
                    Monthly Value
                  </TableHead>
                  <TableHead className="text-center text-white font-semibold min-w-[150px]">
                    Progress
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {metrics.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-m8bs-muted py-8">
                      No metrics available. Add metrics in Settings.
                    </TableCell>
                  </TableRow>
                ) : (
                  metrics.map((metric, index) => {
                    const monthlyValue = getMonthlyValue(metric.id)
                    const progress = calculateProgress(metric.id)
                    const goalValue = goalData[metric.id] ?? metric.goalValue
                    
                    return (
                      <TableRow 
                        key={metric.id} 
                        className={`${index % 2 === 0 ? 'bg-m8bs-card-alt/30' : 'bg-m8bs-card-alt/50'} hover:bg-m8bs-card-alt/70 transition-colors`}
                      >
                        <TableCell className="font-medium text-white sticky left-0 bg-inherit z-10 border-r border-m8bs-border">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(metric.id)}
                            <div>
                              <div className="font-semibold">{metric.metricName}</div>
                              <div className="text-xs text-m8bs-muted flex items-center gap-1">
                                {metric.metricType}
                                {metric.isInverted && (
                                  <Badge variant="outline" className="text-xs px-1 py-0 border-orange-500/50 text-orange-400">
                                    Inverted
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="p-2">
                          <Input
                            type="text"
                            inputMode="decimal"
                            step={getInputStep(metric.metricType)}
                            min="0"
                            value={goalDataInput[metric.id] ?? goalValue.toString()}
                            onChange={(e) => {
                              const value = e.target.value
                              if (value === '' || /^\d*\.?\d*$/.test(value)) {
                                handleGoalChange(metric.id, value)
                              }
                            }}
                            onBlur={() => handleGoalBlur(metric.id)}
                            className="w-full text-center bg-m8bs-card border-m8bs-border text-white focus:border-m8bs-blue focus:ring-m8bs-blue/20 transition-colors h-9"
                            placeholder="0"
                          />
                        </TableCell>
                        <TableCell className="p-2">
                          <Input
                            type="text"
                            inputMode="decimal"
                            step={getInputStep(metric.metricType)}
                            min="0"
                            max={getInputMax(metric.metricType)}
                            value={monthlyDataInput[metric.id] ?? monthlyValue.toString()}
                            onChange={(e) => {
                              const value = e.target.value
                              if (value === '' || /^\d*\.?\d*$/.test(value)) {
                                handleMonthlyValueChange(metric.id, value)
                              }
                            }}
                            onBlur={() => handleMonthlyValueBlur(metric.id)}
                            className="w-full text-center bg-m8bs-card border-m8bs-border text-white focus:border-m8bs-blue focus:ring-m8bs-blue/20 transition-colors h-9"
                            placeholder="0"
                          />
                        </TableCell>
                        <TableCell className="p-2">
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="text-m8bs-muted">Progress</span>
                              <span className={`font-semibold ${
                                progress >= 90 ? 'text-green-400' :
                                progress >= 70 ? 'text-yellow-400' :
                                'text-red-400'
                              }`}>
                                {progress.toFixed(1)}%
                              </span>
                            </div>
                            <Progress value={progress} className="h-2" />
                            <div className="text-xs text-m8bs-muted text-center">
                              {formatValue(monthlyValue, metric.metricType)} / {formatValue(goalValue, metric.metricType)}
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </ScrollArea>

        <CardFooter className="flex justify-between items-center pt-4 border-t border-m8bs-border">
          <div className="text-sm text-m8bs-muted">
            {metrics.length} {metrics.length === 1 ? 'metric' : 'metrics'} available
          </div>
          <Button
            onClick={handleSave}
            disabled={saving || metrics.length === 0}
            className="flex items-center gap-2 bg-m8bs-blue hover:bg-m8bs-blue-dark text-white transition-colors"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Saving...' : 'Save All Data'}
          </Button>
        </CardFooter>
      </CardContent>
    </Card>
  )
}
