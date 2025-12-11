"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { type CompanySummary } from '@/lib/behavior-scorecard'
import { TrendingUp, Award } from 'lucide-react'

interface CompanySummaryProps {
  companySummary: CompanySummary
}

export function CompanySummary({ companySummary }: CompanySummaryProps) {
  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': return 'bg-green-500/20 text-green-400 border-green-500/50'
      case 'B': return 'bg-blue-500/20 text-blue-400 border-blue-500/50'
      case 'C': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50'
      case 'D': return 'bg-orange-500/20 text-orange-400 border-orange-500/50'
      case 'F': return 'bg-red-500/20 text-red-400 border-red-500/50'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/50'
    }
  }

  return (
    <Card className="bg-black border-gray-800 shadow-lg">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-m8bs-card-alt p-2 rounded-lg">
              <Award className="h-6 w-6 text-m8bs-blue" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-white">Company Summary</CardTitle>
              <CardDescription className="text-m8bs-muted mt-1">
                Overall Business Performance
              </CardDescription>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 mb-1">
              <Badge className={`${getGradeColor(companySummary.companyGrade)} border px-4 py-2 text-2xl font-bold`}>
                {companySummary.companyGrade}
              </Badge>
            </div>
            <p className="text-sm text-m8bs-muted mt-2">
              Company Average: {companySummary.companyAverage.toFixed(1)}%
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {companySummary.roleScorecards.map((roleScorecard) => (
            <Card
              key={roleScorecard.roleId}
              className="bg-m8bs-card-alt border-m8bs-border p-4 shadow-md"
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-white text-sm">{roleScorecard.roleName}</h4>
                <Badge className={`${getGradeColor(roleScorecard.averageGrade)} border text-xs`}>
                  {roleScorecard.averageGrade}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-m8bs-muted" />
                <p className="text-sm text-m8bs-muted">
                  {roleScorecard.averageGradePercentage.toFixed(1)}% of Goal
                </p>
              </div>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}





