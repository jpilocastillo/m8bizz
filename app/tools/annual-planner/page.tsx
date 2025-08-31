import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText } from "lucide-react"

export default function AnnualPlannerPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <FileText className="h-8 w-8 text-indigo-500" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Annual Business Planner</h1>
          <p className="text-muted-foreground">
            Comprehensive annual planning and strategic goal setting
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Coming Soon</CardTitle>
            <CardDescription>
              The Annual Business Planner tool is under development. This tool will provide:
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-2 text-sm">
              <li>Annual goal setting and tracking</li>
              <li>Quarterly milestone planning</li>
              <li>Budget and resource allocation</li>
              <li>Performance target setting</li>
              <li>Strategic initiative planning</li>
              <li>Progress monitoring and reporting</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 