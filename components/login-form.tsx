"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
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
          title: "Login failed",
          description: error.message || "Invalid email or password. Please try again.",
        })
      } else {
        toast({
          title: "Login successful",
          description: "Welcome to your dashboard",
        })
        router.push("/dashboard")
        router.refresh()
      }
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

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <div className="flex-1 bg-gradient-to-b from-[#0a0b14] to-[#131525] p-8 flex flex-col justify-center">
        <div className="max-w-md mx-auto w-full">
          <div className="flex items-center gap-2 mb-8">
            <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-full p-2 w-10 h-10 flex items-center justify-center shadow-lg">
              <PieChart className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold text-white">M8 Business Suite</h2>
          </div>

          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 mb-2">
            Welcome back
          </h1>
          <p className="text-gray-400 mb-8">Enter your credentials to access your account</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300 font-medium">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-blue-500" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-[#1f2037] border-[#1f2037] text-white focus:border-blue-500 focus:ring-blue-500/20 transition-colors"
                  placeholder="email@example.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-300 font-medium">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-blue-500" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 bg-[#1f2037] border-[#1f2037] text-white focus:border-blue-500 focus:ring-blue-500/20 transition-colors"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1 h-8 w-8 text-gray-400 hover:text-white"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  className="border-blue-500 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                />
                <label htmlFor="remember" className="text-sm text-gray-300 cursor-pointer">
                  Remember me
                </label>
              </div>
              <Link href="/forgot-password" className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
                Forgot your password?
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 transition-colors"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-400 text-sm">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-blue-400 hover:text-blue-300 transition-colors font-medium">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>

      <div className="hidden md:flex flex-1 bg-gradient-to-b from-[#0f1029] to-[#0a0b14] p-8 flex-col justify-center">
        <div className="max-w-lg mx-auto">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 mb-4">
            Optimize Your Marketing Performance
          </h1>
          <p className="text-white/80 mb-8">
            Track, analyze, and improve your marketing campaigns with our comprehensive dashboard.
          </p>

          <div className="bg-gradient-to-b from-[#131525]/70 to-[#0f1029]/70 rounded-xl p-6 shadow-lg border border-[#1f2037]">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-full p-2 w-10 h-10 flex items-center justify-center shadow-lg">
                <PieChart className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-white font-medium">M8 Business Suite</h3>
                <p className="text-white/60 text-sm">Real-time analytics at your fingertips</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#1f2037]/50 p-4 rounded-lg border border-[#1f2037]/50 hover:border-blue-500/30 transition-colors">
                <div className="text-blue-400 text-sm mb-1">ROI</div>
                <div className="text-white text-2xl font-bold">274%</div>
              </div>
              <div className="bg-[#1f2037]/50 p-4 rounded-lg border border-[#1f2037]/50 hover:border-green-500/30 transition-colors">
                <div className="text-green-400 text-sm mb-1">Conversion Rate</div>
                <div className="text-white text-2xl font-bold">7.1%</div>
              </div>
              <div className="bg-[#1f2037]/50 p-4 rounded-lg border border-[#1f2037]/50 hover:border-purple-500/30 transition-colors">
                <div className="text-purple-400 text-sm mb-1">Annuities Sold</div>
                <div className="text-white text-2xl font-bold">2</div>
              </div>
              <div className="bg-[#1f2037]/50 p-4 rounded-lg border border-[#1f2037]/50 hover:border-yellow-500/30 transition-colors">
                <div className="text-yellow-400 text-sm mb-1">Total Income</div>
                <div className="text-white text-2xl font-bold">$258,991</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
