import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Target } from "lucide-react"

export default function GoalTrackerPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Target className="h-8 w-8 text-green-500" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Goal Tracker</h1>
          <p className="text-muted-foreground">
            Track and manage your business goals and objectives
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Coming Soon</CardTitle>
            <CardDescription>
              The Goal Tracker tool is under development. This tool will provide:
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-2 text-sm">
              <li>Goal setting and tracking</li>
              <li>Progress monitoring</li>
              <li>Milestone tracking</li>
              <li>Performance metrics</li>
              <li>Goal visualization</li>
              <li>Automated reminders</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 