"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Mail, Lock, Shield, AlertTriangle, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { createClient } from "@/lib/supabase/client"

export default function AdminLoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [configError, setConfigError] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    checkConfiguration()
  }, [])

  const checkConfiguration = () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('your_supabase_project_url_here')) {
      setConfigError(true)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        toast({
          variant: "destructive",
          title: "Login failed",
          description: error.message || "Invalid email or password. Please try again.",
        })
        return
      }

      // Check if user has admin role
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single()

      if (profileError) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to verify admin privileges.",
        })
        return
      }

      if (profile.role !== "admin") {
        toast({
          variant: "destructive",
          title: "Access denied",
          description: "You do not have admin privileges.",
        })
        await supabase.auth.signOut()
        return
      }

      toast({
        title: "Admin login successful",
        description: "Welcome to the admin dashboard",
      })
      router.push("/admin/dashboard")
      router.refresh()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Login error",
        description: "An unexpected error occurred. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (configError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-2xl border-red-200">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-red-800">Configuration Required</CardTitle>
            <CardDescription className="text-red-600">
              The admin system requires Supabase configuration to function properly.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-white p-4 rounded-lg border border-red-200">
              <h3 className="font-semibold text-gray-900 mb-3">Setup Instructions:</h3>
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
            
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-gray-900 mb-2">Quick Setup:</h3>
              <div className="space-y-2 text-sm text-gray-700">
                <p>1. Visit your Supabase project dashboard</p>
                <p>2. Go to Settings → API</p>
                <p>3. Copy the Project URL, anon key, and service_role key</p>
                <p>4. Create the <code className="bg-gray-100 px-1 rounded">.env.local</code> file with these values</p>
                <p>5. Restart your development server</p>
                <p>6. Create an admin user using: <code className="bg-gray-100 px-1 rounded">npm run create-admin admin@example.com password</code></p>
              </div>
            </div>

            <div className="flex justify-center space-x-3">
              <Button onClick={() => window.location.reload()}>
                <Settings className="h-4 w-4 mr-2" />
                Reload After Setup
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <Shield className="h-6 w-6 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold">Admin Login</CardTitle>
          <CardDescription>
            Access the admin dashboard to manage users and view system data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  required
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
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign in as Admin"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 