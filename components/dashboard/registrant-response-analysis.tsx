"use client"
import { Users, CheckCircle, UserCheck, ArrowDownRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface RegistrantResponseAnalysisProps {
  responses?: number
  mailers?: number
  confirmations?: number
  attendees?: number
}

export function RegistrantResponseAnalysis({
  responses = 31,
  mailers = 10000,
  confirmations = 28,
  attendees = 28,
}: RegistrantResponseAnalysisProps) {
  // Calculate rates
  const responseRate = (responses / mailers) * 100
  const confirmationRate = (confirmations / responses) * 100
  const attendanceRate = confirmations > 0 ? (attendees / confirmations) * 100 : 0
  const overallRate = (attendees / mailers) * 100

  // Format rates for display
  const responseRateFormatted = responseRate.toFixed(2)
  const confirmationRateFormatted = confirmationRate.toFixed(1)
  const attendanceRateFormatted = attendanceRate.toFixed(0)
  const overallRateFormatted = overallRate.toFixed(2)

  // Calculate drop-offs
  const responseDropOff = mailers - responses
  const confirmationDropOff = responses - confirmations
  const attendanceDropOff = confirmations - attendees
  const totalDropOff = mailers - attendees

  // Calculate drop-off percentages
  const responseDropOffPercent = (responseDropOff / mailers) * 100
  const confirmationDropOffPercent = (confirmationDropOff / responses) * 100
  const attendanceDropOffPercent = (attendanceDropOff / confirmations) * 100

  return (
    <Card className="bg-gradient-to-br from-m8bs-card to-m8bs-card-alt border-m8bs-border rounded-lg overflow-hidden shadow-md h-full flex flex-col transition-all duration-300 hover:shadow-xl hover:shadow-blue-900/20 hover:border-blue-700/50 group">
      <CardHeader className="bg-m8bs-card-alt border-b border-m8bs-border px-6 py-4 transition-all duration-300 group-hover:bg-gradient-to-r group-hover:from-m8bs-card-alt group-hover:to-blue-900/40">
        <CardTitle className="text-lg font-extrabold text-white flex items-center tracking-tight transition-all duration-300 hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-blue-300 hover:to-purple-400">
          <Users className="mr-2 h-5 w-5 text-blue-400 transition-all duration-300 hover:text-blue-300 hover:rotate-6 hover:scale-110" />
          Registrant Response Analysis
        </CardTitle>
        <p className="text-xs text-slate-400 mt-1 transition-colors duration-300 group-hover:text-slate-300">
          Analysis of response rates from marketing campaigns
        </p>
      </CardHeader>
      <CardContent className="p-6 flex-1 flex flex-col">
        {/* Summary Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-m8bs-card-alt/30 border border-m8bs-border/40 rounded-lg p-4 transition-all duration-300 hover:shadow-md hover:border-blue-700/60 hover:bg-m8bs-card-alt/50 hover:scale-[1.02] hover:-translate-y-0.5 group/item">
            <div className="flex items-center mb-1">
              <Users className="h-4 w-4 text-blue-400 mr-2 transition-all duration-300 group-hover/item:text-blue-300 group-hover/item:rotate-6" />
              <span className="text-xs text-gray-400 transition-colors duration-300 group-hover/item:text-gray-300">
                Mailers
              </span>
            </div>
            <div className="text-lg font-bold text-white transition-colors duration-300 group-hover/item:text-blue-300">
              {mailers.toLocaleString()}
            </div>
          </div>

          <div className="bg-m8bs-card-alt/30 border border-m8bs-border/40 rounded-lg p-4 transition-all duration-300 hover:shadow-md hover:border-blue-700/60 hover:bg-m8bs-card-alt/50 hover:scale-[1.02] hover:-translate-y-0.5 group/item">
            <div className="flex items-center mb-1">
              <Users className="h-4 w-4 text-blue-400 mr-2 transition-all duration-300 group-hover/item:text-blue-300 group-hover/item:rotate-6" />
              <span className="text-xs text-gray-400 transition-colors duration-300 group-hover/item:text-gray-300">
                Responses
              </span>
            </div>
            <div className="text-lg font-bold text-white transition-colors duration-300 group-hover/item:text-blue-300">
              {responses.toLocaleString()}
            </div>
            <div className="text-xs text-blue-400 transition-colors duration-300 group-hover/item:text-blue-300">
              {responseRateFormatted}% rate
            </div>
          </div>

          <div className="bg-m8bs-card-alt/30 border border-m8bs-border/40 rounded-lg p-4 transition-all duration-300 hover:shadow-md hover:border-green-700/60 hover:bg-m8bs-card-alt/50 hover:scale-[1.02] hover:-translate-y-0.5 group/item">
            <div className="flex items-center mb-1">
              <CheckCircle className="h-4 w-4 text-green-400 mr-2 transition-all duration-300 group-hover/item:text-green-300 group-hover/item:rotate-6" />
              <span className="text-xs text-gray-400 transition-colors duration-300 group-hover/item:text-gray-300">
                Confirmations
              </span>
            </div>
            <div className="text-lg font-bold text-white transition-colors duration-300 group-hover/item:text-green-300">
              {confirmations.toLocaleString()}
            </div>
            <div className="text-xs text-green-400 transition-colors duration-300 group-hover/item:text-green-300">
              {confirmationRateFormatted}% rate
            </div>
          </div>

          <div className="bg-m8bs-card-alt/30 border border-m8bs-border/40 rounded-lg p-4 transition-all duration-300 hover:shadow-md hover:border-purple-700/60 hover:bg-m8bs-card-alt/50 hover:scale-[1.02] hover:-translate-y-0.5 group/item">
            <div className="flex items-center mb-1">
              <UserCheck className="h-4 w-4 text-purple-400 mr-2 transition-all duration-300 group-hover/item:text-purple-300 group-hover/item:rotate-6" />
              <span className="text-xs text-gray-400 transition-colors duration-300 group-hover/item:text-gray-300">
                Attendees
              </span>
            </div>
            <div className="text-lg font-bold text-white transition-colors duration-300 group-hover/item:text-purple-300">
              {attendees.toLocaleString()}
            </div>
            <div className="text-xs text-purple-400 transition-colors duration-300 group-hover/item:text-purple-300">
              {attendanceRateFormatted}% rate
            </div>
          </div>
        </div>

        {/* Funnel Visualization */}
        <div className="bg-[#1a1b2e]/50 p-4 rounded-lg border border-m8bs-border/30 mb-6 transition-all duration-300 hover:bg-[#1a1b2e]/70 hover:border-blue-900/30 hover:shadow-inner group/funnel">
          <div className="relative">
            {/* Mailers to Responses */}
            <div className="flex items-center mb-4 group/stage">
              <div className="w-32 text-right pr-3">
                <div className="text-sm font-medium text-white transition-colors duration-300 group-hover/stage:text-blue-300">
                  Mailers
                </div>
                <div className="text-xs text-gray-400 transition-colors duration-300 group-hover/stage:text-gray-300">
                  {mailers.toLocaleString()}
                </div>
              </div>

              <div className="flex-grow">
                <div className="h-8 bg-blue-900/20 rounded-lg relative overflow-hidden transition-all duration-300 group-hover/stage:bg-blue-900/30 group-hover/stage:shadow-inner">
                  <div
                    className="absolute inset-y-0 left-0 bg-blue-500/30 rounded-lg transition-all duration-300 group-hover/stage:bg-blue-500/40 group-hover/stage:shadow-[0_0_8px_rgba(59,130,246,0.3)]"
                    style={{ width: "100%" }}
                  ></div>
                </div>
              </div>

              <div className="w-32 pl-3">
                <div className="text-sm font-medium text-white transition-colors duration-300 group-hover/stage:text-blue-300">
                  100%
                </div>
              </div>
            </div>

            {/* Drop-off indicator */}
            <div className="flex items-center mb-1 pl-32 group/drop">
              <div className="flex items-center text-xs text-red-400 transition-all duration-300 group-hover/drop:text-red-300 group-hover/drop:translate-x-1">
                <ArrowDownRight className="h-3 w-3 mr-1 transition-all duration-300 group-hover/drop:scale-125" />
                <span>-{responseDropOffPercent.toFixed(2)}%</span>
              </div>
            </div>

            {/* Responses to Confirmations */}
            <div className="flex items-center mb-4 group/stage">
              <div className="w-32 text-right pr-3">
                <div className="text-sm font-medium text-white transition-colors duration-300 group-hover/stage:text-blue-300">
                  Responses
                </div>
                <div className="text-xs text-gray-400 transition-colors duration-300 group-hover/stage:text-gray-300">
                  {responses.toLocaleString()}
                </div>
              </div>

              <div className="flex-grow">
                <div className="h-8 bg-blue-900/20 rounded-lg relative overflow-hidden transition-all duration-300 group-hover/stage:bg-blue-900/30 group-hover/stage:shadow-inner">
                  <div
                    className="absolute inset-y-0 left-0 bg-blue-500/30 rounded-lg transition-all duration-300 group-hover/stage:bg-blue-500/40 group-hover/stage:shadow-[0_0_8px_rgba(59,130,246,0.3)]"
                    style={{ width: `${responseRate}%` }}
                  ></div>
                </div>
              </div>

              <div className="w-32 pl-3">
                <div className="text-sm font-medium text-white transition-colors duration-300 group-hover/stage:text-blue-300">
                  {responseRateFormatted}%
                </div>
              </div>
            </div>

            {/* Drop-off indicator */}
            <div className="flex items-center mb-1 pl-32 group/drop">
              <div className="flex items-center text-xs text-red-400 transition-all duration-300 group-hover/drop:text-red-300 group-hover/drop:translate-x-1">
                <ArrowDownRight className="h-3 w-3 mr-1 transition-all duration-300 group-hover/drop:scale-125" />
                <span>-{confirmationDropOffPercent.toFixed(1)}%</span>
              </div>
            </div>

            {/* Confirmations to Attendees */}
            <div className="flex items-center mb-4 group/stage">
              <div className="w-32 text-right pr-3">
                <div className="text-sm font-medium text-white transition-colors duration-300 group-hover/stage:text-green-300">
                  Confirmations
                </div>
                <div className="text-xs text-gray-400 transition-colors duration-300 group-hover/stage:text-gray-300">
                  {confirmations.toLocaleString()}
                </div>
              </div>

              <div className="flex-grow">
                <div className="h-8 bg-green-900/20 rounded-lg relative overflow-hidden transition-all duration-300 group-hover/stage:bg-green-900/30 group-hover/stage:shadow-inner">
                  <div
                    className="absolute inset-y-0 left-0 bg-green-500/30 rounded-lg transition-all duration-300 group-hover/stage:bg-green-500/40 group-hover/stage:shadow-[0_0_8px_rgba(34,197,94,0.3)]"
                    style={{ width: `${confirmationRate}%` }}
                  ></div>
                </div>
              </div>

              <div className="w-32 pl-3">
                <div className="text-sm font-medium text-white transition-colors duration-300 group-hover/stage:text-green-300">
                  {confirmationRateFormatted}%
                </div>
              </div>
            </div>

            {/* Drop-off indicator */}
            <div className="flex items-center mb-1 pl-32 group/drop">
              <div className="flex items-center text-xs text-red-400 transition-all duration-300 group-hover/drop:text-red-300 group-hover/drop:translate-x-1">
                <ArrowDownRight className="h-3 w-3 mr-1 transition-all duration-300 group-hover/drop:scale-125" />
                <span>-{attendanceDropOffPercent.toFixed(0)}%</span>
              </div>
            </div>

            {/* Attendees (Final) */}
            <div className="flex items-center group/stage">
              <div className="w-32 text-right pr-3">
                <div className="text-sm font-medium text-white transition-colors duration-300 group-hover/stage:text-purple-300">
                  Attendees
                </div>
                <div className="text-xs text-gray-400 transition-colors duration-300 group-hover/stage:text-gray-300">
                  {attendees.toLocaleString()}
                </div>
              </div>

              <div className="flex-grow">
                <div className="h-8 bg-purple-900/20 rounded-lg relative overflow-hidden transition-all duration-300 group-hover/stage:bg-purple-900/30 group-hover/stage:shadow-inner">
                  <div
                    className="absolute inset-y-0 left-0 bg-purple-500/30 rounded-lg transition-all duration-300 group-hover/stage:bg-purple-500/40 group-hover/stage:shadow-[0_0_8px_rgba(168,85,247,0.3)]"
                    style={{ width: `${attendanceRate}%` }}
                  ></div>
                </div>
              </div>

              <div className="w-32 pl-3">
                <div className="text-sm font-medium text-white transition-colors duration-300 group-hover/stage:text-purple-300">
                  {attendanceRateFormatted}%
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Overall Conversion & Drop-off Analysis */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-[#1a1b2e]/50 p-4 rounded-lg border border-m8bs-border/30 transition-all duration-300 hover:bg-[#1a1b2e]/70 hover:border-blue-900/30 hover:shadow-inner group/overall">
            <div className="flex items-center mb-3 group/bar">
              <div className="w-16 text-right pr-3">
                <div className="text-xs text-gray-400 transition-colors duration-300 group-hover/bar:text-gray-300">
                  Mailers
                </div>
              </div>

              <div className="flex-grow">
                <div className="h-6 bg-blue-900/20 rounded-lg relative overflow-hidden transition-all duration-300 group-hover/bar:bg-blue-900/30 group-hover/bar:shadow-inner">
                  <div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500/30 to-purple-500/30 rounded-lg transition-all duration-300 group-hover/bar:from-blue-500/40 group-hover/bar:to-purple-500/40 group-hover/bar:shadow-[0_0_8px_rgba(59,130,246,0.3)]"
                    style={{ width: "100%" }}
                  ></div>
                </div>
              </div>

              <div className="w-16 pl-3">
                <div className="text-xs text-white transition-colors duration-300 group-hover/bar:text-blue-300">
                  {mailers.toLocaleString()}
                </div>
              </div>
            </div>

            <div className="flex items-center group/bar">
              <div className="w-16 text-right pr-3">
                <div className="text-xs text-gray-400 transition-colors duration-300 group-hover/bar:text-gray-300">
                  Attendees
                </div>
              </div>

              <div className="flex-grow">
                <div className="h-6 bg-blue-900/20 rounded-lg relative overflow-hidden transition-all duration-300 group-hover/bar:bg-blue-900/30 group-hover/bar:shadow-inner">
                  <div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500/30 to-purple-500/30 rounded-lg transition-all duration-300 group-hover/bar:from-blue-500/40 group-hover/bar:to-purple-500/40 group-hover/bar:shadow-[0_0_8px_rgba(59,130,246,0.3)]"
                    style={{ width: `${overallRate}%` }}
                  ></div>
                </div>
              </div>

              <div className="w-16 pl-3">
                <div className="text-xs text-white transition-colors duration-300 group-hover/bar:text-purple-300">
                  {attendees.toLocaleString()}
                </div>
              </div>
            </div>

            <div className="mt-3 text-center">
              <div className="text-xs text-gray-400 transition-colors duration-300 group-hover/overall:text-gray-300">
                Overall Conversion Rate
              </div>
              <div className="text-2xl font-bold text-white transition-all duration-300 group-hover/overall:text-transparent group-hover/overall:bg-clip-text group-hover/overall:bg-gradient-to-r group-hover/overall:from-blue-300 group-hover/overall:to-purple-300">
                {overallRateFormatted}%
              </div>
            </div>
          </div>

          <div className="bg-[#1a1b2e]/50 p-4 rounded-lg border border-m8bs-border/30 transition-all duration-300 hover:bg-[#1a1b2e]/70 hover:border-red-900/30 hover:shadow-inner group/dropoff">
            <div className="space-y-3">
              <div className="flex items-center justify-between group/item">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-blue-500/50 mr-2 transition-all duration-300 group-hover/item:bg-blue-500/70 group-hover/item:scale-110"></div>
                  <span className="text-xs text-gray-400 transition-colors duration-300 group-hover/item:text-blue-300">
                    Response Drop-off
                  </span>
                </div>
                <div className="text-xs text-white transition-colors duration-300 group-hover/item:text-blue-300">
                  {responseDropOff.toLocaleString()} ({responseDropOffPercent.toFixed(2)}%)
                </div>
              </div>

              <div className="flex items-center justify-between group/item">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-green-500/50 mr-2 transition-all duration-300 group-hover/item:bg-green-500/70 group-hover/item:scale-110"></div>
                  <span className="text-xs text-gray-400 transition-colors duration-300 group-hover/item:text-green-300">
                    Confirmation Drop-off
                  </span>
                </div>
                <div className="text-xs text-white transition-colors duration-300 group-hover/item:text-green-300">
                  {confirmationDropOff.toLocaleString()} ({confirmationDropOffPercent.toFixed(1)}%)
                </div>
              </div>

              <div className="flex items-center justify-between group/item">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-purple-500/50 mr-2 transition-all duration-300 group-hover/item:bg-purple-500/70 group-hover/item:scale-110"></div>
                  <span className="text-xs text-gray-400 transition-colors duration-300 group-hover/item:text-purple-300">
                    Attendance Drop-off
                  </span>
                </div>
                <div className="text-xs text-white transition-colors duration-300 group-hover/item:text-purple-300">
                  {attendanceDropOff.toLocaleString()} ({attendanceDropOffPercent.toFixed(0)}%)
                </div>
              </div>

              <div className="pt-2 mt-2 border-t border-m8bs-border/30 flex items-center justify-between group/item">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-red-500/50 mr-2 transition-all duration-300 group-hover/item:bg-red-500/70 group-hover/item:scale-110"></div>
                  <span className="text-xs font-medium text-white transition-colors duration-300 group-hover/item:text-red-300">
                    Total Drop-off
                  </span>
                </div>
                <div className="text-xs font-medium text-white transition-colors duration-300 group-hover/item:text-red-300">
                  {totalDropOff.toLocaleString()} ({(100 - overallRate).toFixed(2)}%)
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Insights */}
        <div className="bg-[#1a1b2e]/50 p-4 rounded-lg border border-m8bs-border/30 mt-auto transition-all duration-300 hover:bg-[#1a1b2e]/70 hover:border-blue-900/30 hover:shadow-inner group/insights">
          <div className="text-xs text-gray-400 space-y-2 transition-colors duration-300 group-hover/insights:text-gray-300">
            <p>
              {responseRate < 0.5
                ? "Your response rate could be improved with refined targeting."
                : responseRate < 1
                  ? "Your response rate is average. Look for opportunities to improve your messaging and offer."
                  : "Your response rate is above average. Your messaging is resonating with your audience."}
            </p>

            <p>
              {confirmationRate < 70
                ? "Your confirmation rate needs improvement. Enhance your follow-up process to convert more responses."
                : confirmationRate < 85
                  ? "Your confirmation rate is good. Consider additional reminders to further improve this metric."
                  : "Your confirmation rate is excellent. Your follow-up process is working effectively."}
            </p>

            <p>
              {attendanceRate < 80
                ? "Your attendance rate could be improved. Implement additional reminders closer to the event date."
                : attendanceRate < 90
                  ? "Your attendance rate is good. Consider adding more value to your event to increase attendance."
                  : "Your attendance rate is excellent. Your event is delivering on its promised value."}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
