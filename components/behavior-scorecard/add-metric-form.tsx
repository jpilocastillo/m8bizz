"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { behaviorScorecardService, type MetricType, type ScorecardRole } from '@/lib/behavior-scorecard'
import { useToast } from '@/hooks/use-toast'
import { Plus, X } from 'lucide-react'

interface AddMetricFormProps {
  roleId: string
  roleName: ScorecardRole
  onSuccess?: () => void
  onCancel?: () => void
}

export function AddMetricForm({ roleId, roleName, onSuccess, onCancel }: AddMetricFormProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    metricName: '',
    metricType: 'count' as MetricType,
    goalValue: '',
    isInverted: false,
  })

  const metricTypes: Array<{ value: MetricType; label: string; description: string }> = [
    { value: 'count', label: 'Count', description: 'Whole numbers (e.g., 10, 25, 100)' },
    { value: 'currency', label: 'Currency', description: 'Dollar amounts (e.g., $1,000, $50,000)' },
    { value: 'percentage', label: 'Percentage', description: 'Percentages (e.g., 5%, 10%, 95%)' },
    { value: 'time', label: 'Time', description: 'Days (e.g., 5 days, 30 days)' },
    { value: 'rating_1_5', label: 'Rating (1-5)', description: 'Rating scale from 1 to 5' },
    { value: 'rating_scale', label: 'Rating Scale', description: 'General rating scale' },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.metricName.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a metric name",
        variant: "destructive",
      })
      return
    }

    const goalValue = parseFloat(formData.goalValue)
    if (isNaN(goalValue) || goalValue < 0) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid goal value (must be a positive number)",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const result = await behaviorScorecardService.createMetric({
        roleId,
        metricName: formData.metricName.trim(),
        metricType: formData.metricType,
        goalValue,
        isInverted: formData.isInverted,
        isVisible: true, // New metrics are visible by default
      })

      if (result.success) {
        toast({
          title: "Metric added",
          description: `"${formData.metricName}" has been added to ${roleName}.`,
        })
        // Reset form
        setFormData({
          metricName: '',
          metricType: 'count',
          goalValue: '',
          isInverted: false,
        })
        if (onSuccess) {
          onSuccess()
        }
      } else {
        toast({
          title: "Error adding metric",
          description: result.error || "Failed to add metric",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error adding metric:', error)
      toast({
        title: "Error",
        description: "Failed to add metric",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="bg-m8bs-card-alt border-m8bs-border shadow-lg">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
              <Plus className="h-5 w-5 text-m8bs-blue" />
              Add Custom Metric
            </CardTitle>
            <CardDescription className="text-m8bs-muted mt-1">
              Create a new monthly statistic for {roleName}
            </CardDescription>
          </div>
          {onCancel && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
              className="text-m8bs-muted hover:text-white"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="metricName" className="text-white">
              Metric Name *
            </Label>
            <Input
              id="metricName"
              value={formData.metricName}
              onChange={(e) => setFormData({ ...formData, metricName: e.target.value })}
              placeholder="e.g., Client Meetings, Revenue Target"
              className="bg-m8bs-card border-m8bs-border text-white"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="metricType" className="text-white">
              Metric Type *
            </Label>
            <Select
              value={formData.metricType}
              onValueChange={(value) => setFormData({ ...formData, metricType: value as MetricType })}
            >
              <SelectTrigger className="bg-m8bs-card border-m8bs-border text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {metricTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div>
                      <div className="font-medium">{type.label}</div>
                      <div className="text-xs text-muted-foreground">{type.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="goalValue" className="text-white">
              Goal Value *
            </Label>
            <Input
              id="goalValue"
              type="number"
              step="0.01"
              min="0"
              value={formData.goalValue}
              onChange={(e) => setFormData({ ...formData, goalValue: e.target.value })}
              placeholder="Enter goal value"
              className="bg-m8bs-card border-m8bs-border text-white"
              required
            />
            <p className="text-xs text-m8bs-muted">
              The target value you want to achieve for this metric
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isInverted"
              checked={formData.isInverted}
              onCheckedChange={(checked) => setFormData({ ...formData, isInverted: checked === true })}
              className="border-m8bs-border"
            />
            <Label htmlFor="isInverted" className="text-white cursor-pointer">
              Inverted Metric (lower is better)
            </Label>
          </div>
          <p className="text-xs text-m8bs-muted -mt-2">
            Check this if a lower value is better (e.g., processing time, error rate)
          </p>

          <div className="flex justify-end gap-2 pt-2">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={loading}
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              disabled={loading}
              className="bg-m8bs-blue hover:bg-m8bs-blue-dark text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              {loading ? 'Adding...' : 'Add Metric'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

