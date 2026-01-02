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
    <Card className="bg-m8bs-card border-m8bs-card-alt shadow-md">
      <CardHeader className="pb-1 pt-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold text-white">{roleScorecard.roleName}</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={`${getGradeColor(roleScorecard.combinedGrade || roleScorecard.averageGrade)} border px-2 py-0.5 text-sm font-bold`}>
              {roleScorecard.combinedGrade || roleScorecard.averageGrade}
            </Badge>
            <span className="text-xs text-m8bs-muted">
              {roleScorecard.combinedAverage !== undefined 
                ? `${roleScorecard.combinedAverage.toFixed(0)}%`
                : `${roleScorecard.averageGradePercentage.toFixed(0)}%`}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-2 pb-3">
        <div className="space-y-3">
          {/* Side-by-side layout for Core Behaviors and Role-Specific Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {/* Core Behaviors Section (Left Side) */}
            {roleScorecard.defaultMetrics && roleScorecard.defaultMetrics.length > 0 && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-sm font-semibold text-white">Core Behaviors</h3>
                  {roleScorecard.defaultMetricsAverage !== undefined && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-m8bs-muted">
                        {roleScorecard.defaultMetricsAverage.toFixed(0)}%
                      </span>
                      <Badge className={`${getGradeColor(roleScorecard.defaultMetricsGrade || 'F')} border px-1.5 py-0.5 text-xs`}>
                        {roleScorecard.defaultMetricsGrade || 'F'}
                      </Badge>
                    </div>
                  )}
                </div>
                <div className="grid gap-1.5">
                  <div className="grid grid-cols-5 gap-2 p-1.5 bg-m8bs-card-alt rounded border border-m8bs-border font-semibold text-xs text-white">
                    <div className="col-span-2">Metric</div>
                    <div className="text-right">Goal</div>
                    <div className="text-right">Actual</div>
                    <div className="text-right">Grade</div>
                  </div>
                  {roleScorecard.defaultMetrics.map((metric) => (
                    <div
                      key={metric.metricId}
                      className="grid grid-cols-5 gap-2 p-1.5 bg-m8bs-card-alt rounded border border-m8bs-border hover:bg-m8bs-card transition-colors"
                    >
                      <div className="col-span-2 flex items-center gap-1">
                        {getTrendIcon(metric.percentageOfGoal)}
                        <span className="text-white font-medium text-xs truncate">{metric.metricName}</span>
                      </div>
                      <div className="text-right text-m8bs-muted text-xs">
                        {formatValue(metric.goalValue, metric.metricType)}
                      </div>
                      <div className="text-right text-white font-semibold text-xs">
                        {formatValue(metric.actualValue, metric.metricType)}
                      </div>
                      <div className="text-right">
                        <Badge className={`${getGradeColor(metric.grade)} border px-1 py-0 text-xs`}>
                          {metric.grade}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Role-Specific Metrics Section (Right Side) */}
            {roleScorecard.userMetrics && roleScorecard.userMetrics.length > 0 && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-sm font-semibold text-white">Role-Specific</h3>
                  {roleScorecard.userMetricsAverage !== undefined && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-m8bs-muted">
                        {roleScorecard.userMetricsAverage.toFixed(0)}%
                      </span>
                      <Badge className={`${getGradeColor(roleScorecard.userMetricsGrade || 'F')} border px-1.5 py-0.5 text-xs`}>
                        {roleScorecard.userMetricsGrade || 'F'}
                      </Badge>
                    </div>
                  )}
                </div>
                <div className="grid gap-1.5">
                  <div className="grid grid-cols-5 gap-2 p-1.5 bg-m8bs-card-alt rounded border border-m8bs-border font-semibold text-xs text-white">
                    <div className="col-span-2">Metric</div>
                    <div className="text-right">Goal</div>
                    <div className="text-right">Actual</div>
                    <div className="text-right">Grade</div>
                  </div>
                  {roleScorecard.userMetrics.map((metric) => (
                    <div
                      key={metric.metricId}
                      className="grid grid-cols-5 gap-2 p-1.5 bg-m8bs-card-alt rounded border border-m8bs-border hover:bg-m8bs-card transition-colors"
                    >
                      <div className="col-span-2 flex items-center gap-1">
                        {getTrendIcon(metric.percentageOfGoal)}
                        <span className="text-white font-medium text-xs truncate">{metric.metricName}</span>
                      </div>
                      <div className="text-right text-m8bs-muted text-xs">
                        {formatValue(metric.goalValue, metric.metricType)}
                      </div>
                      <div className="text-right text-white font-semibold text-xs">
                        {formatValue(metric.actualValue, metric.metricType)}
                      </div>
                      <div className="text-right">
                        <Badge className={`${getGradeColor(metric.grade)} border px-1 py-0 text-xs`}>
                          {metric.grade}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Show message if no metrics */}
          {(!roleScorecard.defaultMetrics || roleScorecard.defaultMetrics.length === 0) &&
           (!roleScorecard.userMetrics || roleScorecard.userMetrics.length === 0) && (
            <div className="text-center py-8 text-m8bs-muted">
              <p>No metrics configured for this role.</p>
            </div>
          )}

          {/* Combined Score Row - Full Width */}
          {roleScorecard.combinedAverage !== undefined && (
            <div className="grid grid-cols-4 gap-2 p-2 bg-gradient-to-r from-m8bs-blue/20 to-m8bs-blue-dark/20 rounded border border-m8bs-blue/50 text-sm">
              <div className="col-span-2 text-white font-semibold">Combined</div>
              <div className="text-right text-white font-semibold">
                {roleScorecard.combinedAverage.toFixed(0)}%
              </div>
              <div className="text-right">
                <Badge className={`${getGradeColor(roleScorecard.combinedGrade || 'F')} border px-1.5 py-0.5 text-xs`}>
                  {roleScorecard.combinedGrade || 'F'}
                </Badge>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

