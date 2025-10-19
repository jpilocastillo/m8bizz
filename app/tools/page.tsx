"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Calculator, 
  Target, 
  TrendingUp, 
  Users, 
  FileText, 
  Briefcase,
  ArrowRight,
  Wrench
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
    title: "Eight Elements Reporting Tool",
    description: "Generate comprehensive reports using the eight elements framework.",
    href: "/tools/eight-elements",
    icon: TrendingUp,
    color: "from-purple-500 to-purple-600"
  },
  {
    title: "Missing Money Report",
    description: "Identify and recover unclaimed assets for your clients.",
    href: "/tools/missing-money",
    icon: Users,
    color: "from-orange-500 to-orange-600"
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
          <Card key={tool.href} className="group hover:shadow-lg transition-all duration-300 border-m8bs-border bg-m8bs-card hover:bg-m8bs-card-alt">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3 mb-2">
                <div className={`p-2 rounded-lg bg-gradient-to-r ${tool.color} text-white`}>
                  <tool.icon className="h-5 w-5" />
                </div>
                <CardTitle className="text-lg text-white group-hover:text-m8bs-blue transition-colors">
                  {tool.title}
                </CardTitle>
              </div>
              <CardDescription className="text-muted-foreground">
                {tool.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <Link href={tool.href}>
                <Button 
                  variant="outline" 
                  className="w-full group-hover:bg-m8bs-blue group-hover:text-white group-hover:border-m8bs-blue transition-all duration-200"
                >
                  Open Tool
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-12 p-6 rounded-lg bg-gradient-to-r from-m8bs-card to-m8bs-card-alt border border-m8bs-border">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-white">Need Help Getting Started?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
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
      </div>
    </div>
  )
}
