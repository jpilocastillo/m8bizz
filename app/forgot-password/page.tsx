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
import { Loader2, Mail, ArrowLeft } from "lucide-react"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { createClient } from "@/lib/supabase/client"

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
})

export default function ForgotPassword() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)

    try {
      const supabase = createClient()
      
      // Use production site URL if available, otherwise fall back to current origin
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin
      const redirectUrl = `${siteUrl}/reset-password`
      
      // Log the request for debugging
      console.log("Requesting password reset for:", values.email)
      console.log("Redirect URL:", redirectUrl)
      console.log("Site URL from env:", process.env.NEXT_PUBLIC_SITE_URL)
      console.log("Current origin:", window.location.origin)
      
      const { data, error } = await supabase.auth.resetPasswordForEmail(values.email, {
        redirectTo: redirectUrl,
      })

      if (error) {
        console.error("Password reset error details:", {
          message: error.message,
          status: error.status,
          name: error.name,
        })
        throw error
      }

      console.log("Password reset response:", data)

      // Always show success message (Supabase doesn't reveal if email exists for security)
      // Note: Supabase will return success even if email doesn't exist (security feature)
      toast({
        title: "Reset link sent",
        description: "If an account exists with this email, you will receive a password reset link. Please check your inbox and spam folder.",
        duration: 5000,
      })

      // Clear form after successful submission
      form.reset()
    } catch (error: any) {
      console.error("Password reset error:", error)
      
      // Provide more specific error messages
      let errorMessage = "Failed to send reset link. Please try again."
      let showConfigNote = false
      
      if (error?.message) {
        console.error("Full error object:", error)
        
        if (error.message.includes("rate limit") || error.message.includes("too many")) {
          errorMessage = "Too many requests. Please wait a few minutes and try again."
        } else if (error.message.includes("email")) {
          errorMessage = "Invalid email address. Please check and try again."
        } else if (error.message.includes("configuration") || error.message.includes("template")) {
          errorMessage = "Email service not configured. Please contact your administrator."
          showConfigNote = true
        } else {
          errorMessage = error.message
          // Show config note for any email-related errors
          if (error.status === 400 || error.status === 500) {
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
          <p className="text-m8bs-muted mb-8">
            Enter your email address and we'll send you a link to reset your password.
          </p>
          
          <div className="mb-6 p-4 bg-m8bs-card-alt/50 border border-m8bs-border rounded-lg">
            <p className="text-xs text-m8bs-muted">
              <strong className="text-white">Note:</strong> If you don't receive an email, please check your spam folder. 
              Also ensure that email notifications are enabled in your Supabase project settings.
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white font-medium">Email Address</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-5 w-5 text-m8bs-muted" />
                        <Input
                          placeholder="email@example.com"
                          className="pl-10 bg-m8bs-card border-m8bs-border text-white placeholder:text-m8bs-muted focus:border-m8bs-blue focus:ring-m8bs-blue/20 transition-colors"
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
                  "Send Reset Link"
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