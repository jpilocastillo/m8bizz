"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { type RoleScorecard, type MetricScore, calculateGrade } from '@/lib/behavior-scorecard'
import { TrendingUp, TrendingDown, Minus, Target, Award, AlertCircle } from 'lucide-react'

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

  const getProgressColor = (percentage: number): string => {
    if (percentage >= 90) return 'bg-green-500'
    if (percentage >= 80) return 'bg-blue-500'
    if (percentage >= 70) return 'bg-yellow-500'
    if (percentage >= 60) return 'bg-orange-500'
    return 'bg-red-500'
  }

  const getMetricStatus = (percentage: number) => {
    if (percentage >= 90) return { icon: <Award className="h-4 w-4 text-green-400" />, label: 'Excellent' }
    if (percentage >= 80) return { icon: <TrendingUp className="h-4 w-4 text-blue-400" />, label: 'Good' }
    if (percentage >= 70) return { icon: <Minus className="h-4 w-4 text-yellow-400" />, label: 'Average' }
    if (percentage >= 60) return { icon: <AlertCircle className="h-4 w-4 text-orange-400" />, label: 'Needs Improvement' }
    return { icon: <AlertCircle className="h-4 w-4 text-red-400" />, label: 'Critical' }
  }

  return (
    <Card className="bg-m8bs-card border-m8bs-card-alt shadow-lg hover:shadow-xl transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-m8bs-card-alt p-2 rounded-lg">
              <Target className="h-5 w-5 text-m8bs-blue" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-white">{roleScorecard.roleName}</CardTitle>
              <CardDescription className="text-m8bs-muted mt-1">
                Performance Scorecard
              </CardDescription>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 mb-1">
              <Badge className={`${getGradeColor(roleScorecard.averageGrade)} border px-4 py-2 text-xl font-bold`}>
                {roleScorecard.averageGrade}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Progress 
                value={roleScorecard.averageGradePercentage} 
                className="w-24 h-2"
              />
              <p className="text-sm text-m8bs-muted font-medium">
                {roleScorecard.averageGradePercentage.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {roleScorecard.metrics.length === 0 ? (
            <div className="text-center py-8 text-m8bs-muted">
              <Target className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No metrics available for this role</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-7 gap-3 p-3 bg-m8bs-card-alt rounded-lg border border-m8bs-border font-semibold text-xs text-white">
                <div className="col-span-2">Metric</div>
                <div className="text-right">Goal</div>
                <div className="text-right">Actual</div>
                <div className="text-right">Progress</div>
                <div className="text-right">% Goal</div>
                <div className="text-right">Grade</div>
              </div>

              {roleScorecard.metrics.map((metric, index) => {
                const status = getMetricStatus(metric.percentageOfGoal)
                return (
                  <div
                    key={metric.metricId}
                    className="grid grid-cols-7 gap-3 p-3 bg-m8bs-card-alt rounded-lg border border-m8bs-border hover:bg-m8bs-card hover:border-m8bs-blue/50 transition-all"
                  >
                    <div className="col-span-2 flex items-center gap-2">
                      {status.icon}
                      <div>
                        <span className="text-white font-medium text-sm">{metric.metricName}</span>
                        <div className="text-xs text-m8bs-muted">{status.label}</div>
                      </div>
                    </div>
                    <div className="text-right text-m8bs-muted text-sm">
                      {formatValue(metric.goalValue, metric.metricType)}
                    </div>
                    <div className="text-right text-white font-semibold text-sm">
                      {formatValue(metric.actualValue, metric.metricType)}
                    </div>
                    <div className="text-right">
                      <Progress 
                        value={Math.min(100, metric.percentageOfGoal)} 
                        className="h-2 w-full"
                      />
                    </div>
                    <div className="text-right">
                      <span className={`font-semibold text-sm ${
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
                      <Badge className={`${getGradeColor(metric.grade)} border text-xs`}>
                        {metric.grade}
                      </Badge>
                    </div>
                  </div>
                )
              })}

              {/* Average Row */}
              <div className="grid grid-cols-7 gap-3 p-4 bg-m8bs-card-alt rounded-lg border-2 border-m8bs-border font-bold mt-4">
                <div className="col-span-2 text-white flex items-center gap-2">
                  <Award className="h-5 w-5 text-m8bs-blue" />
                  <span>Overall Average</span>
                </div>
                <div className="col-span-2"></div>
                <div className="text-right">
                  <Progress 
                    value={roleScorecard.averageGradePercentage} 
                    className="h-2 w-full"
                  />
                </div>
                <div className="text-right text-white">
                  {roleScorecard.averageGradePercentage.toFixed(1)}%
                </div>
                <div className="text-right">
                  <Badge className={`${getGradeColor(roleScorecard.averageGrade)} border px-3 py-1 text-sm`}>
                    {roleScorecard.averageGrade}
                  </Badge>
                </div>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

