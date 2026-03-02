import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Database, 
  User, 
  Settings, 
  CheckCircle2,
  XCircle,
  AlertCircle,
  Server,
  Globe,
  Key
} from "lucide-react"
import { logger } from "@/lib/logger"

export default async function DebugPage() {
  const supabase = await createClient()
  
  // Get user info
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  let role: string | null = null
  let profileData: any = null
  
  if (user) {
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()
    
    role = profile?.role || null
    profileData = profile
    
    if (profileError) {
      logger.error("Error fetching profile:", profileError)
    }
  }

  // Test database connection
  let dbConnected = false
  let dbError: string | null = null
  let dbTestResult: any = null
  
  try {
    const { data, error: queryError } = await supabase
      .from("profiles")
      .select("id, email, role")
      .limit(5)
    
    dbConnected = !queryError
    dbError = queryError?.message || null
    dbTestResult = data
  } catch (err) {
    dbConnected = false
    dbError = err instanceof Error ? err.message : "Unknown error"
    logger.error("Database test error:", err)
  }

  // Environment info
  const envInfo = {
    nodeEnv: process.env.NODE_ENV || "unknown",
    hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || "Not set",
    timestamp: new Date().toISOString(),
  }

  logger.debug("Debug page accessed", { user: user?.id, timestamp: envInfo.timestamp })

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-4xl font-bold mb-2">Production Debug Dashboard</h1>
          <p className="text-gray-400">
            Debug information for production troubleshooting
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Environment Info */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Environment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="text-sm text-gray-400 mb-1">Environment</div>
                <Badge variant={envInfo.nodeEnv === "production" ? "default" : "secondary"}>
                  {envInfo.nodeEnv}
                </Badge>
              </div>
              <div>
                <div className="text-sm text-gray-400 mb-1">Timestamp</div>
                <div className="text-sm">{envInfo.timestamp}</div>
              </div>
            </CardContent>
          </Card>

          {/* User Info */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                User Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {user ? (
                <>
                  <div>
                    <div className="text-sm text-gray-400 mb-1">User ID</div>
                    <div className="text-sm font-mono break-all">{user.id}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Email</div>
                    <div className="text-sm">{user.email}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Role</div>
                    <Badge>{role || "No role assigned"}</Badge>
                  </div>
                  {userError && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{userError.message}</AlertDescription>
                    </Alert>
                  )}
                </>
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>Not authenticated</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Database Status */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Database Connection
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {dbConnected ? (
                <>
                  <Alert>
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <AlertDescription>Database connected successfully</AlertDescription>
                  </Alert>
                  {dbTestResult && (
                    <div>
                      <div className="text-sm text-gray-400 mb-2">Test Query Result</div>
                      <div className="text-xs bg-gray-800 p-2 rounded overflow-x-auto">
                        <pre>{JSON.stringify(dbTestResult, null, 2)}</pre>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>
                    Database connection failed: {dbError || "Unknown error"}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Configuration */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Supabase URL</span>
                  {envInfo.hasSupabaseUrl ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                </div>
                <div className="text-xs text-gray-400 font-mono break-all">
                  {envInfo.supabaseUrl.substring(0, 50)}...
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Anon Key</span>
                {envInfo.hasAnonKey ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Service Role Key</span>
                {envInfo.hasServiceKey ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
              </div>
            </CardContent>
          </Card>

          {/* Profile Data */}
          {profileData && (
            <Card className="bg-gray-900 border-gray-800 md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="h-5 w-5" />
                  Profile Data
                </CardTitle>
                <CardDescription>Full profile information from database</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-xs bg-gray-800 p-4 rounded overflow-x-auto">
                  <pre>{JSON.stringify(profileData, null, 2)}</pre>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle>Raw Debug Data</CardTitle>
            <CardDescription>Complete debug information in JSON format</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-xs bg-gray-800 p-4 rounded overflow-x-auto">
              <pre>{JSON.stringify({
                environment: envInfo,
                user: user ? {
                  id: user.id,
                  email: user.email,
                  role: role,
                } : null,
                database: {
                  connected: dbConnected,
                  error: dbError,
                  testResult: dbTestResult,
                },
                profile: profileData,
              }, null, 2)}</pre>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


