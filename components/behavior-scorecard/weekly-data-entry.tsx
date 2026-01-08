"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { behaviorScorecardService, type ScorecardRole, type ScorecardMetric } from '@/lib/behavior-scorecard'
import { Save, Calendar, Calculator } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface WeeklyDataEntryProps {
  roleName: ScorecardRole
  roleId: string
  metrics: ScorecardMetric[]
  year: number
  month: number
  onSave?: () => void
}

export function WeeklyDataEntry({ roleName, roleId, metrics, year, month, onSave }: WeeklyDataEntryProps) {
  const { toast } = useToast()
  const [weekData, setWeekData] = useState<Record<string, Record<number, number>>>({})
  const [saving, setSaving] = useState(false)

  // Initialize week data structure
  useEffect(() => {
    const initialData: Record<string, Record<number, number>> = {}
    metrics.forEach(metric => {
      initialData[metric.id] = {}
      for (let week = 1; week <= 4; week++) {
        initialData[metric.id][week] = 0
      }
    })
    setWeekData(initialData)

    // Load existing data
    loadWeeklyData()
  }, [metrics, year])

  const loadWeeklyData = async () => {
    if (metrics.length === 0) return
    
    // Batch load all weekly data at once for better performance
    const metricIds = metrics.map(m => m.id)
    const result = await behaviorScorecardService.getBatchWeeklyData(metricIds, year)
    
    if (result.success && result.data) {
      setWeekData(prev => {
        const updated = { ...prev }
        result.data!.forEach((weeklyDataArray, metricId) => {
          updated[metricId] = {}
          weeklyDataArray.forEach(wd => {
            updated[metricId][wd.weekNumber] = wd.actualValue
          })
        })
        return updated
      })
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

  const handleSave = async () => {
    setSaving(true)
    try {
      for (const metric of metrics) {
        for (let week = 1; week <= 4; week++) {
          const value = weekData[metric.id]?.[week] || 0
          if (value > 0) {
            await behaviorScorecardService.saveWeeklyData(metric.id, week, year, value)
          }
        }
      }

      // Calculate monthly summary
      await behaviorScorecardService.calculateMonthlySummary(month, year)

      toast({
        title: "Data saved successfully",
        description: `Weekly data for ${roleName} has been saved.`,
      })

      if (onSave) {
        onSave()
      }
    } catch (error) {
      toast({
        title: "Error saving data",
        description: "Failed to save weekly data. Please try again.",
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

  return (
    <Card className="bg-black border-m8bs-border shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl text-white flex items-center gap-2">
          <Calendar className="h-5 w-5 text-m8bs-blue" />
          {roleName} - Weekly Data Entry
        </CardTitle>
        <CardDescription className="text-m8bs-muted">
          Enter Weekly Data For {month}/{year}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs defaultValue="week1" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="week1">Week 1</TabsTrigger>
            <TabsTrigger value="week2">Week 2</TabsTrigger>
            <TabsTrigger value="week3">Week 3</TabsTrigger>
            <TabsTrigger value="week4">Week 4</TabsTrigger>
          </TabsList>

          {[1, 2, 3, 4].map(week => (
            <TabsContent key={week} value={`week${week}`} className="space-y-4">
              <div className="grid gap-4">
                {metrics.map(metric => (
                  <div key={metric.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center p-4 bg-black-alt rounded-lg border border-m8bs-border">
                    <div className="md:col-span-2">
                      <Label className="text-white font-medium">{metric.metricName}</Label>
                      <p className="text-xs text-m8bs-muted mt-1">
                        Goal: {formatValue(metric.goalValue, metric.metricType)}
                        {metric.isInverted && ' (lower is better)'}
                      </p>
                    </div>
                    <div>
                      <Label htmlFor={`${metric.id}-week${week}`} className="text-white font-medium">
                        Week {week} Value
                      </Label>
                      <Input
                        id={`${metric.id}-week${week}`}
                        type="number"
                        step={metric.metricType === 'currency' ? '100' : metric.metricType === 'rating_1_5' ? '0.1' : '1'}
                        min="0"
                        max={metric.metricType === 'rating_1_5' ? '5' : undefined}
                        value={weekData[metric.id]?.[week] || 0}
                        onChange={(e) => handleWeekValueChange(metric.id, week, e.target.value)}
                        className="bg-black-alt border-m8bs-border text-white focus:border-m8bs-blue focus:ring-m8bs-blue/20 transition-colors"
                      />
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-m8bs-muted">Total: {formatValue(calculateTotal(metric.id), metric.metricType)}</p>
                      {(metric.metricType === 'rating_1_5' || metric.metricType === 'rating_scale') && (
                        <p className="text-xs text-m8bs-muted">Avg: {calculateAverage(metric.id).toFixed(2)}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        <CardFooter className="flex justify-end gap-2 pt-4">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-m8bs-blue hover:bg-m8bs-blue-dark text-white transition-colors"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Saving...' : 'Save Weekly Data'}
          </Button>
        </CardFooter>
      </CardContent>
    </Card>
  )
}





