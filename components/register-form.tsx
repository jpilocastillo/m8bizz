"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff, Mail, Lock, User, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { registerUser } from "@/lib/auth"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"

const formSchema = z
  .object({
    name: z.string().min(2, { message: "Name must be at least 2 characters" }),
    email: z.string().email({ message: "Please enter a valid email address" }),
    password: z.string().min(6, { message: "Password must be at least 6 characters" }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

export function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const result = await registerUser(values.name, values.email, values.password)

      if (result.success) {
        setSuccess("Registration successful! You can now sign in with your credentials.")
        setTimeout(() => {
          router.push("/login")
        }, 3000)
      } else {
        setError(result.error || "Failed to register. Please try again.")
      }
    } catch (err) {
      console.error("Registration error:", err)
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <div className="flex-1 bg-gradient-to-b from-[#0a0b14] to-[#131525] p-8 flex flex-col justify-center">
        <div className="max-w-md mx-auto w-full">
          <div className="flex items-center gap-2 mb-8">
            <div className="bg-blue-600 text-white rounded-full p-2 w-10 h-10 flex items-center justify-center font-bold shadow-lg">
              <Clock className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold text-white">M8 Business Suite</h2>
          </div>

          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 mb-2">
            Create an account
          </h1>
          <p className="text-gray-400 mb-8">Sign up to start tracking your marketing performance</p>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300 font-medium">Full Name</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-5 w-5 text-blue-500" />
                        <Input
                          placeholder="John Doe"
                          className="pl-10 bg-[#1f2037] border-[#1f2037] text-white focus:border-blue-500 focus:ring-blue-500/20 transition-colors"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300 font-medium">Email Address</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-5 w-5 text-blue-500" />
                        <Input
                          placeholder="email@example.com"
                          className="pl-10 bg-[#1f2037] border-[#1f2037] text-white focus:border-blue-500 focus:ring-blue-500/20 transition-colors"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300 font-medium">Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-5 w-5 text-blue-500" />
                        <Input
                          type={showPassword ? "text" : "password"}
                          className="pl-10 bg-[#1f2037] border-[#1f2037] text-white focus:border-blue-500 focus:ring-blue-500/20 transition-colors"
                          required
                          minLength={8}
                          {...field}
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
                    <FormLabel className="text-gray-300 font-medium">Confirm Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-5 w-5 text-blue-500" />
                        <Input
                          type={showPassword ? "text" : "password"}
                          className="pl-10 bg-[#1f2037] border-[#1f2037] text-white focus:border-blue-500 focus:ring-blue-500/20 transition-colors"
                          required
                          minLength={8}
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
                className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 transition-colors"
                disabled={isLoading}
              >
                {isLoading ? "Creating account..." : "Create account"}
              </Button>
              {error && <p className="text-red-500">{error}</p>}
              {success && <p className="text-green-500">{success}</p>}
            </form>
          </Form>

          <div className="mt-8 text-center">
            <p className="text-gray-400 text-sm">
              Already have an account?{" "}
              <Link href="/login" className="text-blue-400 hover:text-blue-300 transition-colors font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>

      <div className="hidden md:flex flex-1 bg-gradient-to-b from-[#0f1029] to-[#0a0b14] p-8 flex-col justify-center">
        <div className="max-w-lg mx-auto">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 mb-4">
            Join M8 Business Suite
          </h1>
          <p className="text-white/80 mb-8">
            Create an account to start tracking and optimizing your business performance.
          </p>

          <div className="bg-gradient-to-b from-[#131525]/70 to-[#0f1029]/70 rounded-xl p-6 shadow-lg border border-[#1f2037]">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-blue-600 text-white rounded-full p-2 w-10 h-10 flex items-center justify-center font-bold shadow-lg">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-white font-medium">M8 Business Suite</h3>
                <p className="text-white/60 text-sm">Real-time analytics at your fingertips</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="bg-[#1f2037]/50 p-4 rounded-lg border border-[#1f2037]/50">
                <div className="text-white/70 text-sm mb-1 font-medium">Features</div>
                <ul className="text-white text-sm space-y-3">
                  <li className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                    </div>
                    <span>Real-time campaign analytics</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                    </div>
                    <span>Performance metrics and ROI tracking</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                    </div>
                    <span>Customizable dashboards and reports</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-yellow-500/20 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-yellow-500"></div>
                    </div>
                    <span>Data-driven business insights</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
