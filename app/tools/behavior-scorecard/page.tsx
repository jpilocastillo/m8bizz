import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calculator } from "lucide-react"

export default function BehaviorScorecardPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Calculator className="h-8 w-8 text-teal-500" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Business Behavior Scorecard</h1>
          <p className="text-muted-foreground">
            Track and analyze business behaviors and performance indicators
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Coming Soon</CardTitle>
            <CardDescription>
              The Business Behavior Scorecard tool is under development. This tool will provide:
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-2 text-sm">
              <li>Behavioral metrics tracking</li>
              <li>Performance scorecard creation</li>
              <li>KPI measurement and analysis</li>
              <li>Behavioral pattern recognition</li>
              <li>Improvement recommendations</li>
              <li>Progress visualization</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 