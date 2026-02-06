"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { MetricVisibilitySettings } from '@/components/behavior-scorecard/metric-visibility-settings'
import { behaviorScorecardService, type ScorecardRole } from '@/lib/behavior-scorecard'
import { useToast } from '@/hooks/use-toast'
import { Settings, Users, Plus, Trash2, Edit2, Check, X, ChevronDown, ChevronUp, ChevronsDownUp, ChevronsUpDown } from 'lucide-react'
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
  roles: Array<{ id: string; name: ScorecardRole; personName?: string | null; metrics: any[] }>
  onRoleChange?: () => void
}

export function EnhancedRoleManagement({ roles, onRoleChange }: EnhancedRoleManagementProps) {
  const { toast } = useToast()
  const [newRoleName, setNewRoleName] = useState('')
  const [newPersonName, setNewPersonName] = useState('')
  const [adding, setAdding] = useState(false)
  const [deleteRoleId, setDeleteRoleId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null)
  const [editingRoleName, setEditingRoleName] = useState('')
  const [editingPersonName, setEditingPersonName] = useState('')
  const [updating, setUpdating] = useState(false)
  const [expandedRoles, setExpandedRoles] = useState<Set<string>>(new Set())

  // All roles start collapsed - user can expand as needed
  // No auto-expand

  const toggleRoleExpansion = (roleId: string) => {
    setExpandedRoles(prev => {
      const newSet = new Set(prev)
      if (newSet.has(roleId)) {
        newSet.delete(roleId)
      } else {
        newSet.add(roleId)
      }
      return newSet
    })
  }

  const handleAddRole = async () => {
    if (!newRoleName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a role name",
        variant: "destructive",
      })
      return
    }

    setAdding(true)
    try {
      const result = await behaviorScorecardService.createRole(newRoleName.trim(), newPersonName.trim() || undefined)
      if (result.success) {
        toast({
          title: "Role added",
          description: `Role "${newRoleName.trim()}" has been created successfully.`,
        })
        setNewRoleName('')
        setNewPersonName('')
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
      setAdding(false)
    }
  }

  const handleEditRole = (role: { id: string; name: ScorecardRole; personName?: string | null }) => {
    setEditingRoleId(role.id)
    setEditingRoleName(role.name)
    setEditingPersonName(role.personName || '')
  }

  const handleCancelEdit = () => {
    setEditingRoleId(null)
    setEditingRoleName('')
    setEditingPersonName('')
  }

  const handleSaveEdit = async () => {
    if (!editingRoleId || !editingRoleName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a role name",
        variant: "destructive",
      })
      return
    }

    const trimmedName = editingRoleName.trim()
    const trimmedPersonName = editingPersonName.trim() || null
    const currentRole = roles.find(r => r.id === editingRoleId)
    
    // Check if anything has changed
    const roleNameChanged = currentRole && currentRole.name !== trimmedName
    const personNameChanged = (currentRole?.personName || null) !== trimmedPersonName
    
    // If nothing changed, just exit edit mode
    if (currentRole && !roleNameChanged && !personNameChanged) {
      setEditingRoleId(null)
      setEditingRoleName('')
      setEditingPersonName('')
      return
    }

    setUpdating(true)
    try {
      const result = await behaviorScorecardService.updateRole(editingRoleId, trimmedName, trimmedPersonName || undefined)
      if (result.success) {
        toast({
          title: "Role updated",
          description: `Role name has been updated successfully.`,
        })
        setEditingRoleId(null)
        setEditingRoleName('')
        setEditingPersonName('')
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
        description: error instanceof Error ? error.message : "Failed to update role",
        variant: "destructive",
      })
    } finally {
      setUpdating(false)
    }
  }

  const handleDeleteRole = async () => {
    if (!deleteRoleId) return

    setDeleting(true)
    try {
      const result = await behaviorScorecardService.deleteRole(deleteRoleId)
      if (result.success) {
        toast({
          title: "Role deleted",
          description: "Role and all associated data have been deleted.",
        })
        setExpandedRoles(prev => {
          const newSet = new Set(prev)
          newSet.delete(deleteRoleId)
          return newSet
        })
        setDeleteRoleId(null)
        if (onRoleChange) {
          await onRoleChange()
        }
      } else {
        toast({
          title: "Error deleting role",
          description: result.error || "Failed to delete role",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error deleting role:', error)
      toast({
        title: "Error",
        description: "Failed to delete role",
        variant: "destructive",
      })
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="bg-m8bs-card border-m8bs-card-alt shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="h-5 w-5 text-m8bs-blue" />
            Manage Roles & Metrics
          </CardTitle>
          <CardDescription className="text-m8bs-muted">
            Add, edit, or remove roles and customize their metrics in one place
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Add Role Section */}
          <div className="space-y-4 pb-4 border-b border-m8bs-border">
            <div className="space-y-2">
              <Label className="text-white">Add New Role</Label>
              <div className="flex items-end gap-2">
                <div className="flex-1 space-y-2">
                  <Input
                    id="new-role"
                    placeholder="Enter role name (e.g., Sales Manager)"
                    value={newRoleName}
                    onChange={(e) => setNewRoleName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !adding) {
                        handleAddRole()
                      }
                    }}
                    className="bg-m8bs-card-alt border-m8bs-border text-white placeholder:text-m8bs-muted"
                  />
                  <Input
                    id="new-person"
                    placeholder="Person name (optional)"
                    value={newPersonName}
                    onChange={(e) => setNewPersonName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !adding) {
                        handleAddRole()
                      }
                    }}
                    className="bg-m8bs-card-alt border-m8bs-border text-white placeholder:text-m8bs-muted"
                  />
                </div>
                <Button
                  onClick={handleAddRole}
                  disabled={adding || !newRoleName.trim()}
                  className="bg-m8bs-blue text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {adding ? 'Adding...' : 'Add Role'}
                </Button>
              </div>
            </div>
          </div>

          {/* Expand/Collapse All Controls */}
          {roles.length > 0 && (
            <div className="flex items-center justify-between pb-2 border-b border-m8bs-border">
              <Label className="text-white">Roles ({roles.length})</Label>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setExpandedRoles(new Set(roles.map(r => r.id)))
                  }}
                  className="text-xs border-m8bs-border text-white"
                >
                  <ChevronsDownUp className="h-3 w-3 mr-1" />
                  Expand All
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setExpandedRoles(new Set())
                  }}
                  className="text-xs border-m8bs-border text-white"
                >
                  <ChevronsUpDown className="h-3 w-3 mr-1" />
                  Collapse All
                </Button>
              </div>
            </div>
          )}

          {/* Roles List with Expandable Metrics */}
          <div className="space-y-3">
            {roles.length === 0 ? (
              <div className="text-center py-8 text-m8bs-muted">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No roles yet. Add your first role above.</p>
              </div>
            ) : (
              roles.map((role) => {
                const isExpanded = expandedRoles.has(role.id)
                const isEditing = editingRoleId === role.id

                return (
                  <Collapsible
                    key={role.id}
                    open={isExpanded}
                    onOpenChange={() => toggleRoleExpansion(role.id)}
                  >
                    <Card className="bg-m8bs-card-alt border-m8bs-border">
                      <CollapsibleTrigger asChild>
                        <CardHeader className="cursor-pointer pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 flex-1">
                              <Users className="h-4 w-4 text-m8bs-muted" />
                              {isEditing ? (
                                <div className="flex flex-col gap-2 flex-1">
                                  <Input
                                    placeholder="Role name"
                                    value={editingRoleName}
                                    onChange={(e) => setEditingRoleName(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter' && !updating) {
                                        handleSaveEdit()
                                      } else if (e.key === 'Escape') {
                                        handleCancelEdit()
                                      }
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                    className="bg-m8bs-card border-m8bs-border text-white"
                                    autoFocus
                                  />
                                  <Input
                                    placeholder="Person name (optional)"
                                    value={editingPersonName}
                                    onChange={(e) => setEditingPersonName(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter' && !updating) {
                                        handleSaveEdit()
                                      } else if (e.key === 'Escape') {
                                        handleCancelEdit()
                                      }
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                    className="bg-m8bs-card border-m8bs-border text-white"
                                  />
                                  <div className="flex items-center gap-2">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        handleSaveEdit()
                                      }}
                                      disabled={updating}
                                      className="text-green-400"
                                    >
                                      <Check className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        handleCancelEdit()
                                      }}
                                      disabled={updating}
                                      className="text-m8bs-muted"
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex-1">
                                  <CardTitle className="text-lg font-semibold text-white">
                                    {role.name}
                                  </CardTitle>
                                  <CardDescription className="text-m8bs-muted text-sm mt-1">
                                    {role.personName ? (
                                      <span>{role.personName} • {role.metrics.length} {role.metrics.length === 1 ? 'metric' : 'metrics'}</span>
                                    ) : (
                                      <span>{role.metrics.length} {role.metrics.length === 1 ? 'metric' : 'metrics'}</span>
                                    )}
                                  </CardDescription>
                                </div>
                              )}
                            </div>
                            {!isEditing && (
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleEditRole(role)
                                  }}
                                  className="text-m8bs-blue"
                                >
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setDeleteRoleId(role.id)
                                  }}
                                  className="text-red-400"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                                {isExpanded ? (
                                  <ChevronUp className="h-4 w-4 text-m8bs-muted" />
                                ) : (
                                  <ChevronDown className="h-4 w-4 text-m8bs-muted" />
                                )}
                              </div>
                            )}
                          </div>
                        </CardHeader>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <CardContent className="pt-0 pb-4">
                          <div className="pt-4 border-t border-m8bs-border">
                            <MetricVisibilitySettings
                              roleId={role.id}
                              roleName={role.name}
                              onSave={async () => {
                                if (onRoleChange) {
                                  await onRoleChange()
                                }
                              }}
                            />
                          </div>
                        </CardContent>
                      </CollapsibleContent>
                    </Card>
                  </Collapsible>
                )
              })
            )}
          </div>

          {/* Delete Confirmation Dialog */}
          <AlertDialog open={!!deleteRoleId} onOpenChange={(open) => !open && setDeleteRoleId(null)}>
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
                <AlertDialogCancel className="bg-m8bs-card-alt border-m8bs-border text-white">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteRole}
                  disabled={deleting}
                  className="bg-red-600 text-white"
                >
                  {deleting ? 'Deleting...' : 'Delete'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  )
}
