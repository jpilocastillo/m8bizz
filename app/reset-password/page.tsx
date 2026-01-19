"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Lock, Eye, EyeOff, ArrowLeft, CheckCircle2 } from "lucide-react"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { createClient } from "@/lib/supabase/client"

const formSchema = z.object({
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

export default function ResetPassword() {
  const [isLoading, setIsLoading] = useState(false)
  const [isVerifying, setIsVerifying] = useState(true)
  const [isValidToken, setIsValidToken] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  })

  // Verify the reset token when component mounts
  useEffect(() => {
    async function verifyToken() {
      try {
        const supabase = createClient()
        
        // Log the full URL for debugging
        console.log("Full URL:", window.location.href)
        console.log("Hash:", window.location.hash)
        console.log("Search:", window.location.search)
        
        // Check for code parameter (PKCE flow) - Supabase sends this in query string
        const urlParams = new URLSearchParams(window.location.search)
        const code = urlParams.get('code')
        const type = urlParams.get('type')
        
        // Check if we have hash fragments in the URL (from email link)
        // Supabase may send the reset link with hash fragments like: #access_token=xxx&type=recovery
        const hash = window.location.hash.substring(1) // Remove the #
        const hashParams = new URLSearchParams(hash)
        const accessToken = hashParams.get('access_token')
        const hashType = hashParams.get('type')
        const refreshToken = hashParams.get('refresh_token')
        
        // Also check for other query params
        const queryToken = urlParams.get('token')
        const queryType = urlParams.get('type')

        console.log("Code parameter:", code)
        console.log("Type parameter:", type || hashType)
        console.log("Hash params - access_token:", !!accessToken, "type:", hashType)
        console.log("Query params - token:", !!queryToken, "type:", queryType)

        // Handle PKCE flow with code parameter (most common in newer Supabase versions)
        if (code) {
          console.log("Found code parameter, exchanging for session...")
          
          try {
            // Exchange the code for a session
            const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
            
            console.log("Code exchange response:", { hasSession: !!data?.session, error: exchangeError })
            
            if (exchangeError) {
              console.error("Code exchange error:", exchangeError)
              
              let errorMessage = "This password reset link is invalid or has expired. Please request a new one."
              if (exchangeError.message?.includes("expired") || exchangeError.message?.includes("invalid")) {
                errorMessage = "This password reset link has expired. Please request a new one."
              } else if (exchangeError.message) {
                errorMessage = exchangeError.message
              }
              
              setIsValidToken(false)
              toast({
                variant: "destructive",
                title: "Invalid or expired link",
                description: errorMessage,
              })
            } else if (data?.session) {
              console.log("Session created successfully from code")
              setIsValidToken(true)
              // Clear the code from URL for security
              window.history.replaceState(null, '', window.location.pathname)
              return // Exit early since we've successfully processed the code
            } else {
              console.warn("Code exchange succeeded but no session returned")
              setIsValidToken(false)
              toast({
                variant: "destructive",
                title: "Invalid or expired link",
                description: "This password reset link is invalid or has expired. Please request a new one.",
              })
              return // Exit early
            }
          } catch (error: any) {
            console.error("Error exchanging code:", error)
            setIsValidToken(false)
            toast({
              variant: "destructive",
              title: "Error",
              description: error?.message || "Failed to verify reset link. Please try again.",
            })
            return // Exit early on error
          }
        }
        // If we have hash fragments with access_token and type=recovery, Supabase should auto-process them
        // But we need to wait a moment for Supabase to process the hash
        else if (hash && accessToken && hashType === 'recovery') {
          console.log("Found recovery token in hash, waiting for Supabase to process...")
          
          // Give Supabase a moment to process the hash fragments
          await new Promise(resolve => setTimeout(resolve, 500))
          
          // Now check for session
          const { data: { session }, error: sessionError } = await supabase.auth.getSession()
          
          console.log("Session after hash processing:", !!session, "Error:", sessionError)
          
          if (sessionError) {
            console.error("Session error:", sessionError)
            setIsValidToken(false)
            toast({
              variant: "destructive",
              title: "Invalid or expired link",
              description: "This password reset link is invalid or has expired. Please request a new one.",
            })
          } else if (session) {
            console.log("Valid session found from hash")
            setIsValidToken(true)
            // Clear the hash from URL for security
            window.history.replaceState(null, '', window.location.pathname)
          } else {
            // Try to manually set the session using the tokens from hash
            if (accessToken && refreshToken) {
              console.log("Attempting to set session manually...")
              const { data: { session: newSession }, error: setError } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken,
              })
              
              if (newSession && !setError) {
                console.log("Session set successfully")
                setIsValidToken(true)
                window.history.replaceState(null, '', window.location.pathname)
              } else {
                console.error("Failed to set session:", setError)
                setIsValidToken(false)
                toast({
                  variant: "destructive",
                  title: "Invalid or expired link",
                  description: "This password reset link is invalid or has expired. Please request a new one.",
                })
              }
            } else {
              // Try to get the user to verify the token is valid
              const { data: { user }, error: userError } = await supabase.auth.getUser()
              if (user && !userError) {
                setIsValidToken(true)
              } else {
                setIsValidToken(false)
                toast({
                  variant: "destructive",
                  title: "Invalid or expired link",
                  description: "This password reset link is invalid or has expired. Please request a new one.",
                })
              }
            }
          }
        } else if (queryToken && queryType === 'recovery') {
          // Handle query param tokens (less common)
          console.log("Found recovery token in query params")
          setIsValidToken(true)
        } else {
          // No token found - check if user is already authenticated
          console.log("No token found, checking existing session...")
          const { data: { session }, error: sessionError } = await supabase.auth.getSession()
          const { data: { user }, error: userError } = await supabase.auth.getUser()
          
          if (session && user && !sessionError && !userError) {
            // User is already authenticated, allow password change
            console.log("User already authenticated, allowing password change")
            setIsValidToken(true)
          } else {
            setIsValidToken(false)
            toast({
              variant: "destructive",
              title: "Invalid access",
              description: "Please use the link from your password reset email.",
            })
          }
        }
      } catch (error) {
        console.error("Error verifying token:", error)
        setIsValidToken(false)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to verify reset link. Please try again.",
        })
      } finally {
        setIsVerifying(false)
      }
    }

    verifyToken()
  }, [toast])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)

    try {
      const supabase = createClient()
      
      // Verify we still have a valid session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError || !session) {
        throw new Error("Your session has expired. Please request a new password reset link.")
      }

      // Update the password
      const { error } = await supabase.auth.updateUser({
        password: values.password,
      })

      if (error) {
        console.error("Password update error:", error)
        throw error
      }

      toast({
        title: "Password updated successfully",
        description: "Your password has been changed. You can now log in with your new password.",
        duration: 5000,
      })

      // Sign out to clear the recovery session
      await supabase.auth.signOut()

      // Redirect to login page after a short delay
      setTimeout(() => {
        router.push("/login")
      }, 1500)
    } catch (error: any) {
      console.error("Password reset error:", error)
      
      let errorMessage = "Failed to update password. Please try again."
      
      if (error?.message) {
        if (error.message.includes("expired") || error.message.includes("invalid")) {
          errorMessage = "This reset link has expired. Please request a new password reset link."
        } else if (error.message.includes("session")) {
          errorMessage = "Your session has expired. Please request a new password reset link."
        } else {
          errorMessage = error.message
        }
      }
      
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
        duration: 6000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isVerifying) {
    return (
      <div className="min-h-screen flex flex-col md:flex-row bg-m8bs-bg">
        <div className="flex-1 bg-m8bs-bg p-8 flex flex-col justify-center">
          <div className="max-w-md mx-auto w-full text-center">
            <Loader2 className="h-8 w-8 animate-spin text-m8bs-blue mx-auto mb-4" />
            <p className="text-m8bs-muted">Verifying reset link...</p>
          </div>
        </div>
        <div className="hidden md:flex flex-1 bg-m8bs-bg p-8 flex-col">
          <div className="flex flex-col items-center pt-60 space-y-6">
            <Image src="/logo.png" alt="M8 Business Suite Logo" width={400} height={100} />
          </div>
        </div>
      </div>
    )
  }

  if (!isValidToken) {
    return (
      <div className="min-h-screen flex flex-col md:flex-row bg-m8bs-bg">
        <div className="flex-1 bg-m8bs-bg p-8 flex flex-col justify-center">
          <div className="max-w-md mx-auto w-full">
            <Link 
              href="/forgot-password" 
              className="inline-flex items-center gap-2 text-m8bs-muted hover:text-m8bs-blue mb-6 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm">Back to forgot password</span>
            </Link>
            
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
                <Lock className="h-8 w-8 text-red-400" />
              </div>
              <h1 className="text-3xl font-bold text-white">
                Invalid Reset Link
              </h1>
              <p className="text-m8bs-muted">
                This password reset link is invalid or has expired. Please request a new one.
              </p>
              <Button
                onClick={() => router.push("/forgot-password")}
                className="bg-m8bs-blue hover:bg-m8bs-blue-dark text-white"
              >
                Request New Reset Link
              </Button>
            </div>
          </div>
        </div>
        <div className="hidden md:flex flex-1 bg-m8bs-bg p-8 flex-col">
          <div className="flex flex-col items-center pt-60 space-y-6">
            <Image src="/logo.png" alt="M8 Business Suite Logo" width={400} height={100} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-m8bs-bg">
      <div className="flex-1 bg-m8bs-bg p-8 flex flex-col justify-center">
        <div className="max-w-md mx-auto w-full">
          <Link 
            href="/login" 
            className="inline-flex items-center gap-2 text-m8bs-muted hover:text-m8bs-blue mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">Back to login</span>
          </Link>
          
          <h1 className="text-3xl font-bold text-white mb-2">
            Reset Your Password
          </h1>
          <p className="text-m8bs-muted mb-8">
            Enter your new password below. Make sure it's at least 6 characters long.
          </p>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white font-medium">New Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-5 w-5 text-m8bs-muted" />
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter new password"
                          className="pl-10 pr-10 bg-m8bs-card border-m8bs-border text-white placeholder:text-m8bs-muted focus:border-m8bs-blue focus:ring-m8bs-blue/20 transition-colors"
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-1 top-1 h-8 w-8 text-m8bs-muted hover:text-white"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          <span className="sr-only">{showPassword ? "Hide Password" : "Show Password"}</span>
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white font-medium">Confirm Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-5 w-5 text-m8bs-muted" />
                        <Input
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm new password"
                          className="pl-10 pr-10 bg-m8bs-card border-m8bs-border text-white placeholder:text-m8bs-muted focus:border-m8bs-blue focus:ring-m8bs-blue/20 transition-colors"
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-1 top-1 h-8 w-8 text-m8bs-muted hover:text-white"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          <span className="sr-only">{showConfirmPassword ? "Hide Password" : "Show Password"}</span>
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button
                type="submit"
                className="w-full bg-m8bs-blue hover:bg-m8bs-blue-dark text-white transition-colors"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating Password...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Update Password
                  </>
                )}
              </Button>
            </form>
          </Form>

          <div className="mt-8 text-center">
            <p className="text-m8bs-muted text-sm">
              Remember your password?{" "}
              <Link 
                href="/login" 
                className="text-m8bs-blue hover:text-m8bs-blue-dark font-medium underline underline-offset-2 transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>

      <div className="hidden md:flex flex-1 bg-m8bs-bg p-8 flex-col">
        <div className="flex flex-col items-center pt-60 space-y-6">
          <Image src="/logo.png" alt="M8 Business Suite Logo" width={400} height={100} />
          
          {/* Simple decorative elements */}
          <div className="flex flex-col items-center space-y-3 text-center">
            <div className="w-16 h-1 bg-m8bs-blue rounded-full"></div>
            <p className="text-m8bs-muted text-lg max-w-sm">
              A Platform For Performance Tracking & Marketing Analytics
            </p>
            <div className="flex space-x-4">
              <div className="w-2 h-2 bg-m8bs-muted rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-m8bs-muted rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
              <div className="w-2 h-2 bg-m8bs-muted rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 