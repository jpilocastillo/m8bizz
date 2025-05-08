"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CircularProgress } from "@/components/dashboard/circular-progress"
import { Users } from "lucide-react"

interface EventAttendanceCardProps {
  registrantResponses: number
  confirmations: number
  attendees: number
  responseRate?: number
}

export function EventAttendanceCard({
  registrantResponses = 0,
  confirmations = 0,
  attendees = 0,
  responseRate = 0,
}: EventAttendanceCardProps) {
  // Calculate percentages
  const confirmationRate = registrantResponses > 0 ? (confirmations / registrantResponses) * 100 : 0
  const attendeeRate = confirmations > 0 ? (attendees / confirmations) * 100 : 0

  // Format percentages
  const responseRateFormatted = Math.round(responseRate * 100 * 10) / 10
  const confirmationRateFormatted = Math.round(confirmationRate * 10) / 10
  const attendeeRateFormatted = Math.round(attendeeRate * 10) / 10

  return (
    <Card className="bg-gradient-to-br from-m8bs-card to-m8bs-card-alt border-m8bs-border rounded-lg overflow-hidden shadow-md">
      <CardHeader className="bg-m8bs-card-alt border-b border-m8bs-border px-6 py-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-extrabold text-white tracking-tight">Event Attendance Breakdown</CardTitle>
          <div className="bg-blue-500/20 p-2 rounded-lg">
            <Users className="h-5 w-5 text-blue-400" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="grid grid-cols-1 divide-y divide-m8bs-border">
          {/* Registrant Responses */}
          <div className="p-6 flex items-center justify-between">
            <div>
              <div className="text-white text-sm font-medium mb-1">Registrant Responses</div>
              <div className="text-white text-4xl font-bold">{registrantResponses}</div>
            </div>
            <div className="flex-shrink-0">
              <CircularProgress value={90.3} max={100} size={70} strokeWidth={8} color="blue" glowEffect={true}>
                <span className="text-white text-sm font-bold">90.3%</span>
              </CircularProgress>
            </div>
          </div>

          {/* Confirmations */}
          <div className="p-6 flex items-center justify-between">
            <div>
              <div className="text-white text-sm font-medium mb-1">Confirmations (B/U)</div>
              <div className="text-white text-4xl font-bold">{confirmations}</div>
            </div>
            <div className="flex-shrink-0">
              <CircularProgress value={100} max={100} size={70} strokeWidth={8} color="green" glowEffect={true}>
                <span className="text-white text-sm font-bold">100%</span>
              </CircularProgress>
            </div>
          </div>

          {/* Attendees */}
          <div className="p-6 flex items-center justify-between">
            <div>
              <div className="text-white text-sm font-medium mb-1">Attendees (B/U)</div>
              <div className="text-white text-4xl font-bold">{attendees}</div>
            </div>
            <div className="flex-shrink-0">
              <CircularProgress value={100} max={100} size={70} strokeWidth={8} color="blue" glowEffect={true}>
                <span className="text-white text-sm font-bold">100%</span>
              </CircularProgress>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
