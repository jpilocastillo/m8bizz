import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users } from "lucide-react"

export default function ClientManagerPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="bg-gradient-to-br from-m8bs-blue to-m8bs-blue-dark p-3 rounded-xl">
          <Users className="h-8 w-8 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Client Manager</h1>
          <p className="text-m8bs-muted mt-1">
            Comprehensive client relationship management and tracking
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        <Card className="bg-m8bs-card border-m8bs-card-alt shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl font-bold text-white">Coming Soon</CardTitle>
            <CardDescription className="text-m8bs-muted">
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