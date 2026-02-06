"use client"

import { useState, useMemo, memo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { type CompanySummary } from '@/lib/behavior-scorecard'
import { TrendingUp, Award, BarChart3, ArrowUpDown, ArrowUp, ArrowDown, Target, Users, ChevronDown, ChevronUp } from 'lucide-react'

interface CompanySummaryProps {
  companySummary: CompanySummary
}

type SortOption = 'grade'

export function CompanySummary({ companySummary }: CompanySummaryProps) {
  const [sortBy, setSortBy] = useState<SortOption>('grade')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [isExpanded, setIsExpanded] = useState(false)

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

  const getGradeOrder = (grade: string): number => {
    const order: Record<string, number> = { 'A': 1, 'B': 2, 'C': 3, 'D': 4, 'F': 5 }
    return order[grade] || 6
  }

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-green-500'
    if (percentage >= 70) return 'bg-blue-500'
    if (percentage >= 50) return 'bg-yellow-500'
    if (percentage >= 30) return 'bg-orange-500'
    return 'bg-red-500'
  }

  // Organize roles by grade tier
  const organizedRoles = useMemo(() => {
    const sorted = [...companySummary.roleScorecards].sort((a, b) => {
      const aOrder = getGradeOrder(a.averageGrade)
      const bOrder = getGradeOrder(b.averageGrade)
      return sortDirection === 'desc' ? aOrder - bOrder : bOrder - aOrder
    })

    // Group by grade
    const grouped: Record<string, typeof sorted> = {
      'A': [],
      'B': [],
      'C': [],
      'D': [],
      'F': []
    }

    sorted.forEach(role => {
      const grade = role.averageGrade
      if (grouped[grade]) {
        grouped[grade].push(role)
      }
    })

    return { sorted, grouped }
  }, [companySummary.roleScorecards, sortBy, sortDirection])

  const handleSort = (option: SortOption) => {
    if (sortBy === option) {
      setSortDirection(sortDirection === 'desc' ? 'asc' : 'desc')
    } else {
      setSortBy(option)
      setSortDirection('desc')
    }
  }

  return (
    <div className="space-y-2">
      {/* Compact Company Summary Card - Collapsible */}
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <Card className="bg-m8bs-card border-m8bs-border shadow-md">
          <CollapsibleTrigger asChild>
            <CardHeader className="pb-2 cursor-pointer hover:bg-m8bs-card-alt/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="bg-m8bs-blue/20 p-1.5 rounded-lg">
                    <Award className="h-4 w-4 text-m8bs-blue" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-bold text-white">Company Summary</CardTitle>
                    <CardDescription className="text-m8bs-muted text-xs">
                      {companySummary.companyAverage.toFixed(1)}% Average
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={`${getGradeColor(companySummary.companyGrade)} border px-3 py-1 text-lg font-bold`}>
                    {companySummary.companyGrade}
                  </Badge>
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 text-m8bs-muted" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-m8bs-muted" />
                  )}
                </div>
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <CardContent className="pt-2 pb-3">
              {/* Enhanced Progress Bar with Animation */}
              <div className="mb-3 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-m8bs-muted font-medium">Overall Performance</span>
                  <span className="text-white font-semibold">{companySummary.companyAverage.toFixed(1)}%</span>
                </div>
                <div className="h-2.5 bg-m8bs-card-alt rounded-full overflow-hidden shadow-inner">
                  <div
                    className={`h-full ${getProgressColor(companySummary.companyAverage)} transition-all duration-700 ease-out rounded-full shadow-sm`}
                    style={{ 
                      width: `${Math.min(companySummary.companyAverage, 100)}%`,
                      animation: 'slideIn 0.7s ease-out'
                    }}
                  />
                </div>
              </div>

              {/* Compact Sort Controls */}
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-m8bs-border">
                <span className="text-xs text-m8bs-muted">Sort:</span>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort('grade')}
                    className={`h-6 px-2 text-xs ${sortBy === 'grade' ? 'bg-m8bs-blue/20' : ''}`}
                  >
                    Grade{sortBy === 'grade' && (sortDirection === 'desc' ? <ArrowDown className="h-2 w-2 ml-1" /> : <ArrowUp className="h-2 w-2 ml-1" />)}
                  </Button>
                </div>
              </div>

              {/* Compact Role Scorecards - Single Row with Animation */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {organizedRoles.sorted.map((roleScorecard, index) => (
                  <div
                    key={roleScorecard.roleId}
                    style={{
                      animation: `fadeInUp 0.3s ease-out ${index * 0.05}s both`
                    }}
                  >
                    <RoleCard roleScorecard={roleScorecard} getGradeColor={getGradeColor} getProgressColor={getProgressColor} />
                  </div>
                ))}
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </div>
  )
}

