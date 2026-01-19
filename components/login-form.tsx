"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Eye, EyeOff, Mail, Lock, PieChart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/components/ui/use-toast"
import { createClient } from "@/lib/supabase/client"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: error.message || "Invalid Email Or Password. Please Try Again.",
        })
      } else {
        toast({
          title: "Login Successful",
          description: "Welcome To Your Dashboard",
        })
        router.push("/")
        router.refresh()
      }
    } catch (error) {
      toast({
        variant: "destructive",
          title: "Login Error",
          description: "An Unexpected Error Occurred. Please Try Again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-m8bs-bg">
      <div className="flex-1 bg-m8bs-bg p-8 flex flex-col justify-center">
        <div className="max-w-md mx-auto w-full">
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome Back
          </h1>
          <p className="text-m8bs-muted mb-8">Enter Your Credentials To Access Your Account</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white font-medium">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-m8bs-muted" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-m8bs-card border-m8bs-border text-white placeholder:text-m8bs-muted focus:border-m8bs-blue focus:ring-m8bs-blue/20 transition-colors"
                  placeholder="email@example.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-white font-medium">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-m8bs-muted" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 bg-m8bs-card border-m8bs-border text-white placeholder:text-m8bs-muted focus:border-m8bs-blue focus:ring-m8bs-blue/20 transition-colors"
                  required
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
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  className="border-m8bs-blue data-[state=checked]:bg-m8bs-blue data-[state=checked]:border-m8bs-blue"
                />
                <label htmlFor="remember" className="text-sm text-white cursor-pointer">
                  Remember Me
                </label>
              </div>
              <Link 
                href="/forgot-password" 
                className="text-sm text-m8bs-blue hover:text-m8bs-blue-dark font-medium underline underline-offset-2 transition-colors hover:underline-offset-4"
              >
                Forgot Password?
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full bg-m8bs-blue hover:bg-m8bs-blue-dark text-white transition-colors"
              disabled={isLoading}
            >
              {isLoading ? "Signing In..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-8 text-center space-y-2">
            <p className="text-m8bs-muted text-sm">
              Contact Your Administrator To Get Access
            </p>
            <Link href="/landing" className="text-m8bs-blue hover:text-m8bs-blue-dark text-sm underline">
              Learn More About M8 Business Suite
            </Link>
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