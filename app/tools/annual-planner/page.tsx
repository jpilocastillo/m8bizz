import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText } from "lucide-react"

export default function AnnualPlannerPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="bg-gradient-to-br from-m8bs-blue to-m8bs-blue-dark p-3 rounded-xl">
          <FileText className="h-8 w-8 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Annual Business Planner</h1>
          <p className="text-m8bs-muted mt-1">
            Comprehensive annual planning and strategic goal setting
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        <Card className="bg-m8bs-card border-m8bs-card-alt shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl font-bold text-white">Coming Soon</CardTitle>
            <CardDescription className="text-m8bs-muted">
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