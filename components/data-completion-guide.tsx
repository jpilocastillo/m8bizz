"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  CheckCircle, 
  AlertCircle, 
  ArrowRight, 
  Building2, 
  Target, 
  DollarSign, 
  Users, 
  TrendingUp,
  Calendar,
  BarChart3,
  FileText,
  Settings
} from "lucide-react"
import Link from "next/link"

interface DataCompletionGuideProps {
  data: any
  onNavigate?: (section: string) => void
}

export function DataCompletionGuide({ data, onNavigate }: DataCompletionGuideProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>([])

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    )
  }

  // Calculate completion status for each section
  const getCompletionStatus = () => {
    const sections = [
      {
        id: "business-goals",
        title: "Business Goals",
        description: "Set your annual revenue and client acquisition targets",
        icon: Target,
        completed: !!(data.businessGoals?.annualRevenue && data.businessGoals?.clientAcquisition),
        missing: [],
        link: "/business-dashboard",
        color: "blue"
      },
      {
        id: "current-values",
        title: "Current Values",
        description: "Enter your current business metrics and performance",
        icon: TrendingUp,
        completed: !!(data.currentValues?.currentRevenue && data.currentValues?.currentClients),
        missing: [],
        link: "/business-dashboard",
        color: "green"
      },
      {
        id: "client-metrics",
        title: "Client Metrics",
        description: "Define your client acquisition and retention metrics",
        icon: Users,
        completed: !!(data.clientMetrics?.averageClientValue && data.clientMetrics?.retentionRate),
        missing: [],
        link: "/business-dashboard",
        color: "purple"
      },
      {
        id: "campaigns",
        title: "Marketing Campaigns",
        description: "Create and manage your marketing events",
        icon: Calendar,
        completed: !!(data.campaigns && data.campaigns.length > 0),
        missing: [],
        link: "/events",
        color: "orange"
      },
      {
        id: "commission-rates",
        title: "Commission Rates",
        description: "Set up your commission and fee structures",
        icon: DollarSign,
        completed: !!(data.commissionRates?.annuityCommission && data.commissionRates?.lifeInsuranceCommission),
        missing: [],
        link: "/business-dashboard",
        color: "emerald"
      },
      {
        id: "financial-book",
        title: "Financial Book",
        description: "Track your financial planning and advisory services",
        icon: FileText,
        completed: !!(data.financialBook?.financialPlans && data.financialBook?.advisoryServices),
        missing: [],
        link: "/business-dashboard",
        color: "cyan"
      }
    ]

    // Calculate missing fields for each section
    sections.forEach(section => {
      if (!section.completed) {
        switch (section.id) {
          case "business-goals":
            if (!data.businessGoals?.annualRevenue) section.missing.push("Annual Revenue Target")
            if (!data.businessGoals?.clientAcquisition) section.missing.push("Client Acquisition Goal")
            break
          case "current-values":
            if (!data.currentValues?.currentRevenue) section.missing.push("Current Revenue")
            if (!data.currentValues?.currentClients) section.missing.push("Current Client Count")
            break
          case "client-metrics":
            if (!data.clientMetrics?.averageClientValue) section.missing.push("Average Client Value")
            if (!data.clientMetrics?.retentionRate) section.missing.push("Client Retention Rate")
            break
          case "campaigns":
            section.missing.push("Create at least one marketing event")
            break
          case "commission-rates":
            if (!data.commissionRates?.annuityCommission) section.missing.push("Annuity Commission Rate")
            if (!data.commissionRates?.lifeInsuranceCommission) section.missing.push("Life Insurance Commission Rate")
            break
          case "financial-book":
            if (!data.financialBook?.financialPlans) section.missing.push("Financial Plans Sold")
            if (!data.financialBook?.advisoryServices) section.missing.push("Advisory Services Revenue")
            break
        }
      }
    })

    return sections
  }

  const sections = getCompletionStatus()
  const completedCount = sections.filter(s => s.completed).length
  const totalCount = sections.length
  const completionPercentage = Math.round((completedCount / totalCount) * 100)

  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: "bg-blue-500/20 text-blue-400 border-blue-500/50",
      green: "bg-green-500/20 text-green-400 border-green-500/50",
      purple: "bg-purple-500/20 text-purple-400 border-purple-500/50",
      orange: "bg-orange-500/20 text-orange-400 border-orange-500/50",
      emerald: "bg-emerald-500/20 text-emerald-400 border-emerald-500/50",
      cyan: "bg-cyan-500/20 text-cyan-400 border-cyan-500/50"
    }
    return colorMap[color as keyof typeof colorMap] || colorMap.blue
  }

  return (
    <Card className="bg-gradient-to-br from-m8bs-card to-m8bs-card-alt border-m8bs-border shadow-lg">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl text-white flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-m8bs-blue" />
              Data Completion Guide
            </CardTitle>
            <CardDescription className="text-m8bs-muted">
              Complete your profile to unlock all dashboard features
            </CardDescription>
          </div>
          <Badge 
            variant="secondary" 
            className={`${completionPercentage === 100 ? 'bg-green-500/20 text-green-400 border-green-500/50' : 'bg-m8bs-blue/20 text-m8bs-blue border-m8bs-blue/50'}`}
          >
            {completionPercentage}% Complete
          </Badge>
        </div>
        <Progress value={completionPercentage} className="h-2 bg-m8bs-border" />
      </CardHeader>
      
      <CardContent className="space-y-4">
        {sections.map((section) => {
          const Icon = section.icon
          const isExpanded = expandedSections.includes(section.id)
          
          return (
            <div key={section.id} className="border border-m8bs-border rounded-lg overflow-hidden">
              <div 
                className="p-4 cursor-pointer hover:bg-m8bs-card-alt/50 transition-colors"
                onClick={() => toggleSection(section.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${getColorClasses(section.color)}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="font-medium text-white flex items-center gap-2">
                        {section.title}
                        {section.completed ? (
                          <CheckCircle className="h-4 w-4 text-green-400" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-orange-400" />
                        )}
                      </h3>
                      <p className="text-sm text-m8bs-muted">{section.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!section.completed && (
                      <Badge variant="outline" className="text-orange-400 border-orange-500/50">
                        {section.missing.length} missing
                      </Badge>
                    )}
                    <ArrowRight className={`h-4 w-4 text-m8bs-muted transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                  </div>
                </div>
              </div>
              
              {isExpanded && (
                <div className="border-t border-m8bs-border p-4 bg-m8bs-card-alt/30">
                  {section.completed ? (
                    <div className="flex items-center gap-2 text-green-400">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">This section is complete!</span>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="text-sm text-m8bs-muted">
                        Complete the following to finish this section:
                      </div>
                      <ul className="space-y-2">
                        {section.missing.map((item, index) => (
                          <li key={index} className="flex items-center gap-2 text-sm text-white">
                            <div className="w-1.5 h-1.5 bg-orange-400 rounded-full" />
                            {item}
                          </li>
                        ))}
                      </ul>
                      <Link href={section.link}>
                        <Button 
                          size="sm" 
                          className="bg-m8bs-blue hover:bg-m8bs-blue-dark text-white"
                          onClick={() => onNavigate?.(section.id)}
                        >
                          Go to {section.title}
                          <ArrowRight className="h-3 w-3 ml-1" />
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
        
        {completionPercentage === 100 && (
          <div className="mt-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
            <div className="flex items-center gap-2 text-green-400 mb-2">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">Congratulations!</span>
            </div>
            <p className="text-sm text-green-300">
              Your profile is complete! You now have access to all dashboard features and analytics.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
