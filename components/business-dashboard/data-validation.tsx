"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, AlertCircle, Edit } from "lucide-react"
import { AdvisorBasecampData } from "@/lib/advisor-basecamp"

interface DataValidationProps {
  data: AdvisorBasecampData
  onEditData: () => void
}

export function DataValidation({ data, onEditData }: DataValidationProps) {
  const validationChecks = [
    {
      name: "Business Goals",
      isValid: !!data.businessGoals,
      description: "Your annual business targets and goal percentages",
      required: true
    },
    {
      name: "Current Values",
      isValid: !!data.currentValues,
      description: "Your current AUM, annuity, and life insurance values",
      required: true
    },
    {
      name: "Client Metrics",
      isValid: !!data.clientMetrics,
      description: "Your client performance and conversion metrics",
      required: true
    },
    {
      name: "Marketing Campaigns",
      isValid: data.campaigns && data.campaigns.length > 0,
      description: "Your active marketing campaigns and budgets",
      required: true
    },
    {
      name: "Commission Rates",
      isValid: !!data.commissionRates,
      description: "Your commission rates for different products",
      required: true
    },
    {
      name: "Financial Book",
      isValid: !!data.financialBook,
      description: "Your financial book values and qualified money",
      required: true
    }
  ]

  const completedChecks = validationChecks.filter(check => check.isValid).length
  const totalChecks = validationChecks.length
  const completionPercentage = Math.round((completedChecks / totalChecks) * 100)

  const getStatusIcon = (isValid: boolean) => {
    if (isValid) {
      return <CheckCircle className="h-5 w-5 text-green-500" />
    }
    return <XCircle className="h-5 w-5 text-red-500" />
  }

  const getStatusBadge = (isValid: boolean) => {
    if (isValid) {
      return <Badge variant="default" className="bg-green-500">Complete</Badge>
    }
    return <Badge variant="destructive">Missing</Badge>
  }

  return (
    <Card className="border-none shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-white">Data Completeness</CardTitle>
            <CardDescription className="text-gray-300">
              {completedChecks} of {totalChecks} sections completed ({completionPercentage}%)
            </CardDescription>
          </div>
          <Button 
            onClick={onEditData}
            variant="outline"
            size="sm"
            className="border-m8bs-border text-white hover:bg-m8bs-card-alt"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Data
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {validationChecks.map((check, index) => (
            <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-card/50 border border-border/50">
              <div className="flex items-center space-x-3">
                {getStatusIcon(check.isValid)}
                <div>
                  <div className="font-medium text-white">{check.name}</div>
                  <div className="text-sm text-gray-400">{check.description}</div>
                </div>
              </div>
              {getStatusBadge(check.isValid)}
            </div>
          ))}
          
          {completionPercentage < 100 && (
            <div className="mt-4 p-4 rounded-lg bg-amber-900/20 border border-amber-500/30">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-amber-500" />
                <div>
                  <div className="font-medium text-amber-200">Incomplete Data</div>
                  <div className="text-sm text-amber-300">
                    Complete all required sections to access your full dashboard.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
