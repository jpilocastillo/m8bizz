"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function AnalyticsSkeleton() {
  return (
    <div className="space-y-6 lg:space-y-8 animate-pulse">
      {/* Header Section Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2">
        <div className="flex items-center gap-3">
          <div className="bg-m8bs-border/50 p-3 rounded-xl">
            <Skeleton className="h-8 w-8 bg-m8bs-border/50" />
          </div>
          <div>
            <Skeleton className="h-8 w-80 bg-m8bs-border/50 mb-2" />
            <Skeleton className="h-4 w-96 bg-m8bs-border/50" />
          </div>
        </div>
        <Skeleton className="h-10 w-32 bg-m8bs-border/50" />
      </div>

      {/* Summary Cards Skeleton */}
      <div className="grid grid-cols-1 gap-4 lg:gap-6">
        <div className="bg-gradient-to-br from-m8bs-card to-m8bs-card-alt border-m8bs-border rounded-2xl p-6 shadow-lg">
          <div className="overflow-x-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 min-w-[900px]">
              {Array.from({ length: 7 }).map((_, index) => (
                <Card key={index} className="bg-gradient-to-br from-m8bs-card to-m8bs-card-alt border-m8bs-border text-white shadow-lg h-full">
                  <CardContent className="p-3 flex flex-col h-full">
                    <div className="flex items-center justify-between mb-2">
                      <Skeleton className="h-4 w-20 bg-m8bs-border/50" />
                      <div className="bg-m8bs-border/50 p-2 rounded-lg">
                        <Skeleton className="h-4 w-4 bg-m8bs-border/50" />
                      </div>
                    </div>
                    <Skeleton className="h-6 w-16 bg-m8bs-border/50 mb-1" />
                    <Skeleton className="h-3 w-24 bg-m8bs-border/50 mt-auto" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid Skeleton */}
      <div className="space-y-4">
        {/* Top Row - Top Performers and Heatmap */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Top Performers Skeleton */}
          <Card className="bg-m8bs-card border-m8bs-card-alt shadow-lg">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-5 bg-m8bs-border/50" />
                <Skeleton className="h-6 w-48 bg-m8bs-border/50" />
              </div>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="space-y-3">
                {/* Metric Selector Skeleton */}
                <div className="flex flex-wrap gap-1.5">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Skeleton key={index} className="h-8 w-20 bg-m8bs-border/50" />
                  ))}
                </div>
                
                {/* Events List Skeleton */}
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <div key={index} className="relative overflow-hidden rounded-xl border-2 border-m8bs-border bg-m8bs-card p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <Skeleton className="w-10 h-10 rounded-full bg-m8bs-border/50" />
                          <div className="flex-1 min-w-0">
                            <Skeleton className="h-4 w-32 bg-m8bs-border/50 mb-1" />
                            <div className="flex flex-wrap gap-x-3 gap-y-1">
                              <Skeleton className="h-3 w-20 bg-m8bs-border/50" />
                              <Skeleton className="h-3 w-24 bg-m8bs-border/50" />
                              <Skeleton className="h-3 w-16 bg-m8bs-border/50" />
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <div className="hidden md:flex flex-col items-end gap-1">
                            <Skeleton className="h-3 w-16 bg-m8bs-border/50" />
                            <Skeleton className="h-3 w-12 bg-m8bs-border/50" />
                            <Skeleton className="h-3 w-20 bg-m8bs-border/50" />
                          </div>
                          <div className="text-right">
                            <Skeleton className="h-6 w-16 bg-m8bs-border/50 mb-1" />
                            <Skeleton className="h-1.5 w-20 bg-m8bs-border/50" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Performance Heatmap Skeleton */}
          <Card className="bg-m8bs-card border-m8bs-card-alt shadow-lg">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-5 bg-m8bs-border/50" />
                <Skeleton className="h-6 w-40 bg-m8bs-border/50" />
              </div>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="space-y-6">
                {/* Metric Selector Skeleton */}
                <div className="flex flex-wrap gap-2">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Skeleton key={index} className="h-8 w-24 bg-m8bs-border/50" />
                  ))}
                </div>

                {/* Grouping Controls Skeleton */}
                <div className="flex flex-wrap gap-4 items-center p-4 bg-m8bs-card rounded-lg border border-m8bs-border">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-12 bg-m8bs-border/50" />
                    <Skeleton className="h-8 w-24 bg-m8bs-border/50" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-16 bg-m8bs-border/50" />
                    <Skeleton className="h-8 w-24 bg-m8bs-border/50" />
                  </div>
                </div>

                {/* Heatmap Table Skeleton */}
                <div className="bg-m8bs-card rounded-lg border border-m8bs-border p-4">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr>
                          <th className="text-left p-3 border-b border-m8bs-border">
                            <Skeleton className="h-4 w-16 bg-m8bs-border/50" />
                          </th>
                          {Array.from({ length: 4 }).map((_, index) => (
                            <th key={index} className="p-3 text-center border-b border-m8bs-border">
                              <Skeleton className="h-4 w-12 bg-m8bs-border/50 mx-auto" />
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {Array.from({ length: 3 }).map((_, rowIndex) => (
                          <tr key={rowIndex}>
                            <td className="p-3 border-b border-m8bs-border/50">
                              <Skeleton className="h-4 w-20 bg-m8bs-border/50" />
                            </td>
                            {Array.from({ length: 4 }).map((_, colIndex) => (
                              <td key={colIndex} className="p-3 text-center">
                                <div className="bg-m8bs-border/50 rounded-lg p-3">
                                  <Skeleton className="h-4 w-12 bg-m8bs-border/50 mx-auto mb-1" />
                                  <Skeleton className="h-3 w-8 bg-m8bs-border/50 mx-auto" />
                                </div>
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Legend Skeleton */}
                <div className="flex items-center justify-center gap-4 p-4 bg-m8bs-card rounded-lg border border-m8bs-border">
                  <Skeleton className="h-4 w-32 bg-m8bs-border/50" />
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Skeleton className="w-4 h-4 rounded bg-m8bs-border/50" />
                      <Skeleton className="h-3 w-12 bg-m8bs-border/50" />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Row - Event Comparison Skeleton */}
        <Card className="bg-m8bs-card border-m8bs-card-alt shadow-lg">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-5 bg-m8bs-border/50" />
              <Skeleton className="h-6 w-40 bg-m8bs-border/50" />
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="space-y-3">
              {/* Metric Selector Skeleton */}
              <div className="flex flex-wrap gap-1.5">
                {Array.from({ length: 6 }).map((_, index) => (
                  <Skeleton key={index} className="h-8 w-20 bg-m8bs-border/50" />
                ))}
              </div>

              {/* Event Selector Skeleton */}
              <div className="flex items-center gap-2">
                <Skeleton className="h-10 w-64 bg-m8bs-border/50" />
              </div>

              {/* Summary Cards Skeleton */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="bg-m8bs-card p-4 rounded-lg border border-m8bs-border">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="bg-m8bs-border/50 p-2 rounded-lg">
                        <Skeleton className="h-4 w-4 bg-m8bs-border/50" />
                      </div>
                      <Skeleton className="h-4 w-24 bg-m8bs-border/50" />
                    </div>
                    <Skeleton className="h-6 w-20 bg-m8bs-border/50" />
                  </div>
                ))}
              </div>

              {/* Chart Skeleton */}
              <div className="bg-m8bs-card rounded-lg border border-m8bs-border p-4">
                <Skeleton className="h-[400px] w-full bg-m8bs-border/50" />
              </div>

              {/* Data Table Skeleton */}
              <div className="bg-m8bs-card rounded-lg border border-m8bs-border overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-m8bs-border bg-m8bs-card-alt">
                        {Array.from({ length: 5 }).map((_, index) => (
                          <th key={index} className="text-left py-3 px-4">
                            <Skeleton className="h-4 w-16 bg-m8bs-border/50" />
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {Array.from({ length: 5 }).map((_, rowIndex) => (
                        <tr key={rowIndex} className="border-b border-m8bs-border">
                          {Array.from({ length: 5 }).map((_, colIndex) => (
                            <td key={colIndex} className="py-3 px-4">
                              <Skeleton className="h-4 w-20 bg-m8bs-border/50" />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Footer Info Skeleton */}
              <div className="text-center">
                <Skeleton className="h-4 w-48 bg-m8bs-border/50 mx-auto" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
