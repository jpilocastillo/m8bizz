"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { behaviorScorecardService, type ScorecardMetric, type ScorecardRole } from '@/lib/behavior-scorecard'
import { useToast } from '@/hooks/use-toast'
import { Settings, Save, Plus, Trash2 } from 'lucide-react'
import { AddMetricForm } from './add-metric-form'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface MetricVisibilitySettingsProps {
  roleId: string
  roleName: ScorecardRole
  onSave?: () => void
}

export function MetricVisibilitySettings({ roleId, roleName, onSave }: MetricVisibilitySettingsProps) {
  const { toast } = useToast()
  const [metrics, setMetrics] = useState<ScorecardMetric[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [visibilityMap, setVisibilityMap] = useState<Record<string, boolean>>({})
  const [showAddForm, setShowAddForm] = useState(false)
  const [deleteMetricId, setDeleteMetricId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    loadMetrics()
  }, [roleId])

  const loadMetrics = async () => {
    setLoading(true)
    try {
      const result = await behaviorScorecardService.getRoleMetrics(roleId)
      if (result.success && result.data) {
        setMetrics(result.data)
        // Initialize visibility map with current visibility settings
        const initialVisibility: Record<string, boolean> = {}
        result.data.forEach(metric => {
          initialVisibility[metric.id] = metric.isVisible ?? true
        })
        setVisibilityMap(initialVisibility)
      } else {
        toast({
          title: "Error loading metrics",
          description: result.error || "Failed to load metrics",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error loading metrics:', error)
      toast({
        title: "Error",
        description: "Failed to load metrics",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleToggleVisibility = (metricId: string) => {
    setVisibilityMap(prev => ({
      ...prev,
      [metricId]: !prev[metricId],
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const updates = Object.entries(visibilityMap).map(([metricId, isVisible]) => ({
        metricId,
        isVisible,
      }))

      const result = await behaviorScorecardService.updateMetricVisibilities(updates)
      if (result.success) {
        toast({
          title: "Settings saved",
          description: `Visibility settings for ${roleName} have been updated.`,
        })
        if (onSave) {
          onSave()
        }
      } else {
        toast({
          title: "Error saving settings",
          description: result.error || "Failed to save visibility settings",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error saving visibility settings:', error)
      toast({
        title: "Error",
        description: "Failed to save visibility settings",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleSelectAll = () => {
    const newMap: Record<string, boolean> = {}
    metrics.forEach(metric => {
      newMap[metric.id] = true
    })
    setVisibilityMap(newMap)
  }

  const handleDeselectAll = () => {
    const newMap: Record<string, boolean> = {}
    metrics.forEach(metric => {
      newMap[metric.id] = false
    })
    setVisibilityMap(newMap)
  }

  const handleAddSuccess = () => {
    setShowAddForm(false)
    loadMetrics() // Reload metrics to show the new one
  }

  const handleDeleteClick = (metricId: string) => {
    setDeleteMetricId(metricId)
  }

  const handleDeleteConfirm = async () => {
    if (!deleteMetricId) return

    setDeleting(true)
    try {
      const result = await behaviorScorecardService.deleteMetric(deleteMetricId)
      if (result.success) {
        toast({
          title: "Metric deleted",
          description: "The metric has been removed.",
        })
        await loadMetrics() // Reload metrics
        if (onSave) {
          onSave()
        }
      } else {
        toast({
          title: "Error deleting metric",
          description: result.error || "Failed to delete metric",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error deleting metric:', error)
      toast({
        title: "Error",
        description: "Failed to delete metric",
        variant: "destructive",
      })
    } finally {
      setDeleting(false)
      setDeleteMetricId(null)
    }
  }

  if (loading) {
    return (
      <Card className="bg-m8bs-card border-m8bs-card-alt shadow-lg">
        <CardContent className="p-6">
          <div className="text-center text-m8bs-muted">Loading metrics...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-m8bs-card border-m8bs-card-alt shadow-lg">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
              <Settings className="h-5 w-5 text-m8bs-blue" />
              Customize Monthly Statistics
            </CardTitle>
            <CardDescription className="text-m8bs-muted mt-1">
              Select which metrics to display for {roleName}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAddForm(true)}
              className="text-xs"
            >
              <Plus className="h-3 w-3 mr-1" />
              Add Metric
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
              className="text-xs"
            >
              Select All
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDeselectAll}
              className="text-xs"
            >
              Deselect All
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {showAddForm && (
          <div className="mb-6">
            <AddMetricForm
              roleId={roleId}
              roleName={roleName}
              onSuccess={handleAddSuccess}
              onCancel={() => setShowAddForm(false)}
            />
          </div>
        )}
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-3">
            {metrics.length === 0 ? (
              <div className="text-center text-m8bs-muted py-8">
                No metrics found for this role.
                {!showAddForm && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAddForm(true)}
                    className="mt-4"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Metric
                  </Button>
                )}
              </div>
            ) : (
              metrics.map((metric) => (
                <div
                  key={metric.id}
                  className="flex items-center space-x-3 p-3 rounded-lg border border-m8bs-border bg-m8bs-card-alt hover:bg-m8bs-card transition-colors"
                >
                  <Checkbox
                    id={metric.id}
                    checked={visibilityMap[metric.id] ?? true}
                    onCheckedChange={() => handleToggleVisibility(metric.id)}
                    className="border-m8bs-border"
                  />
                  <Label
                    htmlFor={metric.id}
                    className="flex-1 text-white font-medium cursor-pointer"
                  >
                    {metric.metricName}
                  </Label>
                  <span className="text-xs text-m8bs-muted px-2 py-1 rounded bg-m8bs-card border border-m8bs-border">
                    {metric.metricType}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteClick(metric.id)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-8 w-8 p-0"
                    title="Delete metric"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
        <div className="mt-6 flex justify-end">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-m8bs-blue hover:bg-m8bs-blue-dark text-white"
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </CardContent>

      <AlertDialog open={deleteMetricId !== null} onOpenChange={(open) => !open && setDeleteMetricId(null)}>
        <AlertDialogContent className="bg-m8bs-card border-m8bs-card-alt">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete Metric</AlertDialogTitle>
            <AlertDialogDescription className="text-m8bs-muted">
              Are you sure you want to delete this metric? This action cannot be undone. 
              All weekly data associated with this metric will also be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}

