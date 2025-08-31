import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp } from "lucide-react"

export default function EightElementsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <TrendingUp className="h-8 w-8 text-purple-500" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Eight Elements Reporting Tool</h1>
          <p className="text-muted-foreground">
            Comprehensive reporting and analysis across eight key business elements
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Coming Soon</CardTitle>
            <CardDescription>
              The Eight Elements Reporting Tool is under development. This tool will provide:
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-2 text-sm">
              <li>Revenue analysis and tracking</li>
              <li>Client acquisition metrics</li>
              <li>Operational efficiency reports</li>
              <li>Market performance analysis</li>
              <li>Risk management reporting</li>
              <li>Strategic planning insights</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 