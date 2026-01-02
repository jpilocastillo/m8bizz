"use client"

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { behaviorScorecardService, type ScorecardRole, type ScorecardMetric, calculatePercentageOfGoal, calculateGrade, isDefaultMetric } from '@/lib/behavior-scorecard'
import { Save, Calendar, Calculator, Plus, Trash2, Edit2, Check, X, AlertCircle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'

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
  const [saving, setSaving] = useState(false)
  const [editingMetric, setEditingMetric] = useState<string | null>(null)
  const [hasChanges, setHasChanges] = useState(false)

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
    metrics.forEach(metric => {
      initialData[metric.id] = 0
      initialGoals[metric.id] = metric.goalValue
    })
    setMonthlyData(initialData)
    setGoalData(initialGoals)

    // Load existing data
    loadMonthlyData()
  }, [metrics, year, month, loadMonthlyData])

  const handleMonthlyValueChange = (metricId: string, value: string) => {
    const numValue = parseFloat(value) || 0
    setMonthlyData(prev => ({
      ...prev,
      [metricId]: numValue,
    }))
    setHasChanges(true)
  }

  const handleGoalChange = (metricId: string, value: string) => {
    const numValue = parseFloat(value) || 0
    setGoalData(prev => ({
      ...prev,
      [metricId]: numValue,
    }))
    setHasChanges(true)
  }

  const handleQuickEdit = (metricId: string) => {
    setEditingMetric(metricId)
  }

  const handleCancelEdit = () => {
    setEditingMetric(null)
  }

  const handleSaveEdit = async (metricId: string) => {
    const metric = metrics.find(m => m.id === metricId)
    if (!metric) return

    const newGoal = goalData[metricId] ?? metric.goalValue
    if (newGoal !== metric.goalValue) {
      const result = await behaviorScorecardService.updateMetricGoal(metricId, newGoal)
      if (result.success) {
        toast({
          title: "Goal updated",
          description: `Goal for ${metric.metricName} has been updated.`,
        })
      }
    }

    const monthlyValue = monthlyData[metricId] || 0
    await behaviorScorecardService.saveWeeklyData(metricId, 1, year, monthlyValue)
    for (let week = 2; week <= 4; week++) {
      await behaviorScorecardService.saveWeeklyData(metricId, week, year, 0)
    }

    setEditingMetric(null)
    if (onSave) {
      await onSave()
    }
  }

  const calculateMetricPercentage = (metricId: string): number => {
    const metric = metrics.find(m => m.id === metricId)
    if (!metric) return 0
    const goal = goalData[metricId] ?? metric.goalValue
    const actual = monthlyData[metricId] || 0
    return calculatePercentageOfGoal(actual, goal, metric.isInverted)
  }

  const getMetricGrade = (metricId: string): string => {
    const percentage = calculateMetricPercentage(metricId)
    return calculateGrade(percentage)
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

      setHasChanges(false)
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
    <Card className="bg-black border-m8bs-border shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl text-white flex items-center gap-2">
          <Calendar className="h-5 w-5 text-m8bs-blue" />
          {roleName} - Data Entry Form
        </CardTitle>
        <CardDescription className="text-m8bs-muted">
          Enter Monthly Data For {new Date(year, month - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
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
                    Monthly Value
                  </TableHead>
                  <TableHead className="text-center text-white font-semibold min-w-[100px]">
                    % of Goal
                  </TableHead>
                  <TableHead className="text-center text-white font-semibold min-w-[80px]">
                    Grade
                  </TableHead>
                  <TableHead className="text-center text-white font-semibold min-w-[100px]">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {metrics.map((metric, index) => {
                  const monthlyValue = getMonthlyValue(metric.id)
                  const goalValue = goalData[metric.id] ?? metric.goalValue
                  const percentage = calculateMetricPercentage(metric.id)
                  const grade = getMetricGrade(metric.id)
                  const isEditing = editingMetric === metric.id
                  
                  return (
                    <TableRow 
                      key={metric.id} 
                      className={`${index % 2 === 0 ? 'bg-m8bs-card-alt/30' : 'bg-m8bs-card-alt/50'} hover:bg-m8bs-card-alt/70 transition-colors`}
                    >
                      <TableCell className="font-medium text-white sticky left-0 bg-inherit z-10 border-r border-m8bs-border">
                        <div>
                          <div className="font-semibold flex items-center gap-2">
                            {metric.metricName}
                            {isDefaultMetric(metric.metricName) && (
                              <Badge variant="outline" className="text-xs border-m8bs-blue/50 text-m8bs-blue">
                                Core
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs text-m8bs-muted mt-1">
                            {metric.metricType}
                            {metric.isInverted && ' • (lower is better)'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="p-2">
                        {isEditing ? (
                          <Input
                            type="number"
                            step={getInputStep(metric.metricType)}
                            min="0"
                            value={goalValue}
                            onChange={(e) => handleGoalChange(metric.id, e.target.value)}
                            className="w-full text-center bg-m8bs-card border-m8bs-blue text-white focus:border-m8bs-blue focus:ring-m8bs-blue/20 transition-colors h-9"
                            autoFocus
                          />
                        ) : (
                          <div className="text-center text-white font-medium">
                            {formatValue(goalValue, metric.metricType)}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="p-2">
                        {isEditing ? (
                          <Input
                            type="number"
                            step={getInputStep(metric.metricType)}
                            min="0"
                            max={getInputMax(metric.metricType)}
                            value={monthlyValue}
                            onChange={(e) => handleMonthlyValueChange(metric.id, e.target.value)}
                            className="w-full text-center bg-m8bs-card border-m8bs-blue text-white focus:border-m8bs-blue focus:ring-m8bs-blue/20 transition-colors h-9"
                          />
                        ) : (
                          <div className="text-center text-white font-medium">
                            {formatValue(monthlyValue, metric.metricType)}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={`font-semibold ${
                          percentage >= 90 ? 'text-green-400' :
                          percentage >= 80 ? 'text-blue-400' :
                          percentage >= 70 ? 'text-yellow-400' :
                          percentage >= 60 ? 'text-orange-400' :
                          'text-red-400'
                        }`}>
                          {percentage.toFixed(1)}%
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className={`${
                          grade === 'A' ? 'bg-green-500/20 text-green-400 border-green-500/50' :
                          grade === 'B' ? 'bg-blue-500/20 text-blue-400 border-blue-500/50' :
                          grade === 'C' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50' :
                          grade === 'D' ? 'bg-orange-500/20 text-orange-400 border-orange-500/50' :
                          'bg-red-500/20 text-red-400 border-red-500/50'
                        } border`}>
                          {grade}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        {isEditing ? (
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleSaveEdit(metric.id)}
                              className="h-7 w-7 p-0 text-green-400 hover:text-green-300 hover:bg-green-500/20"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={handleCancelEdit}
                              className="h-7 w-7 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/20"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleQuickEdit(metric.id)}
                            className="h-7 w-7 p-0 text-m8bs-muted hover:text-m8bs-blue hover:bg-m8bs-blue/20"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </ScrollArea>

        <CardFooter className="flex justify-between items-center pt-4 border-t border-m8bs-border">
          <div className="flex items-center gap-2 text-sm text-m8bs-muted">
            {hasChanges && (
              <>
                <AlertCircle className="h-4 w-4 text-yellow-400" />
                <span>You have unsaved changes</span>
              </>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleSave}
              disabled={saving || !hasChanges}
              className="flex items-center gap-2 bg-m8bs-blue hover:bg-m8bs-blue-dark text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Saving...' : 'Save All Data'}
            </Button>
          </div>
        </CardFooter>
      </CardContent>
    </Card>
  )
}
