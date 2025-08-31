import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users } from "lucide-react"

export default function ClientManagerPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Users className="h-8 w-8 text-orange-500" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Client Manager</h1>
          <p className="text-muted-foreground">
            Comprehensive client relationship management and tracking
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Coming Soon</CardTitle>
            <CardDescription>
              The Client Manager tool is under development. This tool will provide:
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-2 text-sm">
              <li>Client database management</li>
              <li>Contact information tracking</li>
              <li>Client communication history</li>
              <li>Appointment scheduling</li>
              <li>Client segmentation</li>
              <li>Relationship analytics</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 