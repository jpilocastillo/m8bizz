"use client"

import { memo } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export const ScorecardSkeleton = memo(function ScorecardSkeleton() {
  return (
    <Card className="bg-m8bs-card border-m8bs-card-alt shadow-md">
      <CardHeader className="pb-1 pt-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-32" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-8" />
            <Skeleton className="h-4 w-12" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-2 pb-3">
        <div className="space-y-3">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {/* Core Behaviors Skeleton */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between mb-1">
                <Skeleton className="h-4 w-24" />
                <div className="flex items-center gap-1.5">
                  <Skeleton className="h-3 w-10" />
                  <Skeleton className="h-5 w-6" />
                </div>
              </div>
              <div className="grid gap-1.5">
                <Skeleton className="h-8 w-full" />
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            </div>
            {/* Role-Specific Skeleton */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between mb-1">
                <Skeleton className="h-4 w-24" />
                <div className="flex items-center gap-1.5">
                  <Skeleton className="h-3 w-10" />
                  <Skeleton className="h-5 w-6" />
                </div>
              </div>
              <div className="grid gap-1.5">
                <Skeleton className="h-8 w-full" />
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            </div>
          </div>
          <Skeleton className="h-10 w-full" />
        </div>
      </CardContent>
    </Card>
  )
})

export const CompanySummarySkeleton = memo(function CompanySummarySkeleton() {
  return (
    <Card className="bg-m8bs-card border-m8bs-border shadow-md">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <div>
              <Skeleton className="h-5 w-32 mb-1" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <Skeleton className="h-8 w-8" />
        </div>
      </CardHeader>
      <CardContent className="pt-2 pb-3">
        <div className="space-y-3">
          <div>
            <Skeleton className="h-3 w-32 mb-1" />
            <Skeleton className="h-2 w-full rounded-full" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-m8bs-card-alt border border-m8bs-border rounded-lg p-2">
                <Skeleton className="h-4 w-20 mb-1.5" />
                <Skeleton className="h-3 w-16 mb-1" />
                <Skeleton className="h-1.5 w-full rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
})
