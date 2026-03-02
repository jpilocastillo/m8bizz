"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Users,
  User,
  Calendar,
  DollarSign,
  LogOut,
  Search,
  Eye,
  LayoutDashboard,
  Shield,
  Plus,
  Edit,
  Trash2,
  Key,
  AlertTriangle,
  Settings,
  Mail,
  Building2,
  UserCheck,
  ArrowRight,
  UserCircle,
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { UserManagementModal } from "@/components/admin/user-management-modal"
import { AdminNav } from "@/components/admin/admin-nav"
import { getAdminUsers } from "@/app/admin/actions"
import { logger } from "@/lib/logger"
import { cn } from "@/lib/utils"

interface UserProfile {
  id: string
  full_name: string
  email: string
  company: string
  role: string
  created_at: string
  updated_at: string
}

interface UserData {
  profile: UserProfile
  events_count: number
  total_revenue: number
  total_clients: number
  advisor_data?: any
}

export default function AdminDashboard() {
  const router = useRouter()
  const { toast } = useToast()
  
  const [users, setUsers] = useState<UserData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterRole, setFilterRole] = useState("all")
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<"create" | "edit" | "delete" | "reset-password">("create")
  const [selectedUserForAction, setSelectedUserForAction] = useState<UserProfile | null>(null)
  const [configError, setConfigError] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    checkConfiguration()
  }, [])

  const checkConfiguration = async () => {
    try {
      // Check if environment variables are configured
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      
      if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('your_supabase_project_url_here')) {
        setConfigError(true)
        setLoading(false)
        return
      }

      // If environment variables are configured, try to load users
      setIsAuthenticated(true)
      loadUsers()
    } catch (error) {
      console.error("Error checking configuration:", error)
      setConfigError(true)
      setLoading(false)
    }
  }

  const loadUsers = async () => {
    try {
      setLoading(true)
      logger.log("Loading users...")
      
      const result = await getAdminUsers()
      
      if (!result.success) {
        logger.error("Error loading users:", result.error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load users.",
        })
        return
      }

      logger.log("Users loaded:", result.data?.length || 0)
      setUsers(result.data || [])
    } catch (error) {
      logger.error("Error loading users:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load users.",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleUserSelect = (userData: UserData) => {
    setSelectedUser(userData)
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.profile.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.profile.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.profile.company?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesRole = filterRole === "all" || user.profile.role === filterRole
    
    return matchesSearch && matchesRole
  })

  const handleSignOut = async () => {
    router.push("/admin/login")
  }

  const handleCreateUser = () => {
    setModalMode("create")
    setSelectedUserForAction(null)
    setModalOpen(true)
  }

  const handleEditUser = (userProfile: UserProfile) => {
    setModalMode("edit")
    setSelectedUserForAction(userProfile)
    setModalOpen(true)
  }

  const handleDeleteUser = (userProfile: UserProfile) => {
    setModalMode("delete")
    setSelectedUserForAction(userProfile)
    setModalOpen(true)
  }

  const handleResetPassword = (userProfile: UserProfile) => {
    setModalMode("reset-password")
    setSelectedUserForAction(userProfile)
    setModalOpen(true)
  }

  const handleModalSuccess = () => {
    loadUsers()
    if (selectedUser?.profile.id === selectedUserForAction?.id) {
      setSelectedUser(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center space-y-6 animate-fade-in">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-m8bs-blue/20 border-t-m8bs-blue mx-auto"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-m8bs-blue/40 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          </div>
          <div className="space-y-2">
            <p className="text-white font-semibold text-lg">Loading admin dashboard</p>
            <p className="text-m8bs-muted text-sm">Preparing your workspace...</p>
          </div>
        </div>
      </div>
    )
  }

  if (configError) {
    return (
      <div className="min-h-screen bg-black">
        <AdminNav />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Card className="border-red-500/50 bg-gradient-to-br from-red-950/50 to-red-900/30 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-red-400">
                <AlertTriangle className="h-6 w-6" />
                <span>Configuration Required</span>
              </CardTitle>
              <CardDescription className="text-red-300">
                The admin dashboard requires Supabase configuration to function properly.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-m8bs-card p-6 rounded-lg border border-red-500/30 shadow-sm">
                <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Setup Instructions
                </h3>
                <ol className="list-decimal list-inside space-y-2 text-sm text-m8bs-muted">
                  <li>Create a <code className="bg-black px-2 py-1 rounded font-mono text-m8bs-blue">.env.local</code> file in your project root</li>
                  <li>Add your Supabase configuration:</li>
                </ol>
                <div className="mt-4 bg-black text-green-400 p-4 rounded-lg font-mono text-xs overflow-x-auto shadow-inner border border-m8bs-border">
                  <div>NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url</div>
                  <div>NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key</div>
                  <div>SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key</div>
                </div>
                <div className="mt-4 text-sm text-m8bs-muted bg-m8bs-card-alt p-3 rounded border border-m8bs-blue/30">
                  <p><strong className="text-white">Get these values from:</strong> Supabase Dashboard → Settings → API</p>
                </div>
              </div>
              
              <div className="bg-m8bs-card p-6 rounded-lg border border-m8bs-blue/30 shadow-sm">
                <h3 className="font-semibold text-white mb-3">Quick Setup Steps:</h3>
                <div className="space-y-2 text-sm text-m8bs-muted">
                  <div className="flex items-start gap-2">
                    <span className="font-semibold text-m8bs-blue">1.</span>
                    <p>Visit your Supabase project dashboard</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-semibold text-m8bs-blue">2.</span>
                    <p>Go to Settings → API</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-semibold text-m8bs-blue">3.</span>
                    <p>Copy the Project URL, anon key, and service_role key</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-semibold text-m8bs-blue">4.</span>
                    <p>Create the <code className="bg-black px-2 py-1 rounded font-mono text-m8bs-blue">.env.local</code> file with these values</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-semibold text-m8bs-blue">5.</span>
                    <p>Restart your development server</p>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <Button onClick={() => window.location.reload()} className="shadow-md">
                  <Settings className="h-4 w-4 mr-2" />
                  Reload After Setup
                </Button>
                <Button variant="outline" onClick={handleSignOut}>
                  Back to Login
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      <AdminNav />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Users List */}
          <div className="lg:col-span-1">
            <Card className="shadow-xl border-m8bs-border bg-m8bs-card hover:shadow-2xl transition-all duration-300">
              <CardHeader className="bg-gradient-to-r from-m8bs-card to-m8bs-card-alt border-b border-m8bs-border">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center space-x-2 text-white">
                      <div className="p-1.5 rounded-lg bg-m8bs-blue/20 border border-m8bs-blue/30">
                        <Users className="h-4 w-4 text-m8bs-blue" />
                      </div>
                      <span className="font-bold">Users</span>
                      <Badge variant="secondary" className="ml-2 bg-m8bs-blue/20 text-m8bs-blue border border-m8bs-blue/30 font-semibold">{filteredUsers.length}</Badge>
                    </CardTitle>
                    <CardDescription className="mt-2 text-m8bs-muted text-sm">Select a user to view their data</CardDescription>
                  </div>
                  <Button 
                    onClick={handleCreateUser} 
                    size="sm" 
                    className="shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 bg-gradient-to-r from-m8bs-blue to-m8bs-blue-dark hover:from-m8bs-blue-dark hover:to-m8bs-blue text-white font-semibold"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add User
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                {/* Search and Filter */}
                <div className="space-y-3">
                  <div className="relative group">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-m8bs-muted group-focus-within:text-m8bs-blue transition-colors" />
                    <Input
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 border-m8bs-border bg-black/50 text-white placeholder:text-m8bs-muted/50 focus:border-m8bs-blue focus:ring-2 focus:ring-m8bs-blue/20 focus:bg-black transition-all duration-200"
                    />
                  </div>
                  <Select value={filterRole} onValueChange={setFilterRole}>
                    <SelectTrigger className="border-m8bs-border bg-black/50 text-white hover:bg-black hover:border-m8bs-blue/50 transition-all duration-200">
                      <SelectValue placeholder="Filter by role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="user">Users</SelectItem>
                      <SelectItem value="admin">Admins</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Users List */}
                <div className="space-y-3 max-h-[calc(100vh-500px)] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-m8bs-border scrollbar-track-transparent">
                  {filteredUsers.length === 0 ? (
                    <div className="text-center py-16 animate-fade-in">
                      <div className="h-16 w-16 rounded-full bg-m8bs-card-alt border border-m8bs-border flex items-center justify-center mx-auto mb-4">
                        <Users className="h-8 w-8 text-m8bs-muted/40" />
                      </div>
                      <p className="font-semibold text-white mb-1">No users found</p>
                      <p className="text-sm text-m8bs-muted">Try adjusting your search or filters</p>
                    </div>
                  ) : (
                    filteredUsers.map((userData, index) => (
                      <div
                        key={userData.profile.id}
                        className={cn(
                          "p-4 rounded-xl border cursor-pointer transition-all duration-300 group animate-fade-in",
                          selectedUser?.profile.id === userData.profile.id
                            ? "bg-gradient-to-br from-m8bs-blue/30 to-m8bs-blue/10 border-m8bs-blue border-2 shadow-xl ring-2 ring-m8bs-blue/40 scale-[1.02]"
                            : "bg-m8bs-card border-m8bs-border hover:bg-m8bs-card-alt hover:border-m8bs-blue/60 hover:shadow-lg hover:scale-[1.01]"
                        )}
                        onClick={() => handleUserSelect(userData)}
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <UserCircle className="h-4 w-4 text-m8bs-muted flex-shrink-0" />
                              <div className="font-semibold text-white truncate">
                                {userData.profile.full_name || "Unnamed User"}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-m8bs-muted mb-1">
                              <Mail className="h-3 w-3 text-m8bs-muted flex-shrink-0" />
                              <span className="truncate">{userData.profile.email}</span>
                            </div>
                            {userData.profile.company && (
                              <div className="flex items-center gap-2 text-xs text-m8bs-muted/70">
                                <Building2 className="h-3 w-3 text-m8bs-muted/70 flex-shrink-0" />
                                <span className="truncate">{userData.profile.company}</span>
                              </div>
                            )}
                          </div>
                          <Badge 
                            variant={userData.profile.role === "admin" ? "destructive" : "secondary"}
                            className="ml-2 flex-shrink-0 bg-m8bs-card-alt text-m8bs-muted"
                          >
                            {userData.profile.role}
                          </Badge>
                        </div>
                        
                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-2 mb-3 pt-3 border-t border-m8bs-border">
                          <div className="text-center">
                            <div className="flex items-center justify-center gap-1 text-xs text-m8bs-muted mb-1">
                              <Calendar className="h-3 w-3" />
                            </div>
                            <div className="font-semibold text-white">{userData.events_count}</div>
                            <div className="text-xs text-m8bs-muted">Events</div>
                          </div>
                          <div className="text-center">
                            <div className="flex items-center justify-center gap-1 text-xs text-m8bs-muted mb-1">
                              <Users className="h-3 w-3" />
                            </div>
                            <div className="font-semibold text-white">{userData.total_clients}</div>
                            <div className="text-xs text-m8bs-muted">Clients</div>
                          </div>
                          <div className="text-center">
                            <div className="flex items-center justify-center gap-1 text-xs text-m8bs-muted mb-1">
                              <DollarSign className="h-3 w-3 text-green-400" />
                            </div>
                            <div className="font-semibold text-green-400">${(userData.total_revenue / 1000).toFixed(0)}k</div>
                            <div className="text-xs text-m8bs-muted">Revenue</div>
                          </div>
                        </div>
                      
                        {/* Action Buttons */}
                        <div className="flex items-center justify-end space-x-2 pt-3 border-t border-m8bs-border opacity-0 group-hover:opacity-100 transition-all duration-300">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleEditUser(userData.profile)
                            }}
                            className="h-8 w-8 p-0 hover:bg-m8bs-blue/20 text-m8bs-muted hover:text-m8bs-blue hover:scale-110 transition-all duration-200"
                            title="Edit user"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleResetPassword(userData.profile)
                            }}
                            className="h-8 w-8 p-0 hover:bg-amber-500/20 text-m8bs-muted hover:text-amber-400 hover:scale-110 transition-all duration-200"
                            title="Reset password"
                          >
                            <Key className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteUser(userData.profile)
                            }}
                            className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/20 hover:scale-110 transition-all duration-200"
                            title="Delete user"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* User Details */}
          <div className="lg:col-span-2">
            {selectedUser ? (
              <Card className="shadow-lg border-m8bs-border bg-m8bs-card">
                <CardHeader className="bg-gradient-to-r from-m8bs-card to-m8bs-card-alt border-b border-m8bs-border">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center space-x-2 text-white mb-2">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-m8bs-blue to-m8bs-blue-dark flex items-center justify-center text-white font-bold">
                          {selectedUser.profile.full_name?.charAt(0)?.toUpperCase() || "U"}
                        </div>
                        <div>
                          <div className="text-xl text-white">{selectedUser.profile.full_name || "Unnamed User"}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant={selectedUser.profile.role === "admin" ? "destructive" : "secondary"} className="text-xs bg-m8bs-card-alt text-m8bs-muted">
                              {selectedUser.profile.role}
                            </Badge>
                          </div>
                        </div>
                      </CardTitle>
                      <CardDescription className="flex items-center gap-4 text-sm text-m8bs-muted">
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {selectedUser.profile.email}
                        </span>
                        {selectedUser.profile.company && (
                          <span className="flex items-center gap-1">
                            <Building2 className="h-3 w-3" />
                            {selectedUser.profile.company}
                          </span>
                        )}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/admin/users/${selectedUser.profile.id}`}>
                        <Button
                          variant="default"
                          size="sm"
                          className="shadow-sm bg-m8bs-blue hover:bg-m8bs-blue-dark text-white"
                        >
                          <LayoutDashboard className="h-4 w-4 mr-2" />
                          View dashboard
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditUser(selectedUser.profile)}
                        className="shadow-sm border-m8bs-border bg-m8bs-card-alt text-m8bs-muted hover:bg-m8bs-blue/20 hover:text-m8bs-blue hover:border-m8bs-blue"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <p className="text-m8bs-muted text-sm mb-4">View this user&apos;s full dashboard or manage their account.</p>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleResetPassword(selectedUser.profile)} className="border-m8bs-border text-m8bs-muted hover:bg-amber-500/20 hover:text-amber-400">
                      <Key className="h-4 w-4 mr-2" />
                      Update password
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDeleteUser(selectedUser.profile)} className="border-red-500/50 text-red-400 hover:bg-red-500/20">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete user
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="shadow-xl border-m8bs-border border-dashed bg-m8bs-card hover:border-m8bs-blue/30 transition-all duration-300">
                <CardContent className="flex items-center justify-center py-24 animate-fade-in">
                  <div className="text-center max-w-md space-y-4">
                    <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-m8bs-blue/20 to-m8bs-blue/10 flex items-center justify-center mx-auto mb-6 border-2 border-m8bs-blue/30 shadow-lg">
                      <User className="h-12 w-12 text-m8bs-blue" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-2xl font-bold text-white">Select a User</h3>
                      <p className="text-m8bs-muted leading-relaxed">Choose a user from the list to view their dashboard or manage their account (edit, update password, delete).</p>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-sm text-m8bs-muted/70 pt-2">
                      <Eye className="h-4 w-4 animate-pulse" />
                      <span>User details and actions will appear here</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* User Management Modal */}
      <UserManagementModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        mode={modalMode}
        user={selectedUserForAction ?? undefined}
        onSuccess={handleModalSuccess}
      />
    </div>
  )
} 