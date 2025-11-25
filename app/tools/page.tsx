"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Calculator, 
  Target, 
  Users, 
  FileText, 
  Briefcase,
  ArrowRight,
  Wrench,
  DollarSign
} from "lucide-react"
import Link from "next/link"

const tools = [
  {
    title: "Bucket Plan Calculator",
    description: "Plan and optimize your client's retirement income strategy using the bucket approach.",
    href: "/tools/bucket-plan",
    icon: Calculator,
    color: "from-blue-500 to-blue-600"
  },
  {
    title: "Annuity Analysis Program",
    description: "Analyze and compare annuity products to find the best fit for your clients.",
    href: "/tools/annuity-analysis",
    icon: Target,
    color: "from-green-500 to-green-600"
  },
  {
    title: "Missing Money Report",
    description: "Identify and recover unclaimed assets for your clients.",
    href: "/tools/missing-money",
    icon: Users,
    color: "from-orange-500 to-orange-600"
  },
  {
    title: "Client Missing Money Report",
    description: "Professional cost analysis report showing opportunity costs over 1, 5, and 10 years.",
    href: "/tools/client-missing-money-report",
    icon: DollarSign,
    color: "from-emerald-500 to-emerald-600"
  },
  {
    title: "Annual Business Planner",
    description: "Plan and track your business goals and objectives for the year.",
    href: "/tools/annual-planner",
    icon: FileText,
    color: "from-indigo-500 to-indigo-600"
  },
  {
    title: "Business Behavior Scorecard",
    description: "Evaluate and improve your business practices and client relationships.",
    href: "/tools/behavior-scorecard",
    icon: Briefcase,
    color: "from-pink-500 to-pink-600"
  }
]

export default function ToolsPage() {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <Wrench className="h-8 w-8 text-m8bs-blue" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Financial Tools
          </h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Access powerful financial planning tools designed to help you serve your clients better and grow your practice.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools.map((tool) => (
          <Card key={tool.href} className="group hover:shadow-xl transition-all duration-300 bg-m8bs-card border-m8bs-card-alt shadow-lg">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-gradient-to-br from-m8bs-blue to-m8bs-blue-dark text-white">
                  <tool.icon className="h-5 w-5" />
                </div>
                <CardTitle className="text-lg text-white group-hover:text-m8bs-blue transition-colors">
                  {tool.title}
                </CardTitle>
              </div>
              <CardDescription className="text-m8bs-muted">
                {tool.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <Link href={tool.href}>
                <Button 
                  variant="outline" 
                  className="w-full bg-m8bs-card-alt border-m8bs-border text-white hover:bg-m8bs-blue hover:text-white hover:border-m8bs-blue transition-all duration-200"
                >
                  Open Tool
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-12 bg-m8bs-card border-m8bs-card-alt shadow-lg">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold text-white">Need Help Getting Started?</h2>
            <p className="text-m8bs-muted max-w-2xl mx-auto">
            Each tool is designed to be intuitive and user-friendly. If you need assistance with any specific tool, 
            refer to the help documentation or contact support.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/business-dashboard">
              <Button variant="outline" className="w-full sm:w-auto">
                Back to Dashboard
              </Button>
            </Link>
            <Link href="/settings">
              <Button variant="outline" className="w-full sm:w-auto">
                Settings
              </Button>
            </Link>
          </div>
        </div>
        </CardContent>
      </Card>
    </div>
  )
}
