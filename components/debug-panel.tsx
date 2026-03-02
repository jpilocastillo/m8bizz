"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Bug, 
  Database, 
  User, 
  Settings, 
  RefreshCw, 
  Copy, 
  CheckCircle2,
  XCircle,
  AlertCircle,
  Info
} from "lucide-react"
import { logger } from "@/lib/logger"

interface DebugInfo {
  environment: string
  timestamp: string
  user: {
    id: string | null
    email: string | null
    role: string | null
  }
  database: {
    connected: boolean
    error: string | null
  }
  supabase: {
    url: string | null
    hasAnonKey: boolean
  }
  system: {
    userAgent: string
    viewport: { width: number; height: number }
    cookies: string[]
  }
}

export function DebugPanel() {
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    loadDebugInfo()
    
    // Update viewport on resize
    const handleResize = () => {
      loadDebugInfo()
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  async function loadDebugInfo() {
    setLoading(true)
    try {
      const supabase = createClient()
      
      // Get user info
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      let role: string | null = null
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single()
        role = profile?.role || null
      }

      // Test database connection
      let dbConnected = false
      let dbError: string | null = null
      try {
        const { error: queryError } = await supabase
          .from("profiles")
          .select("id")
          .limit(1)
        dbConnected = !queryError
        dbError = queryError?.message || null
      } catch (err) {
        dbConnected = false
        dbError = err instanceof Error ? err.message : "Unknown error"
      }

      // Get system info
      const viewport = {
        width: window.innerWidth,
        height: window.innerHeight,
      }

      const cookies = document.cookie.split(";").map(c => c.trim())

      const info: DebugInfo = {
        environment: process.env.NODE_ENV || "unknown",
        timestamp: new Date().toISOString(),
        user: {
          id: user?.id || null,
          email: user?.email || null,
          role: role,
        },
        database: {
          connected: dbConnected,
          error: dbError,
        },
        supabase: {
          url: process.env.NEXT_PUBLIC_SUPABASE_URL || null,
          hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        },
        system: {
          userAgent: navigator.userAgent,
          viewport,
          cookies,
        },
      }

      setDebugInfo(info)
      logger.debug("Debug info loaded", info)
    } catch (error) {
      logger.error("Error loading debug info:", error)
    } finally {
      setLoading(false)
    }
  }

  function copyDebugInfo() {
    if (!debugInfo) return
    
    const debugText = JSON.stringify(debugInfo, null, 2)
    navigator.clipboard.writeText(debugText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    logger.debug("Debug info copied to clipboard")
  }

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          variant="outline"
          size="sm"
          className="bg-background/80 backdrop-blur-sm"
        >
          <Bug className="h-4 w-4 mr-2" />
          Debug
        </Button>
      </div>
    )
  }

  if (loading || !debugInfo) {
    return (
      <div className="fixed bottom-4 right-4 z-50 w-96 max-h-[80vh] overflow-y-auto">
        <Card className="bg-background/95 backdrop-blur-sm border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bug className="h-5 w-5" />
              Debug Panel
            </CardTitle>
            <CardDescription>Loading debug information...</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 max-h-[80vh] overflow-y-auto">
      <Card className="bg-background/95 backdrop-blur-sm border-2 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Bug className="h-5 w-5" />
              Debug Panel
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={loadDebugInfo}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={copyDebugInfo}
              >
                {copied ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
              >
                <XCircle className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <CardDescription>
            Production Debug Information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="system">System</TabsTrigger>
              <TabsTrigger value="raw">Raw Data</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-4">
              <div className="space-y-3">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Info className="h-4 w-4" />
                    <span className="text-sm font-semibold">Environment</span>
                  </div>
                  <Badge variant={debugInfo.environment === "production" ? "default" : "secondary"}>
                    {debugInfo.environment}
                  </Badge>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <User className="h-4 w-4" />
                    <span className="text-sm font-semibold">User</span>
                  </div>
                  <div className="text-sm space-y-1">
                    <div>ID: {debugInfo.user.id || "Not logged in"}</div>
                    <div>Email: {debugInfo.user.email || "N/A"}</div>
                    <div>Role: {debugInfo.user.role || "N/A"}</div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Database className="h-4 w-4" />
                    <span className="text-sm font-semibold">Database</span>
                  </div>
                  {debugInfo.database.connected ? (
                    <Alert>
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <AlertDescription>Connected</AlertDescription>
                    </Alert>
                  ) : (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        {debugInfo.database.error || "Connection failed"}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Settings className="h-4 w-4" />
                    <span className="text-sm font-semibold">Supabase Config</span>
                  </div>
                  <div className="text-sm space-y-1">
                    <div>URL: {debugInfo.supabase.url ? "✓ Set" : "✗ Missing"}</div>
                    <div>Anon Key: {debugInfo.supabase.hasAnonKey ? "✓ Set" : "✗ Missing"}</div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="system" className="space-y-4">
              <div className="space-y-3">
                <div>
                  <div className="text-sm font-semibold mb-2">Viewport</div>
                  <div className="text-sm">
                    {debugInfo.system.viewport.width} × {debugInfo.system.viewport.height}px
                  </div>
                </div>

                <div>
                  <div className="text-sm font-semibold mb-2">User Agent</div>
                  <div className="text-xs bg-muted p-2 rounded break-all">
                    {debugInfo.system.userAgent}
                  </div>
                </div>

                <div>
                  <div className="text-sm font-semibold mb-2">Cookies ({debugInfo.system.cookies.length})</div>
                  <div className="text-xs bg-muted p-2 rounded max-h-32 overflow-y-auto">
                    {debugInfo.system.cookies.length > 0 ? (
                      <ul className="list-disc list-inside space-y-1">
                        {debugInfo.system.cookies.map((cookie, i) => (
                          <li key={i}>{cookie}</li>
                        ))}
                      </ul>
                    ) : (
                      "No cookies"
                    )}
                  </div>
                </div>

                <div>
                  <div className="text-sm font-semibold mb-2">Timestamp</div>
                  <div className="text-sm">{debugInfo.timestamp}</div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="raw" className="space-y-4">
              <div>
                <div className="text-sm font-semibold mb-2">Raw Debug Data</div>
                <pre className="text-xs bg-muted p-3 rounded overflow-x-auto max-h-64 overflow-y-auto">
                  {JSON.stringify(debugInfo, null, 2)}
                </pre>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}


