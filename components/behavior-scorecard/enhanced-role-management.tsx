"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { behaviorScorecardService, type ScorecardRole, type ScorecardMetric, type MetricType } from '@/lib/behavior-scorecard'
import { useToast } from '@/hooks/use-toast'
import { Plus, Trash2, Edit2, Save, X, Users, Settings, GripVertical, ArrowUp, ArrowDown } from 'lucide-react'
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

interface EnhancedRoleManagementProps {
  roles: Array<{ id: string; name: ScorecardRole; metrics: ScorecardMetric[] }>
  onRoleChange?: () => void
}

export function EnhancedRoleManagement({ roles, onRoleChange }: EnhancedRoleManagementProps) {
  const { toast } = useToast()
  const [activeRoleTab, setActiveRoleTab] = useState<string | null>(null)
  const [newRoleName, setNewRoleName] = useState('')
  const [addingRole, setAddingRole] = useState(false)
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null)
  const [editingRoleName, setEditingRoleName] = useState('')
  const [deleteRoleId, setDeleteRoleId] = useState<string | null>(null)
  const [deletingRole, setDeletingRole] = useState(false)
  
  // Metric management state
  const [editingMetricId, setEditingMetricId] = useState<string | null>(null)
  const [editingMetric, setEditingMetric] = useState<Partial<ScorecardMetric> | null>(null)
  const [deleteMetricId, setDeleteMetricId] = useState<string | null>(null)
  const [deletingMetric, setDeletingMetric] = useState(false)
  const [showAddMetric, setShowAddMetric] = useState<string | null>(null)
  const [newMetric, setNewMetric] = useState({
    metricName: '',
    metricType: 'count' as MetricType,
    goalValue: '',
    isInverted: false,
  })

  useEffect(() => {
    if (roles.length > 0 && !activeRoleTab) {
      setActiveRoleTab(roles[0].id)
    } else if (roles.length === 0) {
      setActiveRoleTab(null)
    } else if (activeRoleTab && !roles.find(r => r.id === activeRoleTab)) {
      // Current tab role was deleted, switch to first available
      setActiveRoleTab(roles[0]?.id || null)
    }
  }, [roles, activeRoleTab])

  const metricTypes: Array<{ value: MetricType; label: string }> = [
    { value: 'count', label: 'Count' },
    { value: 'currency', label: 'Currency' },
    { value: 'percentage', label: 'Percentage' },
    { value: 'time', label: 'Time' },
    { value: 'rating_1_5', label: 'Rating (1-5)' },
    { value: 'rating_scale', label: 'Rating Scale' },
  ]

  const handleAddRole = async () => {
    if (!newRoleName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a role name",
        variant: "destructive",
      })
      return
    }

    setAddingRole(true)
    try {
      const result = await behaviorScorecardService.createRole(newRoleName.trim())
      if (result.success) {
        toast({
          title: "Role added",
          description: `Role "${newRoleName.trim()}" has been created.`,
        })
        setNewRoleName('')
        if (onRoleChange) {
          await onRoleChange()
        }
      } else {
        toast({
          title: "Error adding role",
          description: result.error || "Failed to add role",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error adding role:', error)
      toast({
        title: "Error",
        description: "Failed to add role",
        variant: "destructive",
      })
    } finally {
      setAddingRole(false)
    }
  }

  const handleEditRole = (roleId: string, currentName: string) => {
    setEditingRoleId(roleId)
    setEditingRoleName(currentName)
  }

  const handleSaveRole = async () => {
    if (!editingRoleId || !editingRoleName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a role name",
        variant: "destructive",
      })
      return
    }

    try {
      const result = await behaviorScorecardService.updateRole(editingRoleId, editingRoleName.trim())
      if (result.success) {
        toast({
          title: "Role updated",
          description: "Role name has been updated.",
        })
        setEditingRoleId(null)
        setEditingRoleName('')
        if (onRoleChange) {
          await onRoleChange()
        }
      } else {
        toast({
          title: "Error updating role",
          description: result.error || "Failed to update role",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error updating role:', error)
      toast({
        title: "Error",
        description: "Failed to update role",
        variant: "destructive",
      })
    }
  }

  const handleDeleteRole = async () => {
    if (!deleteRoleId) return

    setDeletingRole(true)
    try {
      const roleToDelete = roles.find(r => r.id === deleteRoleId)
      const roleName = roleToDelete?.name || 'Unknown'
      
      const result = await behaviorScorecardService.deleteRole(deleteRoleId)
      
      if (result.success) {
        toast({
          title: "Role deleted",
          description: `Role "${roleName}" and all its metrics have been deleted.`,
        })
        setDeleteRoleId(null)
        
        // Clear active tab if it was the deleted role
        if (activeRoleTab === deleteRoleId) {
          const remainingRoles = roles.filter(r => r.id !== deleteRoleId)
          setActiveRoleTab(remainingRoles.length > 0 ? remainingRoles[0].id : null)
        }
        
        // Refresh roles list
        if (onRoleChange) {
          // Small delay to ensure database transaction completes
          await new Promise(resolve => setTimeout(resolve, 300))
          await onRoleChange()
        }
      } else {
        console.error('Delete role error:', result.error)
        toast({
          title: "Error deleting role",
          description: result.error || "Failed to delete role. Please check console for details.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Exception deleting role:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete role",
        variant: "destructive",
      })
    } finally {
      setDeletingRole(false)
    }
  }

  const handleAddMetric = async (roleId: string) => {
    if (!newMetric.metricName.trim() || !newMetric.goalValue) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    try {
      const result = await behaviorScorecardService.createMetric({
        roleId,
        metricName: newMetric.metricName.trim(),
        metricType: newMetric.metricType,
        goalValue: parseFloat(newMetric.goalValue),
        isInverted: newMetric.isInverted,
      })

      if (result.success) {
        toast({
          title: "Metric added",
          description: `Metric "${newMetric.metricName}" has been added.`,
        })
        setNewMetric({
          metricName: '',
          metricType: 'count',
          goalValue: '',
          isInverted: false,
        })
        setShowAddMetric(null)
        if (onRoleChange) {
          await onRoleChange()
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
    }
  }

  const handleEditMetric = (metric: ScorecardMetric) => {
    setEditingMetricId(metric.id)
    setEditingMetric({
      metricName: metric.metricName,
      metricType: metric.metricType,
      goalValue: metric.goalValue,
      isInverted: metric.isInverted,
      isVisible: metric.isVisible,
    })
  }

  const handleSaveMetric = async () => {
    if (!editingMetricId || !editingMetric) {
      return
    }

    if (!editingMetric.metricName?.trim() || editingMetric.goalValue === undefined) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    try {
      const result = await behaviorScorecardService.updateMetric(editingMetricId, {
        metricName: editingMetric.metricName.trim(),
        metricType: editingMetric.metricType,
        goalValue: editingMetric.goalValue,
        isInverted: editingMetric.isInverted,
        isVisible: editingMetric.isVisible,
      })

      if (result.success) {
        toast({
          title: "Metric updated",
          description: "Metric has been updated.",
        })
        setEditingMetricId(null)
        setEditingMetric(null)
        if (onRoleChange) {
          await onRoleChange()
        }
      } else {
        toast({
          title: "Error updating metric",
          description: result.error || "Failed to update metric",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error updating metric:', error)
      toast({
        title: "Error",
        description: "Failed to update metric",
        variant: "destructive",
      })
    }
  }

  const handleDeleteMetric = async () => {
    if (!deleteMetricId) return

    setDeletingMetric(true)
    try {
      const result = await behaviorScorecardService.deleteMetric(deleteMetricId)
      if (result.success) {
        toast({
          title: "Metric deleted",
          description: "Metric has been deleted.",
        })
        setDeleteMetricId(null)
        if (onRoleChange) {
          await onRoleChange()
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
      setDeletingMetric(false)
    }
  }

  const handleMoveMetric = async (roleId: string, metricId: string, direction: 'up' | 'down') => {
    const role = roles.find(r => r.id === roleId)
    if (!role) return

    const metrics = [...role.metrics].sort((a, b) => a.displayOrder - b.displayOrder)
    const currentIndex = metrics.findIndex(m => m.id === metricId)
    
    if (currentIndex === -1) return
    
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    if (newIndex < 0 || newIndex >= metrics.length) return

    // Swap display orders
    const updates = [
      { metricId: metrics[currentIndex].id, displayOrder: metrics[newIndex].displayOrder },
      { metricId: metrics[newIndex].id, displayOrder: metrics[currentIndex].displayOrder },
    ]

    try {
      const result = await behaviorScorecardService.updateMetricsDisplayOrder(updates)
      if (result.success) {
        toast({
          title: "Metric moved",
          description: "Metric order has been updated.",
        })
        if (onRoleChange) {
          await onRoleChange()
        }
      } else {
        toast({
          title: "Error moving metric",
          description: result.error || "Failed to move metric",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error moving metric:', error)
      toast({
        title: "Error",
        description: "Failed to move metric",
        variant: "destructive",
      })
    }
  }

  const currentRole = roles.find(r => r.id === activeRoleTab)

  return (
    <Card className="bg-m8bs-card border-m8bs-card-alt shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
          <Users className="h-5 w-5 text-m8bs-blue" />
          Manage Roles & Metrics
        </CardTitle>
        <CardDescription className="text-m8bs-muted">
          Create, edit, and delete roles and their metrics
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add Role Section */}
        <div className="space-y-4">
          <div className="flex items-end gap-2">
            <div className="flex-1 space-y-2">
              <Label htmlFor="new-role" className="text-white">Add New Role</Label>
              <Input
                id="new-role"
                placeholder="Enter role name (e.g., Sales Manager)"
                value={newRoleName}
                onChange={(e) => setNewRoleName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !addingRole) {
                    handleAddRole()
                  }
                }}
                className="bg-m8bs-card-alt border-m8bs-border text-white placeholder:text-m8bs-muted"
              />
            </div>
            <Button
              onClick={handleAddRole}
              disabled={addingRole || !newRoleName.trim()}
              className="bg-m8bs-blue hover:bg-m8bs-blue-dark text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              {addingRole ? 'Adding...' : 'Add Role'}
            </Button>
          </div>
        </div>

        {/* Role Tabs */}
        {roles.length > 0 ? (
          <Tabs value={activeRoleTab || undefined} onValueChange={setActiveRoleTab} className="w-full">
            <TabsList className="flex flex-wrap gap-2 bg-m8bs-card-alt p-1">
              {roles.map((role) => (
                <TabsTrigger
                  key={role.id}
                  value={role.id}
                  className="data-[state=active]:bg-m8bs-blue data-[state=active]:text-white text-white/70"
                >
                  {editingRoleId === role.id ? (
                    <div className="flex items-center gap-2">
                      <Input
                        value={editingRoleName}
                        onChange={(e) => setEditingRoleName(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleSaveRole()
                          } else if (e.key === 'Escape') {
                            setEditingRoleId(null)
                            setEditingRoleName('')
                          }
                        }}
                        className="h-6 w-32 bg-m8bs-card border-m8bs-border text-white text-sm"
                        autoFocus
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleSaveRole()
                        }}
                        className="h-6 w-6 p-0 text-green-400 hover:text-green-300"
                      >
                        <Save className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation()
                          setEditingRoleId(null)
                          setEditingRoleName('')
                        }}
                        className="h-6 w-6 p-0 text-red-400 hover:text-red-300"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span>{role.name}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEditRole(role.id, role.name)
                        }}
                        className="h-5 w-5 p-0 text-m8bs-muted hover:text-white"
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation()
                          setDeleteRoleId(role.id)
                        }}
                        className="h-5 w-5 p-0 text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>

            {roles.map((role) => (
              <TabsContent key={role.id} value={role.id} className="space-y-4 mt-4">
                <Card className="bg-m8bs-card-alt border-m8bs-border">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-semibold text-white">
                        Metrics for {role.name}
                      </CardTitle>
                      <Button
                        onClick={() => setShowAddMetric(showAddMetric === role.id ? null : role.id)}
                        size="sm"
                        className="bg-m8bs-blue hover:bg-m8bs-blue-dark text-white"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Metric
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Add Metric Form */}
                    {showAddMetric === role.id && (
                      <Card className="bg-m8bs-card border-m8bs-border p-4">
                        <div className="space-y-4">
                          <div>
                            <Label className="text-white">Metric Name</Label>
                            <Input
                              value={newMetric.metricName}
                              onChange={(e) => setNewMetric({ ...newMetric, metricName: e.target.value })}
                              placeholder="e.g., Sales Calls Made"
                              className="bg-m8bs-card-alt border-m8bs-border text-white"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label className="text-white">Type</Label>
                              <Select
                                value={newMetric.metricType}
                                onValueChange={(v) => setNewMetric({ ...newMetric, metricType: v as MetricType })}
                              >
                                <SelectTrigger className="bg-m8bs-card-alt border-m8bs-border text-white">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {metricTypes.map((type) => (
                                    <SelectItem key={type.value} value={type.value}>
                                      {type.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label className="text-white">Goal Value</Label>
                              <Input
                                type="number"
                                value={newMetric.goalValue}
                                onChange={(e) => setNewMetric({ ...newMetric, goalValue: e.target.value })}
                                placeholder="0"
                                className="bg-m8bs-card-alt border-m8bs-border text-white"
                              />
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="inverted"
                              checked={newMetric.isInverted}
                              onCheckedChange={(checked) => setNewMetric({ ...newMetric, isInverted: !!checked })}
                            />
                            <Label htmlFor="inverted" className="text-white text-sm">
                              Inverted (lower is better)
                            </Label>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleAddMetric(role.id)}
                              className="bg-m8bs-blue hover:bg-m8bs-blue-dark text-white"
                            >
                              <Save className="h-4 w-4 mr-2" />
                              Save Metric
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => {
                                setShowAddMetric(null)
                                setNewMetric({
                                  metricName: '',
                                  metricType: 'count',
                                  goalValue: '',
                                  isInverted: false,
                                })
                              }}
                              className="border-m8bs-border text-white"
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </Card>
                    )}

                    {/* Metrics List */}
                    {role.metrics.length === 0 ? (
                      <p className="text-m8bs-muted text-sm text-center py-4">
                        No metrics yet. Click "Add Metric" to create one.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {[...role.metrics].sort((a, b) => a.displayOrder - b.displayOrder).map((metric, index, sortedMetrics) => (
                          <Card
                            key={metric.id}
                            className="bg-m8bs-card border-m8bs-border p-4 hover:border-m8bs-blue/50 transition-colors"
                          >
                            {editingMetricId === metric.id ? (
                              <div className="space-y-4">
                                <div>
                                  <Label className="text-white">Metric Name</Label>
                                  <Input
                                    value={editingMetric?.metricName || ''}
                                    onChange={(e) => setEditingMetric({ ...editingMetric, metricName: e.target.value })}
                                    className="bg-m8bs-card-alt border-m8bs-border text-white"
                                  />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label className="text-white">Type</Label>
                                    <Select
                                      value={editingMetric?.metricType || 'count'}
                                      onValueChange={(v) => setEditingMetric({ ...editingMetric, metricType: v as MetricType })}
                                    >
                                      <SelectTrigger className="bg-m8bs-card-alt border-m8bs-border text-white">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {metricTypes.map((type) => (
                                          <SelectItem key={type.value} value={type.value}>
                                            {type.label}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div>
                                    <Label className="text-white">Goal Value</Label>
                                    <Input
                                      type="number"
                                      value={editingMetric?.goalValue || ''}
                                      onChange={(e) => setEditingMetric({ ...editingMetric, goalValue: parseFloat(e.target.value) })}
                                      className="bg-m8bs-card-alt border-m8bs-border text-white"
                                    />
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`inverted-${metric.id}`}
                                    checked={editingMetric?.isInverted || false}
                                    onCheckedChange={(checked) => setEditingMetric({ ...editingMetric, isInverted: !!checked })}
                                  />
                                  <Label htmlFor={`inverted-${metric.id}`} className="text-white text-sm">
                                    Inverted (lower is better)
                                  </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`visible-${metric.id}`}
                                    checked={editingMetric?.isVisible !== false}
                                    onCheckedChange={(checked) => setEditingMetric({ ...editingMetric, isVisible: !!checked })}
                                  />
                                  <Label htmlFor={`visible-${metric.id}`} className="text-white text-sm">
                                    Visible in scorecard
                                  </Label>
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    onClick={handleSaveMetric}
                                    className="bg-m8bs-blue hover:bg-m8bs-blue-dark text-white"
                                  >
                                    <Save className="h-4 w-4 mr-2" />
                                    Save
                                  </Button>
                                  <Button
                                    variant="outline"
                                    onClick={() => {
                                      setEditingMetricId(null)
                                      setEditingMetric(null)
                                    }}
                                    className="border-m8bs-border text-white"
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2 flex-1">
                                  <div className="flex flex-col gap-1">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => handleMoveMetric(role.id, metric.id, 'up')}
                                      disabled={index === 0}
                                      className="h-4 w-4 p-0 text-m8bs-muted hover:text-white disabled:opacity-30"
                                      title="Move up"
                                    >
                                      <ArrowUp className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => handleMoveMetric(role.id, metric.id, 'down')}
                                      disabled={index === sortedMetrics.length - 1}
                                      className="h-4 w-4 p-0 text-m8bs-muted hover:text-white disabled:opacity-30"
                                      title="Move down"
                                    >
                                      <ArrowDown className="h-3 w-3" />
                                    </Button>
                                  </div>
                                  <GripVertical className="h-4 w-4 text-m8bs-muted" />
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <h4 className="font-semibold text-white">{metric.metricName}</h4>
                                      {!metric.isVisible && (
                                        <span className="text-xs text-m8bs-muted bg-m8bs-card px-2 py-1 rounded">
                                          Hidden
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-sm text-m8bs-muted mt-1">
                                      Type: {metricTypes.find(t => t.value === metric.metricType)?.label || metric.metricType} • 
                                      Goal: {metric.goalValue} {metric.isInverted && '• Inverted'}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleEditMetric(metric)}
                                    className="text-m8bs-muted hover:text-white"
                                    title="Edit metric"
                                  >
                                    <Edit2 className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => setDeleteMetricId(metric.id)}
                                    className="text-red-400 hover:text-red-300"
                                    title="Delete metric"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            )}
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        ) : (
          <p className="text-m8bs-muted text-sm text-center py-8">
            No roles yet. Add your first role above.
          </p>
        )}

        {/* Delete Role Confirmation Dialog */}
        <AlertDialog open={!!deleteRoleId} onOpenChange={(open) => {
          if (!open && !deletingRole) {
            setDeleteRoleId(null)
          }
        }}>
          <AlertDialogContent className="bg-m8bs-card border-m8bs-card-alt">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white">Delete Role</AlertDialogTitle>
              <AlertDialogDescription className="text-m8bs-muted">
                Are you sure you want to delete "{roles.find(r => r.id === deleteRoleId)?.name}"? 
                This will permanently delete the role and all associated metrics, weekly data, and scorecard summaries. 
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel 
                className="bg-m8bs-card-alt border-m8bs-border text-white hover:bg-m8bs-card"
                disabled={deletingRole}
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={(e) => {
                  e.preventDefault()
                  handleDeleteRole()
                }}
                disabled={deletingRole}
                className="bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
              >
                {deletingRole ? 'Deleting...' : 'Delete'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Delete Metric Confirmation Dialog */}
        <AlertDialog open={!!deleteMetricId} onOpenChange={(open) => !open && setDeleteMetricId(null)}>
          <AlertDialogContent className="bg-m8bs-card border-m8bs-card-alt">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white">Delete Metric</AlertDialogTitle>
              <AlertDialogDescription className="text-m8bs-muted">
                Are you sure you want to delete this metric? This will permanently delete the metric and all associated data. 
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-m8bs-card-alt border-m8bs-border text-white hover:bg-m8bs-card">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteMetric}
                disabled={deletingMetric}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {deletingMetric ? 'Deleting...' : 'Delete'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  )
}

