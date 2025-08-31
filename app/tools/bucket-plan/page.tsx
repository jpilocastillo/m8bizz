import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart } from "lucide-react"

export default function BucketPlanPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <PieChart className="h-8 w-8 text-blue-500" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bucket Plan</h1>
          <p className="text-muted-foreground">
            Strategic bucket planning and asset allocation tools
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Coming Soon</CardTitle>
            <CardDescription>
              The Bucket Plan tool is under development. This tool will provide:
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-2 text-sm">
              <li>Asset allocation strategies</li>
              <li>Bucket planning methodologies</li>
              <li>Risk management tools</li>
              <li>Portfolio optimization</li>
              <li>Retirement income planning</li>
              <li>Tax-efficient distribution strategies</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 