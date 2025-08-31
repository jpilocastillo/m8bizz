import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Target } from "lucide-react"

export default function AnnuityAnalysisPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Target className="h-8 w-8 text-green-500" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Annuity Analysis Program</h1>
          <p className="text-muted-foreground">
            Comprehensive annuity analysis and comparison tools
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Coming Soon</CardTitle>
            <CardDescription>
              The Annuity Analysis Program is under development. This tool will provide:
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-2 text-sm">
              <li>Annuity product comparisons</li>
              <li>Rate analysis and projections</li>
              <li>Guarantee period calculations</li>
              <li>Surrender charge analysis</li>
              <li>Income stream projections</li>
              <li>Tax implications analysis</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 