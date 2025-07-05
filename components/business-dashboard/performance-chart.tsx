import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function PerformanceChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Metrics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          {/* Chart would go here */}
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-muted-foreground">Chart visualization would be implemented here</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
