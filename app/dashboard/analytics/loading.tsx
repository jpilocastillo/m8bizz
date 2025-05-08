import { Skeleton } from "@/components/ui/skeleton"

export function AnalyticsLoading() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Skeleton className="h-8 w-64 bg-[#1f2037]" />
        <Skeleton className="h-9 w-32 bg-[#1f2037]" />
      </div>

      <Skeleton className="h-14 w-full bg-[#1f2037]" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {Array(5)
          .fill(0)
          .map((_, i) => (
            <div key={i} className="bg-[#0c0d1d] border border-[#1f2037] rounded-lg p-4">
              <Skeleton className="h-4 w-24 bg-[#1f2037] mb-2" />
              <Skeleton className="h-8 w-32 bg-[#1f2037]" />
            </div>
          ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#0c0d1d] border border-[#1f2037] rounded-lg p-6">
          <div className="flex justify-between mb-4">
            <Skeleton className="h-6 w-32 bg-[#1f2037]" />
            <div className="flex space-x-1">
              {Array(5)
                .fill(0)
                .map((_, i) => (
                  <Skeleton key={i} className="h-7 w-16 bg-[#1f2037]" />
                ))}
            </div>
          </div>
          <div className="space-y-3">
            {Array(5)
              .fill(0)
              .map((_, i) => (
                <Skeleton key={i} className="h-16 w-full bg-[#1f2037]" />
              ))}
          </div>
        </div>
        <div className="bg-[#0c0d1d] border border-[#1f2037] rounded-lg p-6">
          <div className="flex justify-between mb-4">
            <Skeleton className="h-6 w-40 bg-[#1f2037]" />
            <div className="flex space-x-1">
              {Array(3)
                .fill(0)
                .map((_, i) => (
                  <Skeleton key={i} className="h-7 w-16 bg-[#1f2037]" />
                ))}
            </div>
          </div>
          <Skeleton className="h-[300px] w-full bg-[#1f2037]" />
        </div>
      </div>
    </div>
  )
}

export default function Loading() {
  return <AnalyticsLoading />
}
