"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Users, 
  Shield, 
  LogOut
} from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { cn } from "@/lib/utils"

export function AdminNav() {
  const { signOut } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("users")


  const handleSignOut = async () => {
    await signOut()
    router.push("/admin/login")
  }

  const navItems = [
    {
      id: "users",
      label: "Users",
      icon: Users,
      description: "Manage user accounts"
    }
  ]

  return (
    <div className="bg-gradient-to-r from-m8bs-card to-m8bs-card-alt border-b border-m8bs-border shadow-lg backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-3">
              <Shield className="h-8 w-8 text-m8bs-blue" />
              <div>
                <h1 className="text-xl font-extrabold text-white">Admin Panel</h1>
                <p className="text-sm text-m8bs-muted">System administration</p>
              </div>
            </div>
            
            <nav className="flex space-x-2">
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <Button
                    key={item.id}
                    variant={activeTab === item.id ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setActiveTab(item.id)}
                    className={cn(
                      "flex items-center space-x-2 rounded-lg transition-all duration-200",
                      activeTab === item.id
                        ? "bg-gradient-to-r from-m8bs-blue to-m8bs-blue-dark text-white shadow-lg shadow-m8bs-blue/30"
                        : "text-m8bs-muted hover:text-white hover:bg-m8bs-card-alt"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-semibold">{item.label}</span>
                  </Button>
                )
              })}
            </nav>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              onClick={handleSignOut}
              className="rounded-lg border-m8bs-border text-m8bs-muted hover:text-white hover:bg-red-500/20 hover:border-red-500/50 transition-all duration-200"
            >
              <LogOut className="h-5 w-5 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
} 