"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, TrendingUp, TrendingDown } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts"

interface ConversionEfficiencyProps {
  registrationToConfirmation: number
  confirmationToAttendance: number
  attendanceToAppointments: number
  attendanceToClient: number
  overall: number
  registrants?: number
  confirmations?: number
  attendees?: number
  appointmentsBooked?: number
  clients?: number
}

export function ConversionEfficiencyCard({
  registrationToConfirmation,
  confirmationToAttendance,
  attendanceToAppointments,
  attendanceToClient,
  overall,
  registrants = 31,
  confirmations = 28,
  attendees = 28,
  appointmentsBooked = 25,
  clients = 25,
}: ConversionEfficiencyProps) {
  const chartData = [
    {
      name: "Registration",
      value: 100,
      actual: registrants,
      color: "#10B981",
    },
    {
      name: "Confirmation",
      value: registrationToConfirmation,
      actual: confirmations,
      color: "#3B82F6",
    },
    {
      name: "Attendance",
      value: confirmationToAttendance,
      actual: attendees,
      color: "#8B5CF6",
    },
    {
      name: "Appointments",
      value: attendanceToAppointments,
      actual: appointmentsBooked,
      color: "#F59E0B",
    },
    {
      name: "Client",
      value: attendanceToClient,
      actual: clients,
      color: "#EF4444",
    },
  ]

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-[#1a1b2e] p-3 rounded-lg border border-m8bs-border shadow-lg">
          <p className="text-sm font-medium text-white">{data.name}</p>
          <p className="text-xs text-gray-400">
            {data.actual} people ({data.value.toFixed(1)}%)
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <Card className="bg-gradient-to-br from-m8bs-card to-m8bs-card-alt border-m8bs-border rounded-lg overflow-hidden shadow-md h-full flex flex-col transition-all duration-300 hover:shadow-xl hover:shadow-blue-900/20 hover:border-blue-700/50 group">
      <CardHeader className="bg-m8bs-card-alt border-b border-m8bs-border px-6 py-4 transition-all duration-300 group-hover:bg-gradient-to-r group-hover:from-m8bs-card-alt group-hover:to-blue-900/40">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-extrabold text-white tracking-tight transition-all duration-300 hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-blue-300 hover:to-emerald-400">
            Conversion Efficiency
          </CardTitle>
          <div className="bg-emerald-900/20 p-2 rounded-lg transition-all duration-300 hover:bg-emerald-900/30 hover:rotate-6 hover:scale-110">
            <Activity className="h-5 w-5 text-emerald-400 transition-all duration-300 hover:text-emerald-300" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 flex-1 flex flex-col justify-between">
        {/* Overall Conversion Summary */}
        <div className="bg-[#1a1b2e]/50 p-4 rounded-lg border border-m8bs-border/30 mb-6 transition-all duration-300 hover:bg-[#1a1b2e]/70 hover:border-blue-900/30 hover:shadow-inner">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-white">Overall Conversion</h3>
            <div className="text-right">
              <div className="text-lg font-bold text-white">
                {overall.toFixed(1)}%
              </div>
              <div className="text-xs text-gray-400">
                {clients.toLocaleString()} of {registrants.toLocaleString()} registrants
              </div>
            </div>
          </div>
          <div className="w-full bg-m8bs-border/30 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${overall}%` }}
            />
          </div>
        </div>

        {/* Conversion Chart */}
        <div className="bg-[#1a1b2e]/50 p-4 rounded-lg border border-m8bs-border/30 mb-6 transition-all duration-300 hover:bg-[#1a1b2e]/70 hover:border-blue-900/30 hover:shadow-inner">
          <h3 className="text-sm font-medium text-white mb-4">Conversion Flow</h3>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                <XAxis
                  dataKey="name"
                  stroke="#6B7280"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#6B7280"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="value"
                  radius={[4, 4, 0, 0]}
                  background={{ fill: "#1F2937" }}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} opacity={0.8} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Conversion Stages */}
        <div className="grid grid-cols-1 gap-4 mb-6">
          {/* Registration to Confirmation */}
          <div className="bg-m8bs-card-alt/30 border border-m8bs-border/40 rounded-lg p-4 transition-all duration-300 hover:shadow-md hover:border-emerald-700/60 hover:bg-m8bs-card-alt/50">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-white">Registration to Confirmation</span>
              <span className="text-sm font-bold text-emerald-400">{registrationToConfirmation.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between items-center text-xs text-gray-400 mb-2">
              <span>{confirmations.toLocaleString()} confirmed</span>
              <span>of {registrants.toLocaleString()} registrants</span>
            </div>
            <div className="w-full bg-m8bs-border/30 rounded-full h-1.5">
              <div
                className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${registrationToConfirmation}%` }}
              />
            </div>
          </div>

          {/* Confirmation to Attendance */}
          <div className="bg-m8bs-card-alt/30 border border-m8bs-border/40 rounded-lg p-4 transition-all duration-300 hover:shadow-md hover:border-blue-700/60 hover:bg-m8bs-card-alt/50">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-white">Confirmation to Attendance</span>
              <span className="text-sm font-bold text-blue-400">{confirmationToAttendance.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between items-center text-xs text-gray-400 mb-2">
              <span>{attendees.toLocaleString()} attended</span>
              <span>of {confirmations.toLocaleString()} confirmed</span>
            </div>
            <div className="w-full bg-m8bs-border/30 rounded-full h-1.5">
              <div
                className="bg-blue-500 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${confirmationToAttendance}%` }}
              />
            </div>
          </div>

          {/* Attendance to Appointments */}
          <div className="bg-m8bs-card-alt/30 border border-m8bs-border/40 rounded-lg p-4 transition-all duration-300 hover:shadow-md hover:border-amber-700/60 hover:bg-m8bs-card-alt/50">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-white">Attendance to Appointments</span>
              <span className="text-sm font-bold text-amber-400">{attendanceToAppointments.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between items-center text-xs text-gray-400 mb-2">
              <span>{appointmentsBooked.toLocaleString()} appointments booked</span>
              <span>of {attendees.toLocaleString()} attended</span>
            </div>
            <div className="w-full bg-m8bs-border/30 rounded-full h-1.5">
              <div
                className="bg-amber-500 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${attendanceToAppointments}%` }}
              />
            </div>
          </div>

          {/* Attendance to Client */}
          <div className="bg-m8bs-card-alt/30 border border-m8bs-border/40 rounded-lg p-4 transition-all duration-300 hover:shadow-md hover:border-red-700/60 hover:bg-m8bs-card-alt/50">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-white">Attendance to Client</span>
              <span className="text-sm font-bold text-red-400">{attendanceToClient.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between items-center text-xs text-gray-400 mb-2">
              <span>{clients.toLocaleString()} converted</span>
              <span>of {attendees.toLocaleString()} attended</span>
            </div>
            <div className="w-full bg-m8bs-border/30 rounded-full h-1.5">
              <div
                className="bg-red-500 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${attendanceToClient}%` }}
              />
            </div>
          </div>
        </div>

        {/* Key Insights */}
        <div className="bg-[#1a1b2e]/50 p-4 rounded-lg border border-m8bs-border/30">
          <h4 className="text-sm font-semibold text-white mb-3">Key Insights</h4>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5" />
              <div>
                <p className="text-sm text-white">
                  {registrationToConfirmation < 40
                    ? "Registration to confirmation rate needs improvement"
                    : registrationToConfirmation < 70
                      ? "Registration to confirmation rate is performing well"
                      : "Excellent registration to confirmation rate"}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {confirmations.toLocaleString()} out of {registrants.toLocaleString()} registrants confirmed
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5" />
              <div>
                <p className="text-sm text-white">
                  {confirmationToAttendance < 40
                    ? "Attendance rate needs attention"
                    : confirmationToAttendance < 70
                      ? "Attendance rate is stable"
                      : "Strong attendance rate"}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {attendees.toLocaleString()} out of {confirmations.toLocaleString()} confirmed attendees showed up
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5" />
              <div>
                <p className="text-sm text-white">
                  {attendanceToAppointments < 40
                    ? "Appointment booking rate needs improvement"
                    : attendanceToAppointments < 70
                      ? "Appointment booking rate is performing well"
                      : "Excellent appointment booking rate"}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {appointmentsBooked.toLocaleString()} out of {attendees.toLocaleString()} attendees booked appointments
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5" />
              <div>
                <p className="text-sm text-white">
                  {attendanceToClient < 40
                    ? "Client conversion needs focus"
                    : attendanceToClient < 70
                      ? "Client conversion is progressing"
                      : "Strong client conversion"}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {clients.toLocaleString()} out of {attendees.toLocaleString()} attendees became clients
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
