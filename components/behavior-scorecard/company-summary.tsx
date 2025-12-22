"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { type CompanySummary } from '@/lib/behavior-scorecard'
import { TrendingUp, Award, TrendingDown, Minus, Target, BarChart3 } from 'lucide-react'

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

  const getTrendIcon = (percentage: number) => {
    if (percentage >= 90) return <TrendingUp className="h-4 w-4 text-green-400" />
    if (percentage >= 70) return <Minus className="h-4 w-4 text-yellow-400" />
    return <TrendingDown className="h-4 w-4 text-red-400" />
  }

  const getProgressColor = (percentage: number): string => {
    if (percentage >= 90) return 'bg-green-500'
    if (percentage >= 80) return 'bg-blue-500'
    if (percentage >= 70) return 'bg-yellow-500'
    if (percentage >= 60) return 'bg-orange-500'
    return 'bg-red-500'
  }

  return (
    <Card className="bg-m8bs-card border-m8bs-card-alt shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-m8bs-card-alt p-3 rounded-lg">
              <Award className="h-6 w-6 text-m8bs-blue" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-white">Company Summary</CardTitle>
              <CardDescription className="text-m8bs-muted mt-1">
                Overall Business Performance Overview
              </CardDescription>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-3 mb-2">
              <Badge className={`${getGradeColor(companySummary.companyGrade)} border px-5 py-3 text-3xl font-bold`}>
                {companySummary.companyGrade}
              </Badge>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Progress 
                  value={companySummary.companyAverage} 
                  className="w-32 h-3"
                />
                <span className="text-sm font-semibold text-white">
                  {companySummary.companyAverage.toFixed(1)}%
                </span>
              </div>
              <p className="text-xs text-m8bs-muted">
                Company Average Performance
              </p>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {companySummary.roleScorecards.length === 0 ? (
          <div className="text-center py-8 text-m8bs-muted">
            <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No role data available</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {companySummary.roleScorecards.map((roleScorecard) => (
              <Card
                key={roleScorecard.roleId}
                className="bg-m8bs-card-alt border-m8bs-border p-4 shadow-md hover:shadow-lg hover:border-m8bs-blue/50 transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-m8bs-blue" />
                    <h4 className="font-semibold text-white text-sm">{roleScorecard.roleName}</h4>
                  </div>
                  <Badge className={`${getGradeColor(roleScorecard.averageGrade)} border text-xs`}>
                    {roleScorecard.averageGrade}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-m8bs-muted">Performance</span>
                    <span className={`font-semibold ${
                      roleScorecard.averageGradePercentage >= 90 ? 'text-green-400' :
                      roleScorecard.averageGradePercentage >= 70 ? 'text-yellow-400' :
                      'text-red-400'
                    }`}>
                      {roleScorecard.averageGradePercentage.toFixed(1)}%
                    </span>
                  </div>
                  <Progress 
                    value={roleScorecard.averageGradePercentage} 
                    className="h-2"
                  />
                  <div className="flex items-center gap-2 text-xs text-m8bs-muted">
                    {getTrendIcon(roleScorecard.averageGradePercentage)}
                    <span>{roleScorecard.metrics.length} {roleScorecard.metrics.length === 1 ? 'metric' : 'metrics'}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}





