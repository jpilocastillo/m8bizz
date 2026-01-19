"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { behaviorScorecardService, type ScorecardRole } from '@/lib/behavior-scorecard'
import { useToast } from '@/hooks/use-toast'
import { Plus, Trash2, Users, Edit2, Check, X } from 'lucide-react'
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

interface RoleManagementProps {
  roles: Array<{ id: string; name: ScorecardRole; metrics: any[] }>
  onRoleChange?: () => void
}

export function RoleManagement({ roles, onRoleChange }: RoleManagementProps) {
  const { toast } = useToast()
  const [newRoleName, setNewRoleName] = useState('')
  const [adding, setAdding] = useState(false)
  const [deleteRoleId, setDeleteRoleId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null)
  const [editingRoleName, setEditingRoleName] = useState('')
  const [updating, setUpdating] = useState(false)


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
      const result = await behaviorScorecardService.createRole(newRoleName.trim())
      if (result.success) {
        toast({
          title: "Role added",
          description: `Role "${newRoleName.trim()}" has been created successfully.`,
        })
        setNewRoleName('')
        if (onRoleChange) {
          onRoleChange()
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

  const handleEditRole = (role: { id: string; name: ScorecardRole }) => {
    setEditingRoleId(role.id)
    setEditingRoleName(role.name)
  }

  const handleCancelEdit = () => {
    setEditingRoleId(null)
    setEditingRoleName('')
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
    
    // Check if the name actually changed
    const currentRole = roles.find(r => r.id === editingRoleId)
    if (currentRole && currentRole.name === trimmedName) {
      // No change needed, just exit edit mode
      setEditingRoleId(null)
      setEditingRoleName('')
      return
    }

    setUpdating(true)
    try {
      console.log('Updating role:', { roleId: editingRoleId, newName: trimmedName })
      const result = await behaviorScorecardService.updateRole(editingRoleId, trimmedName)
      console.log('Update result:', result)
      
      if (result.success) {
        toast({
          title: "Role updated",
          description: `Role name has been updated successfully.`,
        })
        // Clear editing state first
        setEditingRoleId(null)
        setEditingRoleName('')
        // Then refresh roles - await to ensure it completes
        if (onRoleChange) {
          await onRoleChange()
        }
      } else {
        console.error('Update failed:', result.error)
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
      const roleToDelete = roles.find(r => r.id === deleteRoleId)
      if (!roleToDelete) {
        toast({
          title: "Error",
          description: "Role not found",
          variant: "destructive",
        })
        setDeleteRoleId(null)
        return
      }

      const result = await behaviorScorecardService.deleteRole(deleteRoleId)
      
      if (result.success) {
        toast({
          title: "Role deleted",
          description: `Role "${roleToDelete.name}" and all its metrics have been deleted.`,
        })
        setDeleteRoleId(null)
        
        // Remove the role from local state immediately to prevent UI issues
        // The refresh will happen next, but this prevents race conditions
        if (onRoleChange) {
          // Small delay to ensure database transaction is complete
          await new Promise(resolve => setTimeout(resolve, 100))
          await onRoleChange()
        }
      } else {
        console.error('Delete failed:', result.error)
        toast({
          title: "Error deleting role",
          description: result.error || "Failed to delete role",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error deleting role:', error)
      const errorMessage = error instanceof Error ? error.message : "Failed to delete role"
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Card className="bg-m8bs-card border-m8bs-card-alt shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
          <Users className="h-5 w-5 text-m8bs-blue" />
          Manage Roles
        </CardTitle>
        <CardDescription className="text-m8bs-muted">
          Add, edit, or remove roles for your business behavior scorecard
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
              className="bg-m8bs-blue hover:bg-m8bs-blue-dark text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              {adding ? 'Adding...' : 'Add Role'}
            </Button>
          </div>
        </div>

        {/* Existing Roles List */}
        <div className="space-y-2">
          <Label className="text-white">Existing Roles</Label>
          <div className="space-y-2">
            {roles.length === 0 ? (
              <p className="text-m8bs-muted text-sm">No roles yet. Add your first role above.</p>
            ) : (
              roles.map((role) => (
                <div
                  key={role.id}
                  className="flex items-center justify-between p-3 bg-m8bs-card-alt border border-m8bs-border rounded-lg"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <Users className="h-4 w-4 text-m8bs-muted" />
                    {editingRoleId === role.id ? (
                      <div className="flex items-center gap-2 flex-1">
                        <Input
                          value={editingRoleName}
                          onChange={(e) => setEditingRoleName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !updating) {
                              handleSaveEdit()
                            } else if (e.key === 'Escape') {
                              handleCancelEdit()
                            }
                          }}
                          className="bg-m8bs-card border-m8bs-border text-white flex-1"
                          autoFocus
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleSaveEdit}
                          disabled={updating}
                          className="text-green-400 hover:text-green-300 hover:bg-green-950/20"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleCancelEdit}
                          disabled={updating}
                          className="text-m8bs-muted hover:text-white hover:bg-m8bs-card"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex-1">
                        <p className="font-semibold text-white">{role.name}</p>
                        <p className="text-xs text-m8bs-muted">
                          {role.metrics.length} {role.metrics.length === 1 ? 'metric' : 'metrics'}
                        </p>
                      </div>
                    )}
                  </div>
                  {editingRoleId !== role.id && (
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditRole(role)}
                        className="text-m8bs-blue hover:text-m8bs-blue-dark hover:bg-m8bs-blue/10"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteRoleId(role.id)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-950/20"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
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
              <AlertDialogCancel className="bg-m8bs-card-alt border-m8bs-border text-white hover:bg-m8bs-card">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteRole}
                disabled={deleting}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  )
}









