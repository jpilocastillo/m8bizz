"use client"

import { useState, useEffect, useCallback, useRef } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { behaviorScorecardService, type ScorecardRole, type ScorecardMetric, calculatePercentageOfGoal, calculateGrade, isDefaultMetric } from '@/lib/behavior-scorecard'
import { Save, Calendar, Calculator, Plus, Trash2, Edit2, Check, X, AlertCircle, Loader2, CheckCircle2, RefreshCw } from 'lucide-react'
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
  const [saving, setSaving] = useState(false)
  const [editingMetric, setEditingMetric] = useState<string | null>(null)
  const [hasChanges, setHasChanges] = useState(false)
  const [saveProgress, setSaveProgress] = useState(0)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle')
  const [saveStats, setSaveStats] = useState({ goalsUpdated: 0, metricsSaved: 0, errors: 0 })
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null)
  const handleSaveRef = useRef<() => Promise<void>>()
  const isInitializingRef = useRef(true)
  const localStorageSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Generate localStorage key based on role, year, and month
  const getStorageKey = useCallback(() => {
    return `behavior-scorecard-${roleId}-${year}-${month}`
  }, [roleId, year, month])

  // Load data from localStorage
  const loadFromLocalStorage = useCallback(() => {
    try {
      const storageKey = getStorageKey()
      const stored = localStorage.getItem(storageKey)
      if (stored) {
        const parsed = JSON.parse(stored)
        return {
          monthlyData: parsed.monthlyData || {},
          goalData: parsed.goalData || {},
        }
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error)
    }
    return null
  }, [getStorageKey])

  // Save data to localStorage
  const saveToLocalStorage = useCallback((monthly: Record<string, number>, goals: Record<string, number>) => {
    try {
      const storageKey = getStorageKey()
      localStorage.setItem(storageKey, JSON.stringify({
        monthlyData: monthly,
        goalData: goals,
        timestamp: new Date().toISOString(),
      }))
    } catch (error) {
      console.error('Error saving to localStorage:', error)
    }
  }, [getStorageKey])

  // Clear localStorage for this form
  const clearLocalStorage = useCallback(() => {
    try {
      const storageKey = getStorageKey()
      localStorage.removeItem(storageKey)
    } catch (error) {
      console.error('Error clearing localStorage:', error)
    }
  }, [getStorageKey])

  const loadMonthlyData = useCallback(async () => {
    if (metrics.length === 0) return
    
    // Batch load all weekly data at once for better performance
    const metricIds = metrics.map(m => m.id)
    const result = await behaviorScorecardService.getBatchWeeklyData(metricIds, year)
    
    if (result.success && result.data) {
      const newMonthlyData: Record<string, number> = {}
      // Calculate the week number for the start of this month
      // Month 1 (Jan) uses weeks 1-4, Month 2 (Feb) uses weeks 5-8, etc.
      const monthStartWeek = (month - 1) * 4 + 1
      result.data.forEach((weeklyDataArray, metricId) => {
        // Find week 1 data for this month (we use week 1 of the month to store monthly value)
        const monthWeek1Data = weeklyDataArray.find(wd => wd.weekNumber === monthStartWeek)
        if (monthWeek1Data) {
          newMonthlyData[metricId] = monthWeek1Data.actualValue
        }
      })
      
      // Merge with localStorage data (localStorage takes precedence for unsaved changes)
      const stored = loadFromLocalStorage()
      if (stored) {
        Object.keys(stored.monthlyData).forEach(metricId => {
          if (stored.monthlyData[metricId] !== undefined) {
            newMonthlyData[metricId] = stored.monthlyData[metricId]
          }
        })
      }
      
      setMonthlyData(prev => ({ ...prev, ...newMonthlyData }))
    }
  }, [metrics, year, month, loadFromLocalStorage])

  // Initialize monthly data structure and goals
  useEffect(() => {
    // Reset initialization flag when parameters change
    isInitializingRef.current = true
    
    const initialData: Record<string, number> = {}
    const initialGoals: Record<string, number> = {}
    metrics.forEach(metric => {
      initialData[metric.id] = 0
      initialGoals[metric.id] = metric.goalValue
    })
    
    // Try to load from localStorage first
    const stored = loadFromLocalStorage()
    if (stored) {
      // Merge stored data with initial structure
      Object.keys(stored.monthlyData).forEach(metricId => {
        if (metrics.find(m => m.id === metricId)) {
          initialData[metricId] = stored.monthlyData[metricId]
        }
      })
      Object.keys(stored.goalData).forEach(metricId => {
        if (metrics.find(m => m.id === metricId)) {
          initialGoals[metricId] = stored.goalData[metricId]
        }
      })
      // Restore hasChanges state if there's stored data
      setHasChanges(true)
    }
    
    setMonthlyData(initialData)
    setGoalData(initialGoals)

    // Load existing data from database (will merge with localStorage data)
    loadMonthlyData().then(() => {
      // Mark initialization as complete after data is loaded
      isInitializingRef.current = false
    })
  }, [metrics, year, month, loadMonthlyData, loadFromLocalStorage])

  // Sync data to localStorage whenever it changes (debounced to reduce overhead)
  useEffect(() => {
    if (!isInitializingRef.current && hasChanges && Object.keys(monthlyData).length > 0 && Object.keys(goalData).length > 0) {
      // Clear existing timeout
      if (localStorageSaveTimeoutRef.current) {
        clearTimeout(localStorageSaveTimeoutRef.current)
      }
      
      // Debounce localStorage saves (wait 300ms after last change)
      localStorageSaveTimeoutRef.current = setTimeout(() => {
        saveToLocalStorage(monthlyData, goalData)
      }, 300)
    }

    // Cleanup timeout on unmount
    return () => {
      if (localStorageSaveTimeoutRef.current) {
        clearTimeout(localStorageSaveTimeoutRef.current)
      }
    }
  }, [monthlyData, goalData, hasChanges, saveToLocalStorage])

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

    try {
      const newGoal = goalData[metricId] ?? metric.goalValue
      const monthlyValue = monthlyData[metricId] || 0
      const monthStartWeek = (month - 1) * 4 + 1

      // Prepare batch operations
      const weeklyDataEntries = [
        { metricId, weekNumber: monthStartWeek, year, actualValue: monthlyValue },
        { metricId, weekNumber: monthStartWeek + 1, year, actualValue: 0 },
        { metricId, weekNumber: monthStartWeek + 2, year, actualValue: 0 },
        { metricId, weekNumber: monthStartWeek + 3, year, actualValue: 0 },
      ]

      // Execute goal update and weekly data save in parallel
      const goalUpdatePromise = newGoal !== metric.goalValue 
        ? behaviorScorecardService.updateMetricGoal(metricId, newGoal)
        : Promise.resolve({ success: true as const })
      
      const [goalResult, weeklyDataResult] = await Promise.all([
        goalUpdatePromise,
        behaviorScorecardService.batchSaveWeeklyData(weeklyDataEntries)
      ])

      if (goalResult.success && newGoal !== metric.goalValue) {
        toast({
          title: "Goal updated",
          description: `Goal for ${metric.metricName} has been updated.`,
        })
      }

      if (!weeklyDataResult.success && weeklyDataResult.errors) {
        console.error(`Failed to save weekly data:`, weeklyDataResult.errors)
        toast({
          title: "Warning",
          description: "Some data may not have been saved correctly.",
          variant: "destructive",
        })
      }

      // Recalculate monthly summary after saving (don't wait for it)
      behaviorScorecardService.calculateMonthlySummary(month, year).catch(error => {
        console.error('Failed to calculate monthly summary:', error)
      })

      setEditingMetric(null)
      
      if (onSave) {
        await onSave()
      }
    } catch (error) {
      console.error('Error in handleSaveEdit:', error)
      toast({
        title: "Error",
        description: "Failed to save changes. Please try again.",
        variant: "destructive",
      })
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

  const handleSave = async (retryCount = 0) => {
    if (saving) return
    
    setSaving(true)
    setSaveStatus('saving')
    setSaveProgress(0)
    setSaveStats({ goalsUpdated: 0, metricsSaved: 0, errors: 0 })
    
    try {
      // Prepare batch operations
      const monthStartWeek = (month - 1) * 4 + 1
      
      // Prepare goal updates
      const goalsToUpdate = metrics
        .filter(m => {
          const newGoalValue = goalData[m.id] ?? m.goalValue
          return newGoalValue !== m.goalValue
        })
        .map(m => ({
          metricId: m.id,
          goalValue: goalData[m.id] ?? m.goalValue
        }))

      // Prepare all weekly data entries
      const weeklyDataEntries: Array<{
        metricId: string
        weekNumber: number
        year: number
        actualValue: number
      }> = []
      
      metrics.forEach(metric => {
        const monthlyValue = monthlyData[metric.id] || 0
        // Save monthly value in week 1, clear weeks 2-4
        weeklyDataEntries.push(
          { metricId: metric.id, weekNumber: monthStartWeek, year, actualValue: monthlyValue },
          { metricId: metric.id, weekNumber: monthStartWeek + 1, year, actualValue: 0 },
          { metricId: metric.id, weekNumber: monthStartWeek + 2, year, actualValue: 0 },
          { metricId: metric.id, weekNumber: monthStartWeek + 3, year, actualValue: 0 }
        )
      })

      setSaveProgress(20)

      // Execute batch operations in parallel for maximum speed
      const [goalResult, weeklyDataResult] = await Promise.all([
        goalsToUpdate.length > 0
          ? behaviorScorecardService.batchUpdateMetricGoals(goalsToUpdate)
          : Promise.resolve({ success: true }),
        behaviorScorecardService.batchSaveWeeklyData(weeklyDataEntries)
      ])

      setSaveProgress(80)

      // Process results
      let goalSaveErrors = 0
      let goalsUpdated = goalsToUpdate.length
      if (!goalResult.success && 'errors' in goalResult) {
        const errors = goalResult.errors
        if (errors && Array.isArray(errors)) {
          goalSaveErrors = errors.length
          goalsUpdated = goalsToUpdate.length - goalSaveErrors
          errors.forEach((err: { metricId: string; error: string }) => {
            console.error(`Failed to update goal for metric ${err.metricId}:`, err.error)
          })
        }
      }

      let dataSaveErrors = 0
      let metricsSaved = metrics.length
      if (!weeklyDataResult.success && 'errors' in weeklyDataResult) {
        const errors = weeklyDataResult.errors
        if (errors && Array.isArray(errors)) {
          // Count unique metrics that failed
          const failedMetrics = new Set(errors.map((e: { entry: { metricId: string }; error: string }) => e.entry.metricId))
          dataSaveErrors = failedMetrics.size
          metricsSaved = metrics.length - dataSaveErrors
          errors.forEach((err: { entry: { metricId: string; weekNumber: number }; error: string }) => {
            console.error(`Failed to save weekly data for metric ${err.entry.metricId} week ${err.entry.weekNumber}:`, err.error)
          })
        }
      }

      const saveSuccess = goalSaveErrors === 0 && dataSaveErrors === 0
      setSaveStats({ goalsUpdated, metricsSaved, errors: goalSaveErrors + dataSaveErrors })

      // Calculate monthly summary (don't block on this)
      setSaveProgress(90)
      const summaryPromise = behaviorScorecardService.calculateMonthlySummary(month, year)
      const summaryResult = await summaryPromise
      setSaveProgress(100)
      
      const summarySuccess = summaryResult.success
      
      if (!summaryResult.success) {
        console.error('Failed to calculate monthly summary:', summaryResult.error)
      }

      setHasChanges(false)
      setLastSaveTime(new Date())
      
      // Clear localStorage after successful save
      if (saveSuccess && summarySuccess) {
        clearLocalStorage()
      }
      
      // Show appropriate toast message with statistics
      if (!saveSuccess) {
        setSaveStatus('error')
        toast({
          title: "Partial save completed",
          description: `Saved ${metricsSaved} metrics and ${goalsUpdated} goals. ${goalSaveErrors + dataSaveErrors} errors occurred.`,
          variant: "destructive",
          duration: 5000,
        })
      } else if (!summarySuccess) {
        setSaveStatus('error')
        toast({
          title: "Data saved with warning",
          description: `All data saved successfully, but summary calculation had issues. The scorecard may need a refresh.`,
          variant: "destructive",
          duration: 5000,
        })
      } else {
        setSaveStatus('success')
        toast({
          title: "Data saved successfully",
          description: `Saved ${metricsSaved} metrics${goalsUpdated > 0 ? ` and updated ${goalsUpdated} goals` : ''} for ${roleName}.`,
          duration: 3000,
        })
        
        // Reset success status after animation
        setTimeout(() => {
          if (saveStatus === 'success') {
            setSaveStatus('idle')
          }
        }, 2000)
      }

      // Refresh scorecard after save
      if (onSave) {
        await onSave()
      }
    } catch (error) {
      console.error('Error in handleSave:', error)
      setSaveStatus('error')
      setSaveProgress(0)
      
      // Retry logic (max 2 retries)
      if (retryCount < 2) {
        toast({
          title: "Save failed, retrying...",
          description: `Attempt ${retryCount + 1} of 3. ${error instanceof Error ? error.message : 'Network error'}`,
          variant: "destructive",
          duration: 3000,
        })
        
        // Wait 1 second before retry
        await new Promise(resolve => setTimeout(resolve, 1000))
        return handleSave(retryCount + 1)
      }
      
      toast({
        title: "Error saving data",
        description: error instanceof Error ? error.message : "Failed to save data after multiple attempts. Please check your connection and try again.",
        variant: "destructive",
        duration: 5000,
      })
    } finally {
      setSaving(false)
      if (saveStatus === 'saving') {
        setSaveStatus('idle')
      }
    }
  }

  // Keyboard shortcut for saving (Ctrl+S or Cmd+S)
  useEffect(() => {
    handleSaveRef.current = handleSave
  }, [handleSave])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        if (hasChanges && !saving && handleSaveRef.current) {
          handleSaveRef.current()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [hasChanges, saving])

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

        <CardFooter className="flex flex-col gap-3 pt-4 border-t border-m8bs-border">
          {/* Progress bar */}
          {saving && (
            <div className="w-full space-y-2">
              <div className="flex justify-between items-center text-xs text-m8bs-muted">
                <span>Saving data...</span>
                <span>{Math.round(saveProgress)}%</span>
              </div>
              <Progress value={saveProgress} className="h-2 bg-m8bs-card-alt" />
            </div>
          )}
          
          {/* Status and action row */}
          <div className="flex justify-between items-center w-full">
            <div className="flex items-center gap-3 text-sm">
              {hasChanges && !saving && (
                <>
                  <AlertCircle className="h-4 w-4 text-yellow-400 animate-pulse" />
                  <span className="text-yellow-400">You have unsaved changes</span>
                </>
              )}
              {saving && (
                <>
                  <Loader2 className="h-4 w-4 text-m8bs-blue animate-spin" />
                  <span className="text-m8bs-muted">Saving your data...</span>
                </>
              )}
              {saveStatus === 'success' && !hasChanges && (
                <>
                  <CheckCircle2 className="h-4 w-4 text-green-400" />
                  <span className="text-green-400">All changes saved</span>
                  {lastSaveTime && (
                    <span className="text-xs text-m8bs-muted">
                      {lastSaveTime.toLocaleTimeString()}
                    </span>
                  )}
                </>
              )}
              {saveStatus === 'error' && !saving && (
                <>
                  <AlertCircle className="h-4 w-4 text-red-400" />
                  <span className="text-red-400">Some errors occurred</span>
                </>
              )}
              {!hasChanges && !saving && saveStatus === 'idle' && lastSaveTime && (
                <span className="text-xs text-m8bs-muted">
                  Last saved: {lastSaveTime.toLocaleTimeString()}
                </span>
              )}
            </div>
            
            <div className="flex gap-2">
              {saveStatus === 'error' && !saving && (
                <Button
                  onClick={() => handleSave()}
                  variant="outline"
                  className="flex items-center gap-2 border-red-500/50 text-red-400 hover:bg-red-500/10 hover:border-red-500"
                >
                  <RefreshCw className="h-4 w-4" />
                  Retry Save
                </Button>
              )}
              <Button
                onClick={() => handleSave()}
                disabled={saving || !hasChanges}
                className={`flex items-center gap-2 transition-all duration-200 ${
                  saveStatus === 'success' && !hasChanges
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-m8bs-blue hover:bg-m8bs-blue-dark text-white'
                } disabled:opacity-50 disabled:cursor-not-allowed ${
                  saving ? 'animate-pulse' : ''
                }`}
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : saveStatus === 'success' && !hasChanges ? (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Saved
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save All Data
                  </>
                )}
              </Button>
            </div>
          </div>
          
          {/* Save statistics */}
          {saveStats.metricsSaved > 0 && !saving && (
            <div className="flex items-center gap-4 text-xs text-m8bs-muted pt-1 border-t border-m8bs-border/50">
              <span>Metrics saved: {saveStats.metricsSaved}</span>
              {saveStats.goalsUpdated > 0 && (
                <span>Goals updated: {saveStats.goalsUpdated}</span>
              )}
              {saveStats.errors > 0 && (
                <span className="text-red-400">Errors: {saveStats.errors}</span>
              )}
              <span className="ml-auto text-xs opacity-70">Press Ctrl+S to save</span>
            </div>
          )}
        </CardFooter>
      </CardContent>
    </Card>
  )
}
