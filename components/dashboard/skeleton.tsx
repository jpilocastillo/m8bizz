import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Key metrics row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="bg-m8bs-card border-m8bs-border p-6">
            <div className="flex items-center justify-between mb-4">
              <Skeleton className="h-4 w-24 bg-m8bs-border" />
              <Skeleton className="h-6 w-6 rounded-full bg-m8bs-border" />
            </div>
            <div className="flex items-center justify-between">
              <Skeleton className="h-8 w-32 bg-m8bs-border" />
              <Skeleton className="h-10 w-16 bg-m8bs-border" />
            </div>
          </Card>
        ))}
      </div>

      {/* Event details row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="bg-m8bs-card border-m8bs-border p-6">
            <div className="flex items-center justify-between mb-4">
              <Skeleton className="h-4 w-24 bg-m8bs-border" />
            </div>
            <Skeleton className="h-8 w-32 bg-m8bs-border" />
          </Card>
        ))}
      </div>

      {/* Marketing and attendance section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <Card className="bg-m8bs-card border-m8bs-border p-6">
            <div className="flex items-center justify-between mb-4">
              <Skeleton className="h-4 w-32 bg-m8bs-border" />
            </div>
            <Skeleton className="h-8 w-40 bg-m8bs-border mb-4" />
            <div className="flex justify-center mb-6">
              <Skeleton className="h-32 w-32 rounded-full bg-m8bs-border" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Skeleton className="h-4 w-24 bg-m8bs-border mb-2" />
                <Skeleton className="h-6 w-20 bg-m8bs-border" />
              </div>
              <div>
                <Skeleton className="h-4 w-24 bg-m8bs-border mb-2" />
                <Skeleton className="h-6 w-20 bg-m8bs-border" />
              </div>
            </div>
          </Card>
        </div>

        <div className="md:col-span-1">
          <Card className="bg-m8bs-card border-m8bs-border p-6">
            <div className="flex items-center justify-between mb-4">
              <Skeleton className="h-4 w-32 bg-m8bs-border" />
            </div>
            <div className="space-y-6">
              {[...Array(3)].map((_, i) => (
                <div key={i}>
                  <div className="flex justify-between items-center mb-2">
                    <Skeleton className="h-4 w-24 bg-m8bs-border" />
                    <div className="flex items-center">
                      <Skeleton className="h-6 w-8 bg-m8bs-border mr-3" />
                      <Skeleton className="h-6 w-6 rounded-full bg-m8bs-border" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Accumulated income section */}
      <Card className="bg-m8bs-card border-m8bs-border p-6">
        <Skeleton className="h-4 w-32 bg-m8bs-border mb-4" />
        <Skeleton className="h-8 w-40 bg-m8bs-border mb-6" />
        <Skeleton className="h-3 w-full bg-m8bs-border mb-6" />
        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i}>
              <Skeleton className="h-4 w-24 bg-m8bs-border mb-2" />
              <Skeleton className="h-6 w-28 bg-m8bs-border mb-1" />
              <Skeleton className="h-3 w-16 bg-m8bs-border" />
            </div>
          ))}
        </div>
      </Card>

      {/* Client acquisition and conversion section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[...Array(2)].map((_, i) => (
          <Card key={i} className="bg-m8bs-card border-m8bs-border p-6">
            <Skeleton className="h-4 w-32 bg-m8bs-border mb-6" />
            <div className="flex justify-center mb-6">
              <Skeleton className="h-32 w-32 rounded-full bg-m8bs-border" />
            </div>
            <div className="space-y-4">
              {[...Array(3)].map((_, j) => (
                <div key={j} className="flex justify-between items-center">
                  <Skeleton className="h-4 w-32 bg-m8bs-border" />
                  <Skeleton className="h-4 w-16 bg-m8bs-border" />
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
