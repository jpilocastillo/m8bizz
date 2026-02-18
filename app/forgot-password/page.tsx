"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Mail, ArrowLeft, CheckCircle2, Key } from "lucide-react"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { createClient } from "@/lib/supabase/client"
import { resetPasswordByEmail } from "@/app/admin/actions"

const emailFormSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
})

const directResetFormSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

export default function ForgotPassword() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [resetMode, setResetMode] = useState<"email" | "direct">("email")
  const router = useRouter()
  const { toast } = useToast()

  const emailForm = useForm<z.infer<typeof emailFormSchema>>({
    resolver: zodResolver(emailFormSchema),
    defaultValues: {
      email: "",
    },
  })

  const directResetForm = useForm<z.infer<typeof directResetFormSchema>>({
    resolver: zodResolver(directResetFormSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  })

  async function onEmailSubmit(values: z.infer<typeof emailFormSchema>) {
    setIsLoading(true)

    try {
      const supabase = createClient()
      
      // Validate Supabase client is properly configured
      if (!supabase || !supabase.auth) {
        throw new Error("Authentication service is not available. Please contact support.")
      }
      
      // Use production site URL if available, otherwise fall back to current origin
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin
      // IMPORTANT: The redirect URL must match exactly what's configured in Supabase dashboard
      // Make sure this URL is added to "Redirect URLs" in Supabase > Authentication > URL Configuration
      const redirectUrl = `${siteUrl}/reset-password`
      
      // Log only in development for debugging
      if (process.env.NODE_ENV === 'development') {
        console.log("Requesting password reset for:", values.email)
        console.log("Redirect URL:", redirectUrl)
      }
      
      const { data, error } = await supabase.auth.resetPasswordForEmail(values.email, {
        redirectTo: redirectUrl,
      })

      if (error) {
        // Log error details in development
        if (process.env.NODE_ENV === 'development') {
          console.error("Password reset error:", {
            message: error.message,
            status: error.status,
            name: error.name,
          })
        }
        throw error
      }

      // Always show success message (Supabase doesn't reveal if email exists for security)
      // Note: Supabase will return success even if email doesn't exist (security feature)
      setIsSuccess(true)
      
      toast({
        title: "Reset link sent",
        description: "If an account exists with this email, you will receive a password reset link. Please check your inbox and spam folder.",
        duration: 5000,
      })

      // Clear form after successful submission
      emailForm.reset()
    } catch (error: any) {
      // Log error in development
      if (process.env.NODE_ENV === 'development') {
        console.error("Password reset error:", error)
      }
      
      // Provide more specific error messages
      let errorMessage = "Failed to send reset link. Please try again."
      let showConfigNote = false
      
      if (error?.message) {
        const errorMsg = error.message.toLowerCase()
        
        if (errorMsg.includes("rate limit") || errorMsg.includes("too many") || errorMsg.includes("429")) {
          errorMessage = "Too many requests. Please wait a few minutes and try again."
        } else if (errorMsg.includes("email") && !errorMsg.includes("configuration")) {
          errorMessage = "Invalid email address. Please check and try again."
        } else if (errorMsg.includes("configuration") || errorMsg.includes("template") || errorMsg.includes("smtp")) {
          errorMessage = "Email service not configured. Please contact your administrator."
          showConfigNote = true
        } else if (errorMsg.includes("network") || errorMsg.includes("fetch")) {
          errorMessage = "Network error. Please check your connection and try again."
        } else if (errorMsg.includes("timeout")) {
          errorMessage = "Request timed out. Please try again."
        } else {
          // Use the error message but sanitize it for users
          errorMessage = error.message.length > 100 
            ? "An unexpected error occurred. Please try again later."
            : error.message
        }
        
        // Show config note for server errors that might indicate email configuration issues
        if ((error.status === 400 || error.status === 500) && showConfigNote === false) {
          const errorMsg = error.message.toLowerCase()
          if (errorMsg.includes("email") || errorMsg.includes("send") || errorMsg.includes("mail")) {
            showConfigNote = true
          }
        }
      }
      
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
        duration: 6000,
      })
      
      // Show additional help in development
      if (showConfigNote && process.env.NODE_ENV === 'development') {
        console.warn("Email configuration issue detected. See EMAIL_SETUP_GUIDE.md for setup instructions.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  async function onDirectResetSubmit(values: z.infer<typeof directResetFormSchema>) {
    setIsLoading(true)

    try {
      const result = await resetPasswordByEmail(values.email, values.password)

      if (!result.success) {
        throw new Error(result.error || "Failed to reset password")
      }

      setIsSuccess(true)
      
      toast({
        title: "Password reset successfully",
        description: "Your password has been updated. You can now log in with your new password.",
        duration: 5000,
      })

      // Clear form after successful submission
      directResetForm.reset()
    } catch (error: any) {
      // Log error in development
      if (process.env.NODE_ENV === 'development') {
        console.error("Direct password reset error:", error)
      }
      
      let errorMessage = "Failed to reset password. Please try again."
      
      if (error?.message) {
        const errorMsg = error.message.toLowerCase()
        
        if (errorMsg.includes("not found") || errorMsg.includes("doesn't exist")) {
          // Don't reveal if email exists for security
          errorMessage = "If an account exists with this email, the password has been reset."
        } else if (errorMsg.includes("network") || errorMsg.includes("fetch")) {
          errorMessage = "Network error. Please check your connection and try again."
        } else if (errorMsg.includes("timeout")) {
          errorMessage = "Request timed out. Please try again."
        } else {
          errorMessage = error.message.length > 100 
            ? "An unexpected error occurred. Please try again later."
            : error.message
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
            Forgot Password?
          </h1>
          <p className="text-m8bs-muted mb-6">
            Choose how you'd like to reset your password.
          </p>

          {/* Mode Toggle */}
          <div className="mb-6 flex gap-2 p-1 bg-m8bs-card rounded-lg border border-m8bs-border">
            <button
              type="button"
              onClick={() => {
                setResetMode("email")
                setIsSuccess(false)
                emailForm.reset()
                directResetForm.reset()
              }}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                resetMode === "email"
                  ? "bg-m8bs-blue text-white"
                  : "text-m8bs-muted hover:text-white"
              }`}
            >
              <Mail className="inline-block mr-2 h-4 w-4" />
              Send Email
            </button>
            <button
              type="button"
              onClick={() => {
                setResetMode("direct")
                setIsSuccess(false)
                emailForm.reset()
                directResetForm.reset()
              }}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                resetMode === "direct"
                  ? "bg-m8bs-blue text-white"
                  : "text-m8bs-muted hover:text-white"
              }`}
            >
              <Key className="inline-block mr-2 h-4 w-4" />
              Reset Directly
            </button>
          </div>
          
          {isSuccess ? (
            <div className="space-y-6">
              <div className="p-6 bg-m8bs-card-alt/50 border border-m8bs-blue/50 rounded-lg text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-m8bs-blue/20 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="h-8 w-8 text-m8bs-blue" />
                  </div>
                </div>
                <h2 className="text-xl font-semibold text-white mb-2">
                  {resetMode === "email" ? "Check Your Email" : "Password Reset Successful"}
                </h2>
                <p className="text-m8bs-muted text-sm mb-4">
                  {resetMode === "email" 
                    ? "If an account exists with this email, you will receive a password reset link."
                    : "Your password has been updated successfully. You can now log in with your new password."}
                </p>
                {resetMode === "email" && (
                  <p className="text-m8bs-muted text-xs">
                    Please check your inbox and spam folder. The link will expire in 1 hour.
                  </p>
                )}
              </div>
              
              <div className="space-y-3">
                <Button
                  onClick={() => {
                    setIsSuccess(false)
                    emailForm.reset()
                    directResetForm.reset()
                  }}
                  className="w-full bg-m8bs-card hover:bg-m8bs-card-alt border border-m8bs-border text-white transition-colors"
                >
                  {resetMode === "email" ? "Send Another Email" : "Reset Another Password"}
                </Button>
                <Button
                  onClick={() => router.push("/login")}
                  variant="outline"
                  className="w-full border-m8bs-border text-m8bs-muted hover:text-white hover:bg-m8bs-card-alt transition-colors"
                >
                  Back to Login
                </Button>
              </div>
            </div>
          ) : resetMode === "email" ? (
            <>
              <div className="mb-6 p-4 bg-m8bs-card-alt/50 border border-m8bs-border rounded-lg">
                <p className="text-xs text-m8bs-muted">
                  <strong className="text-white">Note:</strong> If you don't receive an email, please check your spam folder. 
                  Also ensure that email notifications are enabled in your Supabase project settings.
                </p>
              </div>

              <Form {...emailForm}>
                <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-6">
                  <FormField
                    control={emailForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white font-medium">Email Address</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-3 h-5 w-5 text-m8bs-muted" />
                            <Input
                              type="email"
                              placeholder="email@example.com"
                              className="pl-10 bg-m8bs-card border-m8bs-border text-white placeholder:text-m8bs-muted focus:border-m8bs-blue focus:ring-m8bs-blue/20 transition-colors"
                              disabled={isLoading}
                              {...field}
                            />
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
                        Sending Reset Link...
                      </>
                    ) : (
                      <>
                        <Mail className="mr-2 h-4 w-4" />
                        Send Reset Link
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </>
          ) : (
            <>
              <div className="mb-6 p-4 bg-m8bs-card-alt/50 border border-m8bs-border rounded-lg">
                <p className="text-xs text-m8bs-muted">
                  <strong className="text-white">Direct Reset:</strong> Enter your email and new password to reset immediately without sending an email.
                </p>
              </div>

              <Form {...directResetForm}>
                <form onSubmit={directResetForm.handleSubmit(onDirectResetSubmit)} className="space-y-6">
                  <FormField
                    control={directResetForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white font-medium">Email Address</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-3 h-5 w-5 text-m8bs-muted" />
                            <Input
                              type="email"
                              placeholder="email@example.com"
                              className="pl-10 bg-m8bs-card border-m8bs-border text-white placeholder:text-m8bs-muted focus:border-m8bs-blue focus:ring-m8bs-blue/20 transition-colors"
                              disabled={isLoading}
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={directResetForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white font-medium">New Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Key className="absolute left-3 top-3 h-5 w-5 text-m8bs-muted" />
                            <Input
                              type="password"
                              placeholder="Enter new password (min 6 characters)"
                              className="pl-10 bg-m8bs-card border-m8bs-border text-white placeholder:text-m8bs-muted focus:border-m8bs-blue focus:ring-m8bs-blue/20 transition-colors"
                              disabled={isLoading}
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={directResetForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white font-medium">Confirm Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Key className="absolute left-3 top-3 h-5 w-5 text-m8bs-muted" />
                            <Input
                              type="password"
                              placeholder="Confirm new password"
                              className="pl-10 bg-m8bs-card border-m8bs-border text-white placeholder:text-m8bs-muted focus:border-m8bs-blue focus:ring-m8bs-blue/20 transition-colors"
                              disabled={isLoading}
                              {...field}
                            />
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
                        Resetting Password...
                      </>
                    ) : (
                      <>
                        <Key className="mr-2 h-4 w-4" />
                        Reset Password
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </>
          )}

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