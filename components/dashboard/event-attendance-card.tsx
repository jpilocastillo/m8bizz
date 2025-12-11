"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CircularProgress } from "@/components/dashboard/circular-progress"
import { Users } from "lucide-react"

interface EventAttendanceCardProps {
  registrantResponses: number
  confirmations: number
  attendees: number
  clientsFromEvent: number
  responseRate?: number
}

export function EventAttendanceCard({
  registrantResponses = 0,
  confirmations = 0,
  attendees = 0,
  clientsFromEvent = 0,
  responseRate = 0,
}: EventAttendanceCardProps) {
  // Calculate percentages
  const confirmationRate = registrantResponses > 0 ? (confirmations / registrantResponses) * 100 : 0
  const attendeeRate = confirmations > 0 ? (attendees / confirmations) * 100 : 0
  const clientRate = attendees > 0 ? (clientsFromEvent / attendees) * 100 : 0

  // Format percentages
  const responseRateFormatted = Math.round(responseRate * 100 * 10) / 10
  const confirmationRateFormatted = Math.round(confirmationRate * 10) / 10
  const attendeeRateFormatted = Math.round(attendeeRate * 10) / 10
  const clientRateFormatted = Math.round(clientRate * 10) / 10

  return (
    <Card className="bg-black border-m8bs-border rounded-lg overflow-hidden shadow-md">
      <CardHeader className="bg-black border-b border-m8bs-border px-6 py-4">
        <CardTitle className="text-xl font-extrabold text-white flex items-center tracking-tight">
          <Users className="mr-3 h-6 w-6 text-gray-500" />
          Event Attendance Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="grid grid-cols-1 divide-y divide-m8bs-border">
          {/* Registrant Responses */}
          <div className="p-6 flex items-center justify-between">
            <div>
              <div className="text-white text-sm font-medium mb-1">Registrant Responses (BU)</div>
              <div className="text-white text-4xl font-bold">{registrantResponses}</div>
            </div>
            <div className="flex-shrink-0">
              <CircularProgress value={responseRateFormatted} max={100} size={70} strokeWidth={8} color="gray" glowEffect={true}>
                <span className="text-white text-sm font-bold">{responseRateFormatted}%</span>
              </CircularProgress>
            </div>
          </div>

          {/* Confirmations */}
          <div className="p-6 flex items-center justify-between">
            <div>
              <div className="text-white text-sm font-medium mb-1">Confirmations (BU)</div>
              <div className="text-white text-4xl font-bold">{confirmations}</div>
            </div>
            <div className="flex-shrink-0">
              <CircularProgress value={confirmationRateFormatted} max={100} size={70} strokeWidth={8} color="green" glowEffect={true}>
                <span className="text-white text-sm font-bold">{confirmationRateFormatted}%</span>
              </CircularProgress>
            </div>
          </div>

          {/* Attendees */}
          <div className="p-6 flex items-center justify-between">
            <div>
              <div className="text-white text-sm font-medium mb-1">Attendees (BU)</div>
              <div className="text-white text-4xl font-bold">{attendees}</div>
            </div>
            <div className="flex-shrink-0">
              <CircularProgress value={attendeeRateFormatted} max={100} size={70} strokeWidth={8} color="gray" glowEffect={true}>
                <span className="text-white text-sm font-bold">{attendeeRateFormatted}%</span>
              </CircularProgress>
            </div>
          </div>

          {/* Clients from Event */}
          <div className="p-6 flex items-center justify-between">
            <div>
              <div className="text-white text-sm font-medium mb-1">Clients from Event</div>
              <div className="text-white text-4xl font-bold">{clientsFromEvent}</div>
            </div>
            <div className="flex-shrink-0">
              <CircularProgress value={clientRateFormatted} max={100} size={70} strokeWidth={8} color="purple" glowEffect={true}>
                <span className="text-white text-sm font-bold">{clientRateFormatted}%</span>
              </CircularProgress>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
