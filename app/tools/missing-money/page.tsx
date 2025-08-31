import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users } from "lucide-react"

export default function MissingMoneyPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Users className="h-8 w-8 text-orange-500" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Missing Money Report</h1>
          <p className="text-muted-foreground">
            Identify and track potential revenue opportunities and missed income
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Coming Soon</CardTitle>
            <CardDescription>
              The Missing Money Report tool is under development. This tool will provide:
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-2 text-sm">
              <li>Revenue gap analysis</li>
              <li>Missed opportunity identification</li>
              <li>Client retention analysis</li>
              <li>Upselling opportunities</li>
              <li>Cross-selling potential</li>
              <li>Revenue optimization strategies</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 