"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Users, 
  User, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  LogOut,
  Search,
  Eye,
  Shield,
  Plus,
  Edit,
  Trash2,
  Key,
  AlertTriangle,
  Settings
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { UserManagementModal } from "@/components/admin/user-management-modal"

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
  const [userDetails, setUserDetails] = useState<any>(null)
  const [loadingDetails, setLoadingDetails] = useState(false)
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
      console.log("Loading users...")
      
      const result = await getAdminUsers()
      
      if (!result.success) {
        console.error("Error loading users:", result.error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load users.",
        })
        return
      }

      console.log("Users loaded:", result.data?.length || 0)
      setUsers(result.data || [])
    } catch (error) {
      console.error("Error loading users:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load users.",
      })
    } finally {
      setLoading(false)
    }
  }

  const loadUserDetails = async (userId: string) => {
    try {
      setLoadingDetails(true)
      console.log("Loading details for user:", userId)
      
      const result = await getUserDetails(userId)
      
      if (!result.success) {
        console.error("Error loading user details:", result.error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load user details.",
        })
        return
      }

      setUserDetails(result.data)
    } catch (error) {
      console.error("Error loading user details:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load user details.",
      })
    } finally {
      setLoadingDetails(false)
    }
  }

  const handleUserSelect = (userData: UserData) => {
    setSelectedUser(userData)
    loadUserDetails(userData.profile.id)
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
    loadUsers() // Refresh the users list
    if (selectedUser?.profile.id === selectedUserForAction?.id) {
      setSelectedUser(null)
      setUserDetails(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (configError) {
    return (
      <div className="min-h-screen bg-black">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-3">
                <Shield className="h-8 w-8 text-blue-600" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                  <p className="text-sm text-gray-500">Manage users and view system data</p>
                </div>
              </div>
              <Button variant="outline" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Back to Login
              </Button>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-red-800">
                <AlertTriangle className="h-5 w-5" />
                <span>Configuration Required</span>
              </CardTitle>
              <CardDescription className="text-red-600">
                The admin dashboard requires Supabase configuration to function properly.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-white p-4 rounded-lg border border-red-200">
                <h3 className="font-semibold text-gray-900 mb-2">Setup Instructions:</h3>
                <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                  <li>Create a <code className="bg-gray-100 px-1 rounded">.env.local</code> file in your project root</li>
                  <li>Add your Supabase configuration:</li>
                </ol>
                <div className="mt-3 bg-gray-900 text-green-400 p-3 rounded-lg font-mono text-xs overflow-x-auto">
                  <div>NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url</div>
                  <div>NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key</div>
                  <div>SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key</div>
                </div>
                <div className="mt-3 text-sm text-gray-600">
                  <p><strong>Get these values from:</strong> Supabase Dashboard → Settings → API</p>
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-gray-900 mb-2">Quick Setup:</h3>
                <div className="space-y-2 text-sm">
                  <p>1. Visit your Supabase project dashboard</p>
                  <p>2. Go to Settings → API</p>
                  <p>3. Copy the Project URL, anon key, and service_role key</p>
                  <p>4. Create the <code className="bg-gray-100 px-1 rounded">.env.local</code> file with these values</p>
                  <p>5. Restart your development server</p>
                </div>
              </div>

              <div className="flex space-x-3">
                <Button onClick={() => window.location.reload()}>
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <Shield className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-500">Manage users and view system data</p>
              </div>
            </div>
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Users List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <Users className="h-5 w-5" />
                      <span>Users ({filteredUsers.length})</span>
                    </CardTitle>
                    <CardDescription>Select a user to view their data</CardDescription>
                  </div>
                  <Button onClick={handleCreateUser} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add User
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Search and Filter */}
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={filterRole} onValueChange={setFilterRole}>
                    <SelectTrigger>
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
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {filteredUsers.map((userData) => (
                    <div
                      key={userData.profile.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedUser?.profile.id === userData.profile.id
                          ? "bg-blue-50 border-blue-200"
                          : "bg-white border-gray-200 hover:bg-gray-50"
                      }`}
                      onClick={() => handleUserSelect(userData)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">
                            {userData.profile.full_name || "Unnamed User"}
                          </div>
                          <div className="text-sm text-gray-500">
                            {userData.profile.email}
                          </div>
                          {userData.profile.company && (
                            <div className="text-xs text-gray-400">
                              {userData.profile.company}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={userData.profile.role === "admin" ? "destructive" : "secondary"}>
                            {userData.profile.role}
                          </Badge>
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex items-center justify-end space-x-1 mt-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleEditUser(userData.profile)
                          }}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleResetPassword(userData.profile)
                          }}
                          className="h-8 w-8 p-0"
                        >
                          <Key className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteUser(userData.profile)
                          }}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                        <span>{userData.events_count} events</span>
                        <span>{userData.total_clients} clients</span>
                        <span>${userData.total_revenue.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* User Details */}
          <div className="lg:col-span-2">
            {selectedUser ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="h-5 w-5" />
                    <span>{selectedUser.profile.full_name || "Unnamed User"}</span>
                  </CardTitle>
                  <CardDescription>
                    {selectedUser.profile.email} • {selectedUser.profile.company || "No company"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingDetails ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                  ) : (
                    <Tabs defaultValue="overview" className="w-full">
                      <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="advisor">Advisor Data</TabsTrigger>
                        <TabsTrigger value="events">Events</TabsTrigger>
                        <TabsTrigger value="financial">Financial</TabsTrigger>
                      </TabsList>

                      <TabsContent value="overview" className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                              <CardTitle className="text-sm font-medium">Total Events</CardTitle>
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                              <div className="text-2xl font-bold">{selectedUser.events_count}</div>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                              <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
                              <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                              <div className="text-2xl font-bold">{selectedUser.total_clients}</div>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                              <DollarSign className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                              <div className="text-2xl font-bold">
                                ${selectedUser.total_revenue.toLocaleString()}
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </TabsContent>

                      <TabsContent value="advisor" className="space-y-4">
                        {userDetails ? (
                          <div className="space-y-4">
                            {userDetails.advisorData && (
                              <Card>
                                <CardHeader>
                                  <CardTitle>Business Goals</CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <Label>Business Goal</Label>
                                      <div className="text-lg font-semibold">
                                        ${userDetails.advisorData.business_goal?.toLocaleString()}
                                      </div>
                                    </div>
                                    <div>
                                      <Label>AUM Goal %</Label>
                                      <div className="text-lg font-semibold">
                                        {userDetails.advisorData.aum_goal_percentage}%
                                      </div>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            )}

                            {userDetails.currentValues && (
                              <Card>
                                <CardHeader>
                                  <CardTitle>Current Values</CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <Label>Current AUM</Label>
                                      <div className="text-lg font-semibold">
                                        ${userDetails.currentValues.current_aum?.toLocaleString()}
                                      </div>
                                    </div>
                                    <div>
                                      <Label>Current Annuity</Label>
                                      <div className="text-lg font-semibold">
                                        ${userDetails.currentValues.current_annuity?.toLocaleString()}
                                      </div>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            )}

                            {userDetails.campaigns && userDetails.campaigns.length > 0 && (
                              <Card>
                                <CardHeader>
                                  <CardTitle>Marketing Campaigns</CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <div className="space-y-2">
                                    {userDetails.campaigns.map((campaign: any, index: number) => (
                                      <div key={index} className="flex justify-between items-center p-2 border rounded">
                                        <span className="font-medium">{campaign.name}</span>
                                        <Badge variant="outline">{campaign.status}</Badge>
                                      </div>
                                    ))}
                                  </div>
                                </CardContent>
                              </Card>
                            )}
                          </div>
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            No advisor data available for this user.
                          </div>
                        )}
                      </TabsContent>

                      <TabsContent value="events" className="space-y-4">
                        <div className="text-center py-8 text-gray-500">
                          Event details will be displayed here.
                        </div>
                      </TabsContent>

                      <TabsContent value="financial" className="space-y-4">
                        <div className="text-center py-8 text-gray-500">
                          Financial details will be displayed here.
                        </div>
                      </TabsContent>
                    </Tabs>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Select a User</h3>
                    <p className="text-gray-500">Choose a user from the list to view their data</p>
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
        user={selectedUserForAction}
        onSuccess={handleModalSuccess}
      />
    </div>
  )
} 