// Compact role card component - memoized for performance
const RoleCard = memo(function RoleCard({ 
  roleScorecard, 
  getGradeColor, 
  getProgressColor 
}: { 
  roleScorecard: any
  getGradeColor: (grade: string) => string
  getProgressColor: (percentage: number) => string
}) {
  return (
    <div className="bg-m8bs-card-alt border border-m8bs-border rounded-lg p-2 hover:border-m8bs-blue/50 transition-colors">
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex-1 min-w-0 pr-1">
          <h4 className="font-semibold text-white text-xs truncate">{roleScorecard.roleName}</h4>
          {roleScorecard.personName && (
            <p className="text-m8bs-muted text-[10px] truncate mt-0.5">{roleScorecard.personName}</p>
          )}
        </div>
        <Badge className={`${getGradeColor(roleScorecard.combinedGrade || roleScorecard.averageGrade)} border px-1.5 py-0.5 text-xs font-bold flex-shrink-0`}>
          {roleScorecard.combinedGrade || roleScorecard.averageGrade}
        </Badge>
      </div>
      <div className="space-y-1.5">
        {/* Core Behaviors Grade */}
        {roleScorecard.defaultMetricsGrade !== undefined && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-m8bs-muted">Core</span>
            <div className="flex items-center gap-1">
              <span className="text-white font-semibold text-[10px]">
                {roleScorecard.defaultMetricsAverage?.toFixed(0) || '0'}%
              </span>
              <Badge className={`${getGradeColor(roleScorecard.defaultMetricsGrade)} border px-1 py-0 text-[10px]`}>
                {roleScorecard.defaultMetricsGrade}
              </Badge>
            </div>
          </div>
        )}
        {/* Role-Specific Grade */}
        {roleScorecard.userMetricsGrade !== undefined && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-m8bs-muted">Role</span>
            <div className="flex items-center gap-1">
              <span className="text-white font-semibold text-[10px]">
                {roleScorecard.userMetricsAverage?.toFixed(0) || '0'}%
              </span>
              <Badge className={`${getGradeColor(roleScorecard.userMetricsGrade)} border px-1 py-0 text-[10px]`}>
                {roleScorecard.userMetricsGrade}
              </Badge>
            </div>
          </div>
        )}
        {/* Combined Grade */}
        {roleScorecard.combinedGrade !== undefined && (
          <div className="flex items-center justify-between text-xs pt-0.5 border-t border-m8bs-border">
            <span className="text-m8bs-muted font-semibold">Combined</span>
            <div className="flex items-center gap-1">
              <span className="text-white font-semibold text-[10px]">
                {roleScorecard.combinedAverage?.toFixed(0) || '0'}%
              </span>
              <Badge className={`${getGradeColor(roleScorecard.combinedGrade)} border px-1 py-0 text-[10px] font-bold`}>
                {roleScorecard.combinedGrade}
              </Badge>
            </div>
          </div>
        )}
        {/* Fallback to overall performance if no separated scores */}
        {roleScorecard.combinedGrade === undefined && roleScorecard.defaultMetricsGrade === undefined && roleScorecard.userMetricsGrade === undefined && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-m8bs-muted">Perf</span>
            <span className="text-white font-semibold">{roleScorecard.averageGradePercentage.toFixed(0)}%</span>
          </div>
        )}
      </div>
    </div>
  )
})





