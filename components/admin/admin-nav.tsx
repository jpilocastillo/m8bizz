"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Users, 
  Shield, 
  LogOut,
  BarChart3,
  Settings
} from "lucide-react"
import { useAuth } from "@/components/auth-provider"

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
    },
    {
      id: "analytics",
      label: "Analytics",
      icon: BarChart3,
      description: "System-wide analytics"
    },
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
      description: "System configuration"
    }
  ]

  return (
    <div className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-3">
              <Shield className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
                <p className="text-sm text-gray-500">System administration</p>
              </div>
            </div>
            
            <nav className="flex space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <Button
                    key={item.id}
                    variant={activeTab === item.id ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setActiveTab(item.id)}
                    className="flex items-center space-x-2"
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Button>
                )
              })}
            </nav>
          </div>
          
          <Button variant="outline" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  )
} 