"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity } from "lucide-react"

interface ConversionEfficiencyProps {
  registrationToAttendance: number
  attendanceToAppointment: number
  appointmentToClient: number
  overall: number
}

export function ConversionEfficiencyCard({
  registrationToAttendance,
  attendanceToAppointment,
  appointmentToClient,
  overall,
}: ConversionEfficiencyProps) {
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Registration to Attendance */}
          <div className="space-y-2 bg-m8bs-card-alt/30 border border-m8bs-border/40 rounded-lg p-4 transition-all duration-300 hover:shadow-md hover:border-emerald-700/60 hover:bg-m8bs-card-alt/50 hover:scale-[1.02] hover:-translate-y-0.5 group/item">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-white group-hover/item:text-emerald-300 transition-colors duration-300">
                Registration to Attendance
              </span>
              <span className="text-sm font-bold text-emerald-400 group-hover/item:text-emerald-300 transition-colors duration-300">
                {registrationToAttendance.toFixed(1)}%
              </span>
            </div>
            <div className="text-xs text-gray-400 group-hover/item:text-gray-300 transition-colors duration-300">
              {registrationToAttendance < 40
                ? "Needs improvement"
                : registrationToAttendance < 70
                  ? "Performing adequately"
                  : "Excellent performance"}
            </div>
          </div>

          {/* Appointment to Client */}
          <div className="space-y-2 bg-m8bs-card-alt/30 border border-m8bs-border/40 rounded-lg p-4 transition-all duration-300 hover:shadow-md hover:border-red-700/60 hover:bg-m8bs-card-alt/50 hover:scale-[1.02] hover:-translate-y-0.5 group/item">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-white group-hover/item:text-red-300 transition-colors duration-300">
                Appointment to Client
              </span>
              <span className="text-sm font-bold text-red-400 group-hover/item:text-red-300 transition-colors duration-300">
                {appointmentToClient.toFixed(1)}%
              </span>
            </div>
            <div className="text-xs text-gray-400 group-hover/item:text-gray-300 transition-colors duration-300">
              {appointmentToClient < 40
                ? "Needs improvement"
                : appointmentToClient < 70
                  ? "Performing adequately"
                  : "Excellent performance"}
            </div>
          </div>

          {/* Attendance to Appointment */}
          <div className="space-y-2 bg-m8bs-card-alt/30 border border-m8bs-border/40 rounded-lg p-4 transition-all duration-300 hover:shadow-md hover:border-blue-700/60 hover:bg-m8bs-card-alt/50 hover:scale-[1.02] hover:-translate-y-0.5 group/item">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-white group-hover/item:text-blue-300 transition-colors duration-300">
                Attendance to Appointment
              </span>
              <span className="text-sm font-bold text-blue-400 group-hover/item:text-blue-300 transition-colors duration-300">
                {attendanceToAppointment.toFixed(1)}%
              </span>
            </div>
            <div className="text-xs text-gray-400 group-hover/item:text-gray-300 transition-colors duration-300">
              {attendanceToAppointment < 40
                ? "Needs improvement"
                : attendanceToAppointment < 70
                  ? "Performing adequately"
                  : "Excellent performance"}
            </div>
          </div>

          {/* Overall Conversion */}
          <div className="space-y-2 bg-m8bs-card-alt/30 border border-m8bs-border/40 rounded-lg p-4 transition-all duration-300 hover:shadow-md hover:border-purple-700/60 hover:bg-m8bs-card-alt/50 hover:scale-[1.02] hover:-translate-y-0.5 group/item">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-white group-hover/item:text-purple-300 transition-colors duration-300">
                Overall Conversion
              </span>
              <span className="text-sm font-bold text-purple-400 group-hover/item:text-purple-300 transition-colors duration-300">
                {overall.toFixed(1)}%
              </span>
            </div>
            <div className="text-xs text-gray-400 group-hover/item:text-gray-300 transition-colors duration-300">
              {overall < 30 ? "Needs improvement" : overall < 60 ? "Performing adequately" : "Excellent performance"}
            </div>
          </div>
        </div>

        {/* Conversion Funnel Visualization */}
        <div className="bg-[#1a1b2e]/50 p-4 rounded-lg border border-m8bs-border/30 mb-6 transition-all duration-300 hover:bg-[#1a1b2e]/70 hover:border-blue-900/30 hover:shadow-inner group/funnel">
          <h4 className="text-sm font-semibold text-white mb-3 transition-colors duration-300 group-hover/funnel:text-blue-300">
            Conversion Funnel
          </h4>
          <div className="relative h-32">
            <div className="absolute inset-0 flex items-end justify-center">
              <div className="w-full h-full flex">
                {/* Registration Stage - 100% */}
                <div className="w-1/4 relative group/stage">
                  <div
                    className="absolute bottom-0 left-0 right-0 h-24 bg-emerald-500/20 rounded-tl-lg transition-all duration-300 group-hover/stage:bg-emerald-500/30"
                    style={{ height: "100%" }}
                  ></div>
                  <div className="absolute top-0 left-0 right-0 text-center text-xs text-emerald-400 font-bold transition-all duration-300 group-hover/stage:text-emerald-300 group-hover/stage:translate-y-[-2px]">
                    100%
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 text-center text-xs text-emerald-400 transition-all duration-300 group-hover/stage:text-emerald-300">
                    Registration
                  </div>
                </div>

                {/* Attendance Stage */}
                <div className="w-1/4 relative group/stage">
                  <div
                    className="absolute bottom-0 left-0 right-0 bg-emerald-500/40 transition-all duration-300 group-hover/stage:bg-emerald-500/60 group-hover/stage:shadow-[0_0_8px_rgba(16,185,129,0.4)]"
                    style={{ height: `${registrationToAttendance}%` }}
                  ></div>
                  <div className="absolute top-0 left-0 right-0 text-center text-xs text-emerald-400 font-bold transition-all duration-300 group-hover/stage:text-emerald-300 group-hover/stage:translate-y-[-2px]">
                    {registrationToAttendance.toFixed(1)}%
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 text-center text-xs text-emerald-400 transition-all duration-300 group-hover/stage:text-emerald-300">
                    Attendance
                  </div>
                </div>

                {/* Appointment Stage */}
                <div className="w-1/4 relative group/stage">
                  <div
                    className="absolute bottom-0 left-0 right-0 bg-blue-500/40 transition-all duration-300 group-hover/stage:bg-blue-500/60 group-hover/stage:shadow-[0_0_8px_rgba(59,130,246,0.4)]"
                    style={{ height: `${(registrationToAttendance * attendanceToAppointment) / 100}%` }}
                  ></div>
                  <div className="absolute top-0 left-0 right-0 text-center text-xs text-blue-400 font-bold transition-all duration-300 group-hover/stage:text-blue-300 group-hover/stage:translate-y-[-2px]">
                    {((registrationToAttendance * attendanceToAppointment) / 100).toFixed(1)}%
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 text-center text-xs text-blue-400 transition-all duration-300 group-hover/stage:text-blue-300">
                    Appointment
                  </div>
                </div>

                {/* Client Stage */}
                <div className="w-1/4 relative group/stage">
                  <div
                    className="absolute bottom-0 left-0 right-0 bg-red-500/40 rounded-tr-lg transition-all duration-300 group-hover/stage:bg-red-500/60 group-hover/stage:shadow-[0_0_8px_rgba(239,68,68,0.4)]"
                    style={{ height: `${overall}%` }}
                  ></div>
                  <div className="absolute top-0 left-0 right-0 text-center text-xs text-red-400 font-bold transition-all duration-300 group-hover/stage:text-red-300 group-hover/stage:translate-y-[-2px]">
                    {overall.toFixed(1)}%
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 text-center text-xs text-red-400 transition-all duration-300 group-hover/stage:text-red-300">
                    Client
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Overall Circular Indicator */}
        <div className="flex justify-between items-center mt-auto">
          <div className="relative flex items-center justify-center group/circle">
            <div className="absolute inset-0 bg-[#1a1b2e]/50 rounded-full transition-all duration-300 group-hover/circle:bg-[#1a1b2e]/70"></div>
            <svg className="w-32 h-32 relative z-10" viewBox="0 0 100 100">
              <defs>
                <linearGradient id="circleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
              <circle cx="50" cy="50" r="40" fill="none" stroke="#1f2037" strokeWidth="10" />
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="url(#circleGradient)"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={`${overall * 2.51} 251.2`}
                strokeDashoffset="0"
                transform="rotate(-90 50 50)"
                className="transition-all duration-500 group-hover/circle:filter group-hover/circle:drop-shadow-[0_0_3px_rgba(139,92,246,0.5)]"
              >
                <animate
                  attributeName="stroke-dasharray"
                  from="0 251.2"
                  to={`${overall * 2.51} 251.2`}
                  dur="1.5s"
                  fill="freeze"
                  calcMode="spline"
                  keySplines="0.42 0 0.58 1"
                />
              </circle>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center flex-col">
              <div className="text-center bg-[#1a1b2e]/80 p-3 rounded-full backdrop-blur-sm transition-all duration-300 group-hover/circle:bg-[#1a1b2e]/90 group-hover/circle:scale-105">
                <div className="text-xs text-gray-400 mb-1 transition-colors duration-300 group-hover/circle:text-gray-300">
                  Overall
                </div>
                <div className="text-2xl font-bold text-white transition-all duration-300 group-hover/circle:text-transparent group-hover/circle:bg-clip-text group-hover/circle:bg-gradient-to-r group-hover/circle:from-blue-300 group-hover/circle:to-purple-300">
                  {overall.toFixed(1)}%
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4 flex-1 ml-6">
            <div className="space-y-2 group/insights">
              <h4 className="text-sm font-semibold text-white transition-colors duration-300 group-hover/insights:text-blue-300">
                Conversion Insights
              </h4>
              <p className="text-xs text-gray-400 transition-colors duration-300 group-hover/insights:text-gray-300">
                {overall < 30
                  ? "Your conversion funnel needs attention. Focus on improving each stage to increase overall performance."
                  : overall < 60
                    ? "Your conversion funnel is performing adequately. Look for opportunities to optimize weaker stages."
                    : "Excellent conversion performance! Continue monitoring to maintain these strong results."}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2">
              <div className="flex items-center justify-between group/rate transition-all duration-300 hover:bg-m8bs-card-alt/30 hover:rounded-md hover:px-2">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 transition-all duration-300 group-hover/rate:scale-125 group-hover/rate:shadow-[0_0_8px_rgba(16,185,129,0.6)]"></div>
                  <span className="text-xs text-gray-400 transition-colors duration-300 group-hover/rate:text-emerald-300">
                    Registration → Attendance
                  </span>
                </div>
                <span className="text-xs font-medium text-emerald-400 transition-colors duration-300 group-hover/rate:text-emerald-300">
                  {registrationToAttendance.toFixed(1)}%
                </span>
              </div>
              <div className="flex items-center justify-between group/rate transition-all duration-300 hover:bg-m8bs-card-alt/30 hover:rounded-md hover:px-2">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500 transition-all duration-300 group-hover/rate:scale-125 group-hover/rate:shadow-[0_0_8px_rgba(59,130,246,0.6)]"></div>
                  <span className="text-xs text-gray-400 transition-colors duration-300 group-hover/rate:text-blue-300">
                    Attendance → Appointment
                  </span>
                </div>
                <span className="text-xs font-medium text-blue-400 transition-colors duration-300 group-hover/rate:text-blue-300">
                  {attendanceToAppointment.toFixed(1)}%
                </span>
              </div>
              <div className="flex items-center justify-between group/rate transition-all duration-300 hover:bg-m8bs-card-alt/30 hover:rounded-md hover:px-2">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-500 transition-all duration-300 group-hover/rate:scale-125 group-hover/rate:shadow-[0_0_8px_rgba(239,68,68,0.6)]"></div>
                  <span className="text-xs text-gray-400 transition-colors duration-300 group-hover/rate:text-red-300">
                    Appointment → Client
                  </span>
                </div>
                <span className="text-xs font-medium text-red-400 transition-colors duration-300 group-hover/rate:text-red-300">
                  {appointmentToClient.toFixed(1)}%
                </span>
              </div>
            </div>

            <div className="bg-[#1a1b2e]/50 p-3 rounded-lg border border-m8bs-border/30 mt-2 transition-all duration-300 hover:bg-[#1a1b2e]/70 hover:border-yellow-900/30 hover:shadow-inner group/focus">
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium text-white transition-colors duration-300 group-hover/focus:text-yellow-300">
                  Recommended Focus:
                </span>
                <span className="text-xs font-bold text-yellow-400 transition-all duration-300 group-hover/focus:text-yellow-300 group-hover/focus:scale-105">
                  {registrationToAttendance <= Math.min(attendanceToAppointment, appointmentToClient)
                    ? "Registration → Attendance"
                    : attendanceToAppointment <= Math.min(registrationToAttendance, appointmentToClient)
                      ? "Attendance → Appointment"
                      : "Appointment → Client"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
