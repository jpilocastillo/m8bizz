"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { useToast } from "@/components/ui/use-toast"
import { createUser, updateUser, deleteUser, resetUserPassword } from "@/app/admin/actions"
import { Eye, EyeOff, Trash2, Edit, Key } from "lucide-react"

interface UserProfile {
  id: string
  full_name: string
  email: string
  company: string
  role: string
  created_at: string
  updated_at: string
}

interface UserManagementModalProps {
  isOpen: boolean
  onClose: () => void
  mode: "create" | "edit" | "delete" | "reset-password"
  user?: UserProfile
  onSuccess: () => void
}

export function UserManagementModal({ isOpen, onClose, mode, user, onSuccess }: UserManagementModalProps) {
  const [formData, setFormData] = useState({
    full_name: user?.full_name || "",
    email: user?.email || "",
    company: user?.company || "",
    role: user?.role || "user",
    password: "",
    confirmPassword: ""
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      let result

      switch (mode) {
        case "create":
          if (formData.password !== formData.confirmPassword) {
            toast({
              variant: "destructive",
              title: "Error",
              description: "Passwords do not match.",
            })
            return
          }
          result = await createUser(
            formData.full_name,
            formData.email,
            formData.password,
            formData.company,
            formData.role
          )
          break

        case "edit":
          result = await updateUser(user!.id, {
            full_name: formData.full_name,
            email: formData.email,
            company: formData.company,
            role: formData.role,
          })
          break

        case "reset-password":
          if (formData.password !== formData.confirmPassword) {
            toast({
              variant: "destructive",
              title: "Error",
              description: "Passwords do not match.",
            })
            return
          }
          result = await resetUserPassword(user!.id, formData.password)
          break

        case "delete":
          result = await deleteUser(user!.id)
          break

        default:
          throw new Error("Invalid mode")
      }

      if (result.success) {
        toast({
          title: "Success",
          description: getSuccessMessage(mode),
        })
        onSuccess()
        onClose()
        resetForm()
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error || "An error occurred",
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      full_name: "",
      email: "",
      company: "",
      role: "user",
      password: "",
      confirmPassword: ""
    })
  }

  const getSuccessMessage = (mode: string) => {
    switch (mode) {
      case "create": return "User created successfully"
      case "edit": return "User updated successfully"
      case "delete": return "User deleted successfully"
      case "reset-password": return "Password reset successfully"
      default: return "Operation completed successfully"
    }
  }

  const getTitle = () => {
    switch (mode) {
      case "create": return "Create New User"
      case "edit": return "Edit User"
      case "delete": return "Delete User"
      case "reset-password": return "Reset Password"
      default: return "User Management"
    }
  }

  const getDescription = () => {
    switch (mode) {
      case "create": return "Create a new user account with the specified details."
      case "edit": return "Update the user's information."
      case "delete": return "Are you sure you want to delete this user? This action cannot be undone."
      case "reset-password": return "Set a new password for this user."
      default: return ""
    }
  }

  // Delete confirmation dialog
  if (mode === "delete") {
    return (
      <AlertDialog open={isOpen} onOpenChange={onClose}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{user?.full_name || user?.email}</strong>? 
              This action cannot be undone and will permanently remove the user and all their data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSubmit}
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {isLoading ? "Deleting..." : "Delete User"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
          <DialogDescription>{getDescription()}</DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {(mode === "create" || mode === "edit") && (
            <>
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {(mode === "create" || mode === "reset-password") && (
            <>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    required
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>
            </>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Processing..." : getSubmitButtonText()}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )

  function getSubmitButtonText() {
    switch (mode) {
      case "create": return "Create User"
      case "edit": return "Update User"
      case "reset-password": return "Reset Password"
      default: return "Submit"
    }
  }
}

