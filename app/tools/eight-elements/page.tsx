import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp } from "lucide-react"

export default function EightElementsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="bg-gradient-to-br from-m8bs-blue to-m8bs-blue-dark p-3 rounded-xl">
          <TrendingUp className="h-8 w-8 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Eight Elements Reporting Tool</h1>
          <p className="text-m8bs-muted mt-1">
            Comprehensive reporting and analysis across eight key business elements
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        <Card className="bg-m8bs-card border-m8bs-card-alt shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl font-bold text-white">Coming Soon</CardTitle>
            <CardDescription className="text-m8bs-muted">
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