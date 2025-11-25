"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { type RoleScorecard, type MetricScore, calculateGrade } from '@/lib/behavior-scorecard'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface ScorecardDisplayProps {
  roleScorecard: RoleScorecard
}

export function ScorecardDisplay({ roleScorecard }: ScorecardDisplayProps) {
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

  const formatValue = (value: number, metricType: string) => {
    if (metricType === 'currency') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value)
    }
    if (metricType === 'percentage') {
      return `${value}%`
    }
    if (metricType === 'time') {
      return `${value} ${value === 1 ? 'day' : 'days'}`
    }
    if (metricType === 'rating_1_5' || metricType === 'rating_scale') {
      return value.toFixed(1)
    }
    return value.toString()
  }

  const getTrendIcon = (percentage: number) => {
    if (percentage >= 90) return <TrendingUp className="h-4 w-4 text-green-400" />
    if (percentage >= 70) return <Minus className="h-4 w-4 text-yellow-400" />
    return <TrendingDown className="h-4 w-4 text-red-400" />
  }

  return (
    <Card className="bg-m8bs-card border-m8bs-card-alt shadow-lg">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-white">{roleScorecard.roleName}</CardTitle>
            <CardDescription className="text-m8bs-muted mt-1">
              Performance Scorecard
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 mb-1">
              <Badge className={`${getGradeColor(roleScorecard.averageGrade)} border px-3 py-1 text-lg font-bold`}>
                {roleScorecard.averageGrade}
              </Badge>
            </div>
            <p className="text-sm text-m8bs-muted">
              {roleScorecard.averageGradePercentage.toFixed(1)}% of Goal
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid gap-4">
            <div className="grid grid-cols-6 gap-4 p-3 bg-m8bs-card-alt rounded-lg border border-m8bs-border font-semibold text-sm text-white">
              <div className="col-span-2">Monthly Statistics</div>
              <div className="text-right">Goal</div>
              <div className="text-right">Actual</div>
              <div className="text-right">% of Goal</div>
              <div className="text-right">Grade</div>
            </div>

            {roleScorecard.metrics.map((metric, index) => (
              <div
                key={metric.metricId}
                className="grid grid-cols-6 gap-4 p-3 bg-m8bs-card-alt rounded-lg border border-m8bs-border hover:bg-m8bs-card transition-colors"
              >
                <div className="col-span-2 flex items-center gap-2">
                  {getTrendIcon(metric.percentageOfGoal)}
                  <span className="text-white font-medium">{metric.metricName}</span>
                </div>
                <div className="text-right text-m8bs-muted">
                  {formatValue(metric.goalValue, metric.metricType)}
                </div>
                <div className="text-right text-white font-semibold">
                  {formatValue(metric.actualValue, metric.metricType)}
                </div>
                <div className="text-right">
                  <span className={`font-semibold ${
                    metric.percentageOfGoal >= 90 ? 'text-green-400' :
                    metric.percentageOfGoal >= 80 ? 'text-blue-400' :
                    metric.percentageOfGoal >= 70 ? 'text-yellow-400' :
                    metric.percentageOfGoal >= 60 ? 'text-orange-400' :
                    'text-red-400'
                  }`}>
                    {metric.percentageOfGoal.toFixed(1)}%
                  </span>
                </div>
                <div className="text-right">
                  <Badge className={`${getGradeColor(metric.grade)} border`}>
                    {metric.grade}
                  </Badge>
                </div>
              </div>
            ))}

            {/* Average Row */}
            <div className="grid grid-cols-6 gap-4 p-4 bg-gradient-to-r from-m8bs-blue/20 to-m8bs-blue-dark/20 rounded-lg border-2 border-m8bs-blue/50 font-bold">
              <div className="col-span-2 text-white">Average Grade</div>
              <div className="col-span-2"></div>
              <div className="text-right text-white">
                {roleScorecard.averageGradePercentage.toFixed(1)}%
              </div>
              <div className="text-right">
                <Badge className={`${getGradeColor(roleScorecard.averageGrade)} border px-3 py-1 text-base`}>
                  {roleScorecard.averageGrade}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

