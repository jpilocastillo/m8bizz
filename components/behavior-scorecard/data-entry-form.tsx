"use client"

import { useState, useEffect, useCallback, useRef } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { behaviorScorecardService, type ScorecardRole, type ScorecardMetric, calculatePercentageOfGoal, calculateGrade, isDefaultMetric } from '@/lib/behavior-scorecard'
import { Save, Calendar, Calculator, Plus, Trash2, Edit2, Check, X, AlertCircle, Loader2, CheckCircle2, RefreshCw, Copy, Clipboard, RotateCcw, ArrowDown, HelpCircle, Zap, Search } from 'lucide-react'
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
  const [searchQuery, setSearchQuery] = useState('')
  const [bulkEditMode, setBulkEditMode] = useState(false)
  const [focusedInput, setFocusedInput] = useState<string | null>(null)
  const inputRefs = useRef<Record<string, HTMLInputElement>>({})
  const originalValuesRef = useRef<Record<string, { goal: number; value: number }>>({})

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

  const handleMonthlyValueChange = (metricId: string, value: string, metricType?: string) => {
    // Handle empty string
    if (value === '' || value === '-') {
      setMonthlyData(prev => ({
        ...prev,
        [metricId]: 0,
      }))
      setHasChanges(true)
      return
    }
    
    let numValue = parseFloat(value)
    
    // Validate based on metric type
    if (metricType === 'rating_1_5' || metricType === 'rating_scale') {
      numValue = Math.max(0, Math.min(5, numValue))
    } else if (numValue < 0) {
      numValue = 0
    }
    
    // Round to appropriate decimal places
    if (metricType === 'currency') {
      numValue = Math.round(numValue)
    } else if (metricType === 'rating_1_5' || metricType === 'rating_scale') {
      numValue = Math.round(numValue * 10) / 10
    } else {
      numValue = Math.round(numValue)
    }
    
    setMonthlyData(prev => ({
      ...prev,
      [metricId]: numValue,
    }))
    setHasChanges(true)
  }

  const handleGoalChange = (metricId: string, value: string, metricType?: string) => {
    // Handle empty string
    if (value === '' || value === '-') {
      setGoalData(prev => ({
        ...prev,
        [metricId]: 0,
      }))
      setHasChanges(true)
      return
    }
    
    let numValue = parseFloat(value)
    
    // Validate based on metric type
    if (metricType === 'rating_1_5' || metricType === 'rating_scale') {
      numValue = Math.max(0, Math.min(5, numValue))
    } else if (numValue < 0) {
      numValue = 0
    }
    
    // Round to appropriate decimal places
    if (metricType === 'currency') {
      numValue = Math.round(numValue)
    } else if (metricType === 'rating_1_5' || metricType === 'rating_scale') {
      numValue = Math.round(numValue * 10) / 10
    } else {
      numValue = Math.round(numValue)
    }
    
    setGoalData(prev => ({
      ...prev,
      [metricId]: numValue,
    }))
    setHasChanges(true)
  }

  // Fill from previous month
  const handleFillFromPrevious = async () => {
    try {
      const previousMonth = month === 1 ? 12 : month - 1
      const previousYear = month === 1 ? year - 1 : year
      const monthStartWeek = (previousMonth - 1) * 4 + 1
      
      const metricIds = metrics.map(m => m.id)
      const result = await behaviorScorecardService.getBatchWeeklyData(metricIds, previousYear)
      
      if (result.success && result.data) {
        const newMonthlyData: Record<string, number> = {}
        result.data.forEach((weeklyDataArray, metricId) => {
          const monthWeek1Data = weeklyDataArray.find(wd => wd.weekNumber === monthStartWeek)
          if (monthWeek1Data) {
            newMonthlyData[metricId] = monthWeek1Data.actualValue
          }
        })
        
        setMonthlyData(prev => ({ ...prev, ...newMonthlyData }))
        setHasChanges(true)
        
        toast({
          title: "Data filled",
          description: `Filled values from ${new Date(previousYear, previousMonth - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`,
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load previous month's data",
        variant: "destructive",
      })
    }
  }

  // Clear all values
  const handleClearAll = () => {
    const clearedData: Record<string, number> = {}
    metrics.forEach(metric => {
      clearedData[metric.id] = 0
    })
    setMonthlyData(clearedData)
    setHasChanges(true)
    toast({
      title: "Cleared",
      description: "All monthly values have been cleared",
    })
  }

  // Filter metrics based on search
  const filteredMetrics = metrics.filter(metric => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return metric.metricName.toLowerCase().includes(query) ||
           metric.metricType.toLowerCase().includes(query)
  })

  const handleQuickEdit = (metricId: string) => {
    setEditingMetric(metricId)
  }

  const handleCancelEdit = () => {
    setEditingMetric(null)
  }

  const handleSaveEdit = async (metricId: string, silent = false) => {
    const metric = metrics.find(m => m.id === metricId)
    if (!metric) return

    try {
      const newGoal = goalData[metricId] ?? metric.goalValue
      const monthlyValue = monthlyData[metricId] || 0
      const monthStartWeek = (month - 1) * 4 + 1

      // Check if there are actual changes
      const goalChanged = newGoal !== metric.goalValue
      const valueChanged = monthlyValue !== 0 || monthlyData[metricId] !== undefined

      if (!goalChanged && !valueChanged) {
        setEditingMetric(null)
        return
      }

      // Prepare batch operations
      const weeklyDataEntries = [
        { metricId, weekNumber: monthStartWeek, year, actualValue: monthlyValue },
        { metricId, weekNumber: monthStartWeek + 1, year, actualValue: 0 },
        { metricId, weekNumber: monthStartWeek + 2, year, actualValue: 0 },
        { metricId, weekNumber: monthStartWeek + 3, year, actualValue: 0 },
      ]

      // Execute goal update and weekly data save in parallel
      const goalUpdatePromise = goalChanged
        ? behaviorScorecardService.updateMetricGoal(metricId, newGoal)
        : Promise.resolve({ success: true as const })
      
      const [goalResult, weeklyDataResult] = await Promise.all([
        goalUpdatePromise,
        behaviorScorecardService.batchSaveWeeklyData(weeklyDataEntries)
      ])

      if (!silent) {
        if (goalResult.success && goalChanged) {
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
      }

      // Recalculate monthly summary after saving (don't wait for it)
      behaviorScorecardService.calculateMonthlySummary(month, year).catch(error => {
        console.error('Failed to calculate monthly summary:', error)
      })

      setEditingMetric(null)
      // Clear original values after successful save
      delete originalValuesRef.current[metricId]
      
      if (onSave) {
        await onSave()
      }
    } catch (error) {
      console.error('Error in handleSaveEdit:', error)
      if (!silent) {
        toast({
          title: "Error",
          description: "Failed to save changes. Please try again.",
          variant: "destructive",
        })
      }
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
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-xl text-white flex items-center gap-2">
              <Calendar className="h-5 w-5 text-m8bs-blue" />
              {roleName} - Data Entry Form
            </CardTitle>
            <CardDescription className="text-m8bs-muted">
              Enter Monthly Data For {new Date(year, month - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleFillFromPrevious}
              className="text-xs border-m8bs-border"
              title="Fill values from previous month"
            >
              <ArrowDown className="h-3 w-3 mr-1" />
              Fill Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearAll}
              className="text-xs border-m8bs-border text-red-400"
              title="Clear all values"
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              Clear All
            </Button>
          </div>
        </div>
        
        {/* Search and filter bar */}
        <div className="mt-4 flex items-center gap-2">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-m8bs-muted" />
            <Input
              type="text"
              placeholder="Search metrics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-m8bs-card-alt border-m8bs-border text-white placeholder:text-m8bs-muted focus:border-m8bs-blue"
            />
          </div>
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearchQuery('')}
              className="text-xs text-m8bs-muted"
            >
              Clear
            </Button>
          )}
          <Badge variant="outline" className="text-xs border-m8bs-border">
            {filteredMetrics.length} of {metrics.length} metrics
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <ScrollArea className="w-full">
          <div className="rounded-md border border-m8bs-border overflow-x-auto">
            <Table className="min-w-[800px]">
              <TableHeader>
                <TableRow className="bg-m8bs-card-alt">
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
                {filteredMetrics.map((metric, index) => {
                  const monthlyValue = getMonthlyValue(metric.id)
                  const goalValue = goalData[metric.id] ?? metric.goalValue
                  const percentage = calculateMetricPercentage(metric.id)
                  const grade = getMetricGrade(metric.id)
                  const isEditing = editingMetric === metric.id
                  
                  return (
                    <TableRow 
                      key={metric.id} 
                      className={`group ${index % 2 === 0 ? 'bg-m8bs-card-alt/30' : 'bg-m8bs-card-alt/50'} transition-colors ${
                        editingMetric === metric.id ? 'ring-2 ring-m8bs-blue/50 bg-m8bs-blue/10' : ''
                      }`}
                    >
                      <TableCell className="font-medium text-white sticky left-0 bg-inherit z-10 border-r border-m8bs-border">
                        <div className="group relative">
                          <div className="font-semibold flex items-center gap-2">
                            {metric.metricName}
                            {isDefaultMetric(metric.metricName) && (
                              <Badge variant="outline" className="text-xs border-m8bs-blue/50 text-m8bs-blue">
                                Core
                              </Badge>
                            )}
                            <HelpCircle className="h-3 w-3 text-m8bs-muted opacity-50 cursor-help" />
                          </div>
                          <div className="text-xs text-m8bs-muted mt-1">
                            {metric.metricType}
                            {metric.isInverted && ' • (lower is better)'}
                          </div>
                          {/* Tooltip */}
                          <div className="hidden">
                            <div className="text-xs text-white">
                              <div className="font-semibold mb-1">{metric.metricName}</div>
                              <div className="text-m8bs-muted">
                                Type: {metric.metricType}
                                {metric.isInverted && <div className="mt-1">Lower values are better</div>}
                                <div className="mt-1">Goal: {formatValue(goalValue, metric.metricType)}</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="p-2">
                        <Input
                          ref={(el) => {
                            if (el) inputRefs.current[`goal-${metric.id}`] = el
                          }}
                          type="number"
                          step={getInputStep(metric.metricType)}
                          min="0"
                          max={getInputMax(metric.metricType)}
                          value={goalValue}
                          onChange={(e) => {
                            handleGoalChange(metric.id, e.target.value, metric.metricType)
                            // Auto-save on blur if value changed
                            const newValue = parseFloat(e.target.value) || 0
                            if (newValue !== metric.goalValue) {
                              // Mark for save
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Tab' && !e.shiftKey) {
                              // Focus next input
                              const nextInput = inputRefs.current[`value-${metric.id}`]
                              if (nextInput) {
                                e.preventDefault()
                                nextInput.focus()
                                nextInput.select()
                              }
                            }
                          }}
                          onFocus={() => {
                            setFocusedInput(`goal-${metric.id}`)
                            setEditingMetric(metric.id)
                            // Store original values when starting to edit
                            if (!originalValuesRef.current[metric.id]) {
                              originalValuesRef.current[metric.id] = {
                                goal: goalValue,
                                value: monthlyValue
                              }
                            }
                          }}
                          onBlur={async () => {
                            setFocusedInput(null)
                            // Auto-save if goal changed (silent save)
                            const currentGoal = goalData[metric.id] ?? metric.goalValue
                            if (currentGoal !== metric.goalValue) {
                              await handleSaveEdit(metric.id, true)
                            } else {
                              // Small delay to allow clicking save button
                              setTimeout(() => {
                                if (editingMetric === metric.id) {
                                  setEditingMetric(null)
                                }
                              }, 200)
                            }
                          }}
                          onClick={(e) => e.currentTarget.select()}
                          className={`w-full text-center bg-m8bs-card/50 border-m8bs-border focus:border-m8bs-blue focus:ring-m8bs-blue/20 text-white transition-all h-9 cursor-text ${
                            focusedInput === `goal-${metric.id}` ? 'ring-2 ring-m8bs-blue/50 bg-m8bs-card border-m8bs-blue' : ''
                          }`}
                          title={`Goal for ${metric.metricName}. Click to edit. Tab to move to value.`}
                        />
                      </TableCell>
                      <TableCell className="p-2">
                        <Input
                          ref={(el) => {
                            if (el) inputRefs.current[`value-${metric.id}`] = el
                          }}
                          type="number"
                          step={getInputStep(metric.metricType)}
                          min="0"
                          max={getInputMax(metric.metricType)}
                          value={monthlyValue}
                          onChange={(e) => handleMonthlyValueChange(metric.id, e.target.value, metric.metricType)}
                          onKeyDown={(e) => {
                            if (e.key === 'Tab' && e.shiftKey) {
                              // Focus previous input
                              const prevInput = inputRefs.current[`goal-${metric.id}`]
                              if (prevInput) {
                                e.preventDefault()
                                prevInput.focus()
                                prevInput.select()
                              }
                            }
                          }}
                          onFocus={() => {
                            setFocusedInput(`value-${metric.id}`)
                            setEditingMetric(metric.id)
                            // Store original values when starting to edit
                            if (!originalValuesRef.current[metric.id]) {
                              originalValuesRef.current[metric.id] = {
                                goal: goalValue,
                                value: monthlyValue
                              }
                            }
                          }}
                          onBlur={async () => {
                            setFocusedInput(null)
                            // Auto-save on blur (silent save)
                            await handleSaveEdit(metric.id, true)
                          }}
                          onClick={(e) => e.currentTarget.select()}
                          className={`w-full text-center bg-m8bs-card/50 border-m8bs-border focus:border-m8bs-blue focus:ring-m8bs-blue/20 text-white transition-all h-9 cursor-text ${
                            focusedInput === `value-${metric.id}` ? 'ring-2 ring-m8bs-blue/50 bg-m8bs-card border-m8bs-blue' : ''
                          }`}
                          title={`Monthly value for ${metric.metricName}. Click to edit.`}
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span className={`font-semibold ${
                            percentage >= 90 ? 'text-green-400' :
                            percentage >= 80 ? 'text-blue-400' :
                            percentage >= 70 ? 'text-yellow-400' :
                            percentage >= 60 ? 'text-orange-400' :
                            'text-red-400'
                          }`}>
                            {percentage.toFixed(1)}%
                          </span>
                          {isEditing && (
                            <div className="h-1 w-16 bg-m8bs-card-alt rounded-full overflow-hidden">
                              <div
                                className={`h-full transition-all duration-300 ${
                                  percentage >= 90 ? 'bg-green-500' :
                                  percentage >= 80 ? 'bg-blue-500' :
                                  percentage >= 70 ? 'bg-yellow-500' :
                                  percentage >= 60 ? 'bg-orange-500' :
                                  'bg-red-500'
                                }`}
                                style={{ width: `${Math.min(percentage, 100)}%` }}
                              />
                            </div>
                          )}
                        </div>
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
                        {editingMetric === metric.id ? (
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleSaveEdit(metric.id)}
                              className="h-7 w-7 p-0 text-green-400"
                              title="Save changes"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                // Reset to original values
                                const original = originalValuesRef.current[metric.id]
                                if (original) {
                                  setGoalData(prev => {
                                    const newData = { ...prev }
                                    if (original.goal === metric.goalValue) {
                                      delete newData[metric.id]
                                    } else {
                                      newData[metric.id] = original.goal
                                    }
                                    return newData
                                  })
                                  setMonthlyData(prev => ({
                                    ...prev,
                                    [metric.id]: original.value
                                  }))
                                  delete originalValuesRef.current[metric.id]
                                }
                                setEditingMetric(null)
                                setFocusedInput(null)
                              }}
                              className="h-7 w-7 p-0 text-red-400"
                              title="Cancel editing and reset values"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="text-xs text-m8bs-muted">
                            Click to edit
                          </div>
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
                  className="flex items-center gap-2 border-red-500/50 text-red-400"
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
                    ? 'bg-green-600 text-white'
                    : 'bg-m8bs-blue text-white'
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
              <div className="ml-auto flex items-center gap-3 text-xs opacity-70">
                <span>Press <kbd className="px-1.5 py-0.5 bg-m8bs-card-alt border border-m8bs-border rounded text-xs">Ctrl+S</kbd> to save</span>
                <span>•</span>
                <span>Press <kbd className="px-1.5 py-0.5 bg-m8bs-card-alt border border-m8bs-border rounded text-xs">Enter</kbd> to save row</span>
                <span>•</span>
                <span>Press <kbd className="px-1.5 py-0.5 bg-m8bs-card-alt border border-m8bs-border rounded text-xs">Esc</kbd> to cancel</span>
              </div>
            </div>
          )}
        </CardFooter>
      </CardContent>
    </Card>
  )
}
