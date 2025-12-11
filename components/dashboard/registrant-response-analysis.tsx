"use client"
import { Users, CheckCircle, UserCheck, ArrowDownRight, TrendingUp, TrendingDown, Target } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface RegistrantResponseAnalysisProps {
  registrants?: number
  marketingAudienceSize?: number
  confirmations?: number
  attendees?: number
  plateLickers?: number
}

export function RegistrantResponseAnalysis({
  registrants = 31,
  marketingAudienceSize = 10000,
  confirmations = 28,
  attendees = 28,
  plateLickers = 0,
}: RegistrantResponseAnalysisProps) {
  // Calculate rates
  const registrantRate = (registrants / marketingAudienceSize) * 100
  const confirmationRate = (confirmations / registrants) * 100
  const attendanceRate = confirmations > 0 ? (attendees / confirmations) * 100 : 0
  const overallRate = (attendees / marketingAudienceSize) * 100

  // Format rates for display
  const registrantRateFormatted = registrantRate.toFixed(2)
  const confirmationRateFormatted = confirmationRate.toFixed(1)
  const attendanceRateFormatted = attendanceRate.toFixed(0)
  const overallRateFormatted = overallRate.toFixed(2)

  // Calculate drop-offs
  const registrantDropOff = marketingAudienceSize - registrants
  const confirmationDropOff = registrants - confirmations
  const attendanceDropOff = confirmations - attendees
  const totalDropOff = marketingAudienceSize - attendees

  // Calculate drop-off percentages
  const registrantDropOffPercent = (registrantDropOff / marketingAudienceSize) * 100
  const confirmationDropOffPercent = (confirmationDropOff / registrants) * 100
  const attendanceDropOffPercent = (attendanceDropOff / confirmations) * 100

  return (
    <Card className="bg-m8bs-card border-m8bs-border rounded-lg overflow-hidden shadow-md h-full flex flex-col transition-all duration-300 hover:shadow-xl group">
      <CardHeader className="bg-m8bs-card border-b border-m8bs-border px-6 py-4">
        <CardTitle className="text-xl font-extrabold text-white flex items-center tracking-tight">
          <Users className="mr-3 h-6 w-6 text-gray-500" />
          Registrant Analysis
        </CardTitle>
        <p className="text-xs text-white/60 font-medium mt-1">
          Analysis of registrant rates from marketing campaigns
        </p>
      </CardHeader>
      <CardContent className="p-6 flex-1 flex flex-col">
        {/* Summary Stats */}
        <div className="bg-black/30 border border-m8bs-border/40 rounded-lg p-4 mb-6 transition-all duration-300 hover:bg-black/50 hover:border-gray-500/60 hover:shadow-md">
          <div className="grid grid-cols-5 gap-4 text-center">
            {/* Icons Row */}
            <div className="flex flex-col items-center">
              <div className="bg-m8bs-card-alt p-2 rounded-lg mb-2">
                <Users className="h-4 w-4 text-m8bs-blue" />
              </div>
              <span className="text-xs font-medium text-white/80 tracking-wide mb-1">Marketing Audience Size</span>
              <span className="text-xl font-extrabold tracking-tight text-white">{marketingAudienceSize.toLocaleString()}</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-cyan-500/20 p-2 rounded-lg mb-2">
                <Users className="h-4 w-4 text-cyan-500" />
              </div>
              <span className="text-xs font-medium text-white/80 tracking-wide mb-1">Registrants (BU)</span>
              <span className="text-xl font-extrabold tracking-tight text-white">{registrants}</span>
              <span className="text-xs text-white/60 font-medium mt-1">{((registrants / marketingAudienceSize) * 100).toFixed(2)}% rate</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-emerald-500/20 p-2 rounded-lg mb-2">
                <Users className="h-4 w-4 text-emerald-500" />
              </div>
              <span className="text-xs font-medium text-white/80 tracking-wide mb-1">Confirmations (BU)</span>
              <span className="text-xl font-extrabold tracking-tight text-white">{confirmations}</span>
              <span className="text-xs text-white/60 font-medium mt-1">{registrants > 0 ? ((confirmations / registrants) * 100).toFixed(1) : 0}% rate</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-purple-500/20 p-2 rounded-lg mb-2">
                <Users className="h-4 w-4 text-purple-500" />
              </div>
              <span className="text-xs font-medium text-white/80 tracking-wide mb-1">Attendees (BU)</span>
              <span className="text-xl font-extrabold tracking-tight text-white">{attendees}</span>
              <span className="text-xs text-white/60 font-medium mt-1">{confirmations > 0 ? ((attendees / confirmations) * 100).toFixed(1) : 0}% rate</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-cyan-500/20 p-2 rounded-lg mb-2">
                <Users className="h-4 w-4 text-cyan-500" />
              </div>
              <span className="text-xs font-medium text-white/80 tracking-wide mb-1">Plate Lickers</span>
              <span className="text-xl font-extrabold tracking-tight text-white">{plateLickers}</span>
              <span className="text-xs text-white/60 font-medium mt-1">{attendees > 0 ? ((plateLickers / attendees) * 100).toFixed(1) : 0}% of attendees</span>
            </div>
          </div>
        </div>

        {/* Conversion Numbers Summary */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-white/80 tracking-wide mb-4">Conversion Numbers</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Marketing Audience to Registrants */}
            <div className="bg-black/30 border border-m8bs-border/40 rounded-lg p-4 transition-all duration-300 hover:bg-black/50 hover:border-cyan-500/60 hover:shadow-md">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="bg-cyan-500/20 p-2 rounded-lg">
                    <Users className="h-4 w-4 text-cyan-500" />
                  </div>
                  <span className="text-sm font-medium text-white/80 tracking-wide">Marketing Audience to Registrants</span>
                </div>
              </div>
              <div className="flex items-baseline justify-between mb-2">
                <div className="text-xl font-extrabold tracking-tight text-white">
                  {registrants.toLocaleString()} / {marketingAudienceSize.toLocaleString()}
                </div>
                <div className="text-sm font-extrabold text-cyan-500">
                  {registrantRateFormatted}%
                </div>
              </div>
              <div className="w-full bg-m8bs-border/30 rounded-full h-2">
                <div
                  className="bg-cyan-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(registrantRate, 100)}%` }}
                />
              </div>
            </div>

            {/* Registrants to Confirmations */}
            <div className="bg-black/30 border border-m8bs-border/40 rounded-lg p-4 transition-all duration-300 hover:bg-black/50 hover:border-emerald-500/60 hover:shadow-md">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="bg-emerald-500/20 p-2 rounded-lg">
                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                  </div>
                  <span className="text-sm font-medium text-white/80 tracking-wide">Registrants to Confirmations</span>
                </div>
              </div>
              <div className="flex items-baseline justify-between mb-2">
                <div className="text-xl font-extrabold tracking-tight text-white">
                  {confirmations.toLocaleString()} / {registrants.toLocaleString()}
                </div>
                <div className="text-sm font-extrabold text-emerald-500">
                  {confirmationRateFormatted}%
                </div>
              </div>
              <div className="w-full bg-m8bs-border/30 rounded-full h-2">
                <div
                  className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(confirmationRate, 100)}%` }}
                />
              </div>
            </div>

            {/* Confirmations to Attendees */}
            <div className="bg-black/30 border border-m8bs-border/40 rounded-lg p-4 transition-all duration-300 hover:bg-black/50 hover:border-purple-500/60 hover:shadow-md">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="bg-purple-500/20 p-2 rounded-lg">
                    <UserCheck className="h-4 w-4 text-purple-500" />
                  </div>
                  <span className="text-sm font-medium text-white/80 tracking-wide">Confirmations to Attendees</span>
                </div>
              </div>
              <div className="flex items-baseline justify-between mb-2">
                <div className="text-xl font-extrabold tracking-tight text-white">
                  {attendees.toLocaleString()} / {confirmations.toLocaleString()}
                </div>
                <div className="text-sm font-extrabold text-purple-500">
                  {attendanceRateFormatted}%
                </div>
              </div>
              <div className="w-full bg-m8bs-border/30 rounded-full h-2">
                <div
                  className="bg-purple-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(attendanceRate, 100)}%` }}
                />
              </div>
            </div>

            {/* Plate Lickers */}
            <div className="bg-black/30 border border-m8bs-border/40 rounded-lg p-4 transition-all duration-300 hover:bg-black/50 hover:border-cyan-500/60 hover:shadow-md">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="bg-cyan-500/20 p-2 rounded-lg">
                    <Users className="h-4 w-4 text-cyan-500" />
                  </div>
                  <span className="text-sm font-medium text-white/80 tracking-wide">Plate Lickers</span>
                </div>
              </div>
              <div className="flex items-baseline justify-between mb-2">
                <div className="text-xl font-extrabold tracking-tight text-white">
                  {plateLickers.toLocaleString()} / {attendees.toLocaleString()}
                </div>
                <div className="text-sm font-extrabold text-cyan-500">
                  {attendees > 0 ? ((plateLickers / attendees) * 100).toFixed(1) : 0}%
                </div>
              </div>
              <div className="w-full bg-m8bs-border/30 rounded-full h-2">
                <div
                  className="bg-cyan-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(attendees > 0 ? (plateLickers / attendees) * 100 : 0, 100)}%` }}
                />
              </div>
            </div>

            {/* Total Drop-off */}
            <div className="bg-black/30 border border-m8bs-border/40 rounded-lg p-4 transition-all duration-300 hover:bg-black/50 hover:border-red-500/60 hover:shadow-md">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="bg-red-500/20 p-2 rounded-lg">
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  </div>
                  <span className="text-sm font-medium text-white/80 tracking-wide">Total Drop-off</span>
                </div>
              </div>
              <div className="flex items-baseline justify-between mb-2">
                <div className="text-xl font-extrabold tracking-tight text-white">
                  {totalDropOff.toLocaleString()} people
                </div>
                <div className="text-sm font-extrabold text-red-500">
                  {(100 - overallRate).toFixed(2)}%
                </div>
              </div>
              <div className="w-full bg-m8bs-border/30 rounded-full h-2">
                <div
                  className="bg-red-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100 - overallRate, 100)}%` }}
                />
              </div>
            </div>

            {/* Overall Conversion */}
            <div className="bg-black/30 border border-m8bs-border/40 rounded-lg p-4 transition-all duration-300 hover:bg-black/50 hover:border-gray-500/60 hover:shadow-md">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="bg-gray-500/20 p-2 rounded-lg">
                    <Target className="h-4 w-4 text-gray-500" />
                  </div>
                  <span className="text-sm font-medium text-white/80 tracking-wide">Overall Conversion</span>
                </div>
              </div>
              <div className="flex items-baseline justify-between mb-2">
                <div className="text-xl font-extrabold tracking-tight text-white">
                  {attendees.toLocaleString()} / {marketingAudienceSize.toLocaleString()}
                </div>
                <div className="text-sm font-extrabold text-gray-500">
                  {overallRateFormatted}%
                </div>
              </div>
              <div className="w-full bg-m8bs-border/30 rounded-full h-2">
                <div
                  className="bg-gray-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(overallRate, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Conversion Funnel */}
        <div className="bg-black/30 border border-m8bs-border/40 rounded-lg p-6 mb-6 transition-all duration-300 hover:bg-black/50 hover:border-purple-500/60 hover:shadow-md">
          <h3 className="text-sm font-medium text-white/80 tracking-wide mb-4">Conversion Funnel</h3>
          <div className="space-y-6">
            {/* Marketing Audience */}
            <div className="flex items-center group/stage">
              <div className="w-40 text-right pr-4">
                <div className="text-sm font-medium text-white/80">
                  Marketing Audience
                </div>
                <div className="text-xs text-white/60 font-medium">
                  {marketingAudienceSize.toLocaleString()} people
                </div>
              </div>

              <div className="flex-grow">
                <div className="h-10 bg-m8bs-border/30 rounded-lg relative overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 bg-gray-500 rounded-lg transition-all duration-300"
                    style={{ width: "100%" }}
                  ></div>
                </div>
              </div>

              <div className="w-20 pl-4 text-right">
                <div className="text-sm font-extrabold text-white">
                  100%
                </div>
              </div>
            </div>

            {/* Registrants */}
            <div className="flex items-center group/stage">
              <div className="w-40 text-right pr-4">
                <div className="text-sm font-medium text-white/80">
                  Registrants
                </div>
                <div className="text-xs text-white/60 font-medium">
                  {registrants.toLocaleString()} people
                </div>
              </div>

              <div className="flex-grow">
                <div className="h-10 bg-m8bs-border/30 rounded-lg relative overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 bg-cyan-500 rounded-lg transition-all duration-300"
                    style={{ width: `${registrantRate}%` }}
                  ></div>
                </div>
              </div>

              <div className="w-20 pl-4 text-right">
                <div className="text-sm font-extrabold text-white">
                  {registrantRateFormatted}%
                </div>
                <div className="text-xs text-white/60 font-medium">
                  -{registrantDropOffPercent.toFixed(1)}%
                </div>
              </div>
            </div>

            {/* Confirmations */}
            <div className="flex items-center group/stage">
              <div className="w-40 text-right pr-4">
                <div className="text-sm font-medium text-white/80">
                  Confirmations
                </div>
                <div className="text-xs text-white/60 font-medium">
                  {confirmations.toLocaleString()} people
                </div>
              </div>

              <div className="flex-grow">
                <div className="h-10 bg-m8bs-border/30 rounded-lg relative overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 bg-emerald-500 rounded-lg transition-all duration-300"
                    style={{ width: `${confirmationRate}%` }}
                  ></div>
                </div>
              </div>

              <div className="w-20 pl-4 text-right">
                <div className="text-sm font-extrabold text-white">
                  {confirmationRateFormatted}%
                </div>
                <div className="text-xs text-white/60 font-medium">
                  -{confirmationDropOffPercent.toFixed(1)}%
                </div>
              </div>
            </div>

            {/* Attendees */}
            <div className="flex items-center group/stage">
              <div className="w-40 text-right pr-4">
                <div className="text-sm font-medium text-white/80">
                  Attendees
                </div>
                <div className="text-xs text-white/60 font-medium">
                  {attendees.toLocaleString()} people
                </div>
              </div>

              <div className="flex-grow">
                <div className="h-10 bg-m8bs-border/30 rounded-lg relative overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 bg-purple-500 rounded-lg transition-all duration-300"
                    style={{ width: `${attendanceRate}%` }}
                  ></div>
                </div>
              </div>

              <div className="w-20 pl-4 text-right">
                <div className="text-sm font-extrabold text-white">
                  {attendanceRateFormatted}%
                </div>
                <div className="text-xs text-white/60 font-medium">
                  -{attendanceDropOffPercent.toFixed(0)}%
                </div>
              </div>
            </div>

            {/* Plate Lickers */}
            <div className="flex items-center group/stage">
              <div className="w-40 text-right pr-4">
                <div className="text-sm font-medium text-white/80">
                  Plate Lickers
                </div>
                <div className="text-xs text-white/60 font-medium">
                  {plateLickers.toLocaleString()} people
                </div>
              </div>
              <div className="flex-grow">
                <div className="h-10 bg-m8bs-border/30 rounded-lg relative overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 bg-cyan-500 rounded-lg transition-all duration-300"
                    style={{ width: `${attendees > 0 ? (plateLickers / attendees) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
              <div className="w-20 pl-4 text-right">
                <div className="text-sm font-extrabold text-white">
                  {attendees > 0 ? ((plateLickers / attendees) * 100).toFixed(1) : 0}%
                </div>
                <div className="text-xs text-white/60 font-medium">
                  -{attendees > 0 ? (100 - (plateLickers / attendees) * 100).toFixed(1) : 0}%
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Overall Conversion & Drop-off Analysis */}
        {/* REMOVE the section with the horizontal bar chart for Marketing Audience Size, Registrants, Confirmations, and Attendees */}

        {/* Insights */}
        <div className="bg-black/30 border border-m8bs-border/40 rounded-lg p-4 mt-auto transition-all duration-300 hover:bg-black/50 hover:border-emerald-500/60 hover:shadow-md">
          <div className="text-xs text-white/60 font-medium space-y-2">
            <p>
              {registrantRate < 0.5
                ? "Your registrant rate could be improved with refined targeting."
                : registrantRate < 1
                  ? "Your registrant rate is average. Look for opportunities to improve your messaging and offer."
                  : "Your registrant rate is above average. Your messaging is resonating with your audience."}
            </p>

            <p>
              {confirmationRate < 70
                ? "Your confirmation rate needs improvement. Enhance your follow-up process to convert more registrants."
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

            {plateLickers / Math.max(1, attendees) > 0.3 && (
              <p className="text-white/80">A high percentage of plate lickers may indicate a need to refine your event targeting or value proposition.</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
