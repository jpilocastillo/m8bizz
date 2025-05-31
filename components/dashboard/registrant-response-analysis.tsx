"use client"
import { Users, CheckCircle, UserCheck, ArrowDownRight } from "lucide-react"
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
    <Card className="bg-gradient-to-br from-m8bs-card to-m8bs-card-alt border-m8bs-border rounded-lg overflow-hidden shadow-md h-full flex flex-col transition-all duration-300 hover:shadow-xl hover:shadow-blue-900/20 hover:border-blue-700/50 group">
      <CardHeader className="bg-m8bs-card-alt border-b border-m8bs-border px-6 py-4 transition-all duration-300 group-hover:bg-gradient-to-r group-hover:from-m8bs-card-alt group-hover:to-blue-900/40">
        <CardTitle className="text-lg font-extrabold text-white flex items-center tracking-tight transition-all duration-300 hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-blue-300 hover:to-purple-400">
          <Users className="mr-2 h-5 w-5 text-blue-400 transition-all duration-300 hover:text-blue-300 hover:rotate-6 hover:scale-110" />
          Registrant Analysis
        </CardTitle>
        <p className="text-xs text-slate-400 mt-1 transition-colors duration-300 group-hover:text-slate-300">
          Analysis of registrant rates from marketing campaigns
        </p>
      </CardHeader>
      <CardContent className="p-8 flex-1 flex flex-col">
        {/* Summary Stats */}
        <div className="bg-m8bs-card rounded-xl p-3 grid grid-cols-5 grid-rows-3 gap-y-0 gap-x-2 text-center items-end">
          {/* Icons Row */}
          <Users className="inline h-4 w-4 md:h-5 md:w-5 text-m8bs-blue col-start-1 row-start-1 mx-auto" />
          <Users className="inline h-4 w-4 md:h-5 md:w-5 text-cyan-400 col-start-2 row-start-1 mx-auto" />
          <Users className="inline h-4 w-4 md:h-5 md:w-5 text-emerald-400 col-start-3 row-start-1 mx-auto" />
          <Users className="inline h-4 w-4 md:h-5 md:w-5 text-purple-400 col-start-4 row-start-1 mx-auto" />
          <Users className="inline h-4 w-4 md:h-5 md:w-5 text-cyan-400 col-start-5 row-start-1 mx-auto" />

          {/* Labels Row */}
          <span className="text-[10px] md:text-xs font-semibold text-m8bs-blue col-start-1 row-start-2">Marketing Audience Size</span>
          <span className="text-[10px] md:text-xs font-semibold text-cyan-400 col-start-2 row-start-2">Registrants (BU)</span>
          <span className="text-[10px] md:text-xs font-semibold text-emerald-400 col-start-3 row-start-2">Confirmations (BU)</span>
          <span className="text-[10px] md:text-xs font-semibold text-purple-400 col-start-4 row-start-2">Attendees (BU)</span>
          <span className="text-[10px] md:text-xs font-semibold text-cyan-400 col-start-5 row-start-2">Plate Lickers</span>

          {/* Values Row */}
          <div className="flex flex-col items-center col-start-1 row-start-3">
            <span className="text-xl md:text-2xl font-extrabold text-m8bs-blue leading-tight">{marketingAudienceSize.toLocaleString()}</span>
            <span className="text-[10px] md:text-xs font-semibold text-m8bs-blue mt-0">&nbsp;</span>
          </div>
          <div className="flex flex-col items-center col-start-2 row-start-3">
            <span className="text-xl md:text-2xl font-extrabold text-cyan-400 leading-tight">{registrants}</span>
            <span className="text-[10px] md:text-xs font-semibold text-cyan-400 mt-0">{((registrants / marketingAudienceSize) * 100).toFixed(2)}% rate</span>
          </div>
          <div className="flex flex-col items-center col-start-3 row-start-3">
            <span className="text-xl md:text-2xl font-extrabold text-emerald-400 leading-tight">{confirmations}</span>
            <span className="text-[10px] md:text-xs font-semibold text-emerald-400 mt-0">{registrants > 0 ? ((confirmations / registrants) * 100).toFixed(1) : 0}% rate</span>
          </div>
          <div className="flex flex-col items-center col-start-4 row-start-3">
            <span className="text-xl md:text-2xl font-extrabold text-purple-400 leading-tight">{attendees}</span>
            <span className="text-[10px] md:text-xs font-semibold text-purple-400 mt-0">{confirmations > 0 ? ((attendees / confirmations) * 100).toFixed(1) : 0}% rate</span>
          </div>
          <div className="flex flex-col items-center col-start-5 row-start-3">
            <span className="flex items-end justify-center">
              <span className="text-xl md:text-2xl font-extrabold text-cyan-400 leading-tight">{plateLickers}</span>
              <span className="text-base font-normal text-cyan-400 leading-tight">&nbsp;/ {attendees}</span>
            </span>
            <span className="text-[10px] md:text-xs font-semibold text-cyan-400 mt-0">{attendees > 0 ? ((plateLickers / attendees) * 100).toFixed(1) : 0}% of attendees</span>
          </div>
        </div>

        {/* Conversion Numbers Summary */}
        <div className="bg-[#1a1b2e]/50 p-4 rounded-lg border border-m8bs-border/30 mb-6 transition-all duration-300 hover:bg-[#1a1b2e]/70 hover:border-blue-900/30 hover:shadow-inner group/summary">
          <h3 className="text-sm font-medium text-white mb-4">Conversion Numbers</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center group/item">
                <span className="text-sm text-gray-400 transition-colors duration-300 group-hover/item:text-gray-300">
                  Marketing Audience to Registrants
                </span>
                <div className="text-right">
                  <div className="text-sm font-medium text-white transition-colors duration-300 group-hover/item:text-blue-300">
                    {registrants.toLocaleString()} / {marketingAudienceSize.toLocaleString()}
                  </div>
                  <div className="text-xs text-blue-400">
                    {registrantRateFormatted}% conversion
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center group/item">
                <span className="text-sm text-gray-400 transition-colors duration-300 group-hover/item:text-gray-300">
                  Registrants to Confirmations
                </span>
                <div className="text-right">
                  <div className="text-sm font-medium text-white transition-colors duration-300 group-hover/item:text-green-300">
                    {confirmations.toLocaleString()} / {registrants.toLocaleString()}
                  </div>
                  <div className="text-xs text-green-400">
                    {confirmationRateFormatted}% conversion
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center group/item">
                <span className="text-sm text-gray-400 transition-colors duration-300 group-hover/item:text-gray-300">
                  Confirmations to Attendees
                </span>
                <div className="text-right">
                  <div className="text-sm font-medium text-white transition-colors duration-300 group-hover/item:text-purple-300">
                    {attendees.toLocaleString()} / {confirmations.toLocaleString()}
                  </div>
                  <div className="text-xs text-purple-400">
                    {attendanceRateFormatted}% conversion
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center group/item">
                <span className="text-sm text-gray-400 transition-colors duration-300 group-hover/item:text-gray-300">
                  Plate Lickers
                </span>
                <div className="text-right">
                  <div className="text-sm font-medium text-white transition-colors duration-300 group-hover/item:text-blue-300">
                    {plateLickers.toLocaleString()} / {attendees.toLocaleString()}
                  </div>
                  <div className="text-xs text-blue-400">
                    {attendees > 0 ? ((plateLickers / attendees) * 100).toFixed(1) : 0}% of attendees
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center group/item">
                <span className="text-sm text-gray-400 transition-colors duration-300 group-hover/item:text-gray-300">
                  Total Drop-off
                </span>
                <div className="text-right">
                  <div className="text-sm font-medium text-white transition-colors duration-300 group-hover/item:text-red-300">
                    {totalDropOff.toLocaleString()} people
                  </div>
                  <div className="text-xs text-red-400">
                    {(100 - overallRate).toFixed(2)}% total drop-off
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center group/item">
                <span className="text-sm text-gray-400 transition-colors duration-300 group-hover/item:text-gray-300">
                  Overall Conversion
                </span>
                <div className="text-right">
                  <div className="text-sm font-medium text-white transition-colors duration-300 group-hover/item:text-blue-300">
                    {attendees.toLocaleString()} / {marketingAudienceSize.toLocaleString()}
                  </div>
                  <div className="text-xs text-blue-400">
                    {overallRateFormatted}% overall conversion
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Conversion Funnel */}
        <div className="bg-[#1a1b2e]/50 p-6 rounded-lg border border-m8bs-border/30 mb-6 transition-all duration-300 hover:bg-[#1a1b2e]/70 hover:border-blue-900/30 hover:shadow-inner group/funnel">
          <h3 className="text-sm font-medium text-white mb-4">Conversion Funnel</h3>
          <div className="space-y-6">
            {/* Marketing Audience */}
            <div className="flex items-center group/stage">
              <div className="w-40 text-right pr-4">
                <div className="text-sm font-medium text-white transition-colors duration-300 group-hover/stage:text-blue-300">
                  Marketing Audience
                </div>
                <div className="text-xs text-gray-400 transition-colors duration-300 group-hover/stage:text-gray-300">
                  {marketingAudienceSize.toLocaleString()} people
                </div>
              </div>

              <div className="flex-grow">
                <div className="h-10 bg-blue-900/20 rounded-lg relative overflow-hidden transition-all duration-300 group-hover/stage:bg-blue-900/30 group-hover/stage:shadow-inner">
                  <div
                    className="absolute inset-y-0 left-0 bg-blue-500/30 rounded-lg transition-all duration-300 group-hover/stage:bg-blue-500/40 group-hover/stage:shadow-[0_0_8px_rgba(59,130,246,0.3)]"
                    style={{ width: "100%" }}
                  ></div>
                </div>
              </div>

              <div className="w-20 pl-4 text-right">
                <div className="text-sm font-medium text-white transition-colors duration-300 group-hover/stage:text-blue-300">
                  100%
                </div>
              </div>
            </div>

            {/* Registrants */}
            <div className="flex items-center group/stage">
              <div className="w-40 text-right pr-4">
                <div className="text-sm font-medium text-white transition-colors duration-300 group-hover/stage:text-blue-300">
                  Registrants
                </div>
                <div className="text-xs text-gray-400 transition-colors duration-300 group-hover/stage:text-gray-300">
                  {registrants.toLocaleString()} people
                </div>
              </div>

              <div className="flex-grow">
                <div className="h-10 bg-blue-900/20 rounded-lg relative overflow-hidden transition-all duration-300 group-hover/stage:bg-blue-900/30 group-hover/stage:shadow-inner">
                  <div
                    className="absolute inset-y-0 left-0 bg-blue-500/30 rounded-lg transition-all duration-300 group-hover/stage:bg-blue-500/40 group-hover/stage:shadow-[0_0_8px_rgba(59,130,246,0.3)]"
                    style={{ width: `${registrantRate}%` }}
                  ></div>
                </div>
              </div>

              <div className="w-20 pl-4 text-right">
                <div className="text-sm font-medium text-white transition-colors duration-300 group-hover/stage:text-blue-300">
                  {registrantRateFormatted}%
                </div>
                <div className="text-xs text-red-400">
                  -{registrantDropOffPercent.toFixed(1)}%
                </div>
              </div>
            </div>

            {/* Confirmations */}
            <div className="flex items-center group/stage">
              <div className="w-40 text-right pr-4">
                <div className="text-sm font-medium text-white transition-colors duration-300 group-hover/stage:text-green-300">
                  Confirmations
                </div>
                <div className="text-xs text-gray-400 transition-colors duration-300 group-hover/stage:text-gray-300">
                  {confirmations.toLocaleString()} people
                </div>
              </div>

              <div className="flex-grow">
                <div className="h-10 bg-green-900/20 rounded-lg relative overflow-hidden transition-all duration-300 group-hover/stage:bg-green-900/30 group-hover/stage:shadow-inner">
                  <div
                    className="absolute inset-y-0 left-0 bg-green-500/30 rounded-lg transition-all duration-300 group-hover/stage:bg-green-500/40 group-hover/stage:shadow-[0_0_8px_rgba(34,197,94,0.3)]"
                    style={{ width: `${confirmationRate}%` }}
                  ></div>
                </div>
              </div>

              <div className="w-20 pl-4 text-right">
                <div className="text-sm font-medium text-white transition-colors duration-300 group-hover/stage:text-green-300">
                  {confirmationRateFormatted}%
                </div>
                <div className="text-xs text-red-400">
                  -{confirmationDropOffPercent.toFixed(1)}%
                </div>
              </div>
            </div>

            {/* Attendees */}
            <div className="flex items-center group/stage">
              <div className="w-40 text-right pr-4">
                <div className="text-sm font-medium text-white transition-colors duration-300 group-hover/stage:text-purple-300">
                  Attendees
                </div>
                <div className="text-xs text-gray-400 transition-colors duration-300 group-hover/stage:text-gray-300">
                  {attendees.toLocaleString()} people
                </div>
              </div>

              <div className="flex-grow">
                <div className="h-10 bg-purple-900/20 rounded-lg relative overflow-hidden transition-all duration-300 group-hover/stage:bg-purple-900/30 group-hover/stage:shadow-inner">
                  <div
                    className="absolute inset-y-0 left-0 bg-purple-500/30 rounded-lg transition-all duration-300 group-hover/stage:bg-purple-500/40 group-hover/stage:shadow-[0_0_8px_rgba(168,85,247,0.3)]"
                    style={{ width: `${attendanceRate}%` }}
                  ></div>
                </div>
              </div>

              <div className="w-20 pl-4 text-right">
                <div className="text-sm font-medium text-white transition-colors duration-300 group-hover/stage:text-purple-300">
                  {attendanceRateFormatted}%
                </div>
                <div className="text-xs text-red-400">
                  -{attendanceDropOffPercent.toFixed(0)}%
                </div>
              </div>
            </div>

            {/* Plate Lickers */}
            <div className="flex items-center group/stage">
              <div className="w-40 text-right pr-4">
                <div className="text-sm font-medium text-white transition-colors duration-300 group-hover/stage:text-blue-300">
                  Plate Lickers
                </div>
                <div className="text-xs text-gray-400 transition-colors duration-300 group-hover/stage:text-gray-300">
                  {plateLickers.toLocaleString()} people
                </div>
              </div>
              <div className="flex-grow">
                <div className="h-10 bg-blue-900/20 rounded-lg relative overflow-hidden transition-all duration-300 group-hover/stage:bg-blue-900/30 group-hover/stage:shadow-inner">
                  <div
                    className="absolute inset-y-0 left-0 bg-blue-500/30 rounded-lg transition-all duration-300 group-hover/stage:bg-blue-500/40 group-hover/stage:shadow-[0_0_8px_rgba(59,130,246,0.3)]"
                    style={{ width: `${attendees > 0 ? (plateLickers / attendees) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
              <div className="w-20 pl-4 text-right">
                <div className="text-sm font-medium text-white transition-colors duration-300 group-hover/stage:text-blue-300">
                  {attendees > 0 ? ((plateLickers / attendees) * 100).toFixed(1) : 0}%
                </div>
                <div className="text-xs text-red-400">
                  -{attendees > 0 ? (100 - (plateLickers / attendees) * 100).toFixed(1) : 0}%
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Overall Conversion & Drop-off Analysis */}
        {/* REMOVE the section with the horizontal bar chart for Marketing Audience Size, Registrants, Confirmations, and Attendees */}

        {/* Insights */}
        <div className="bg-[#1a1b2e]/50 p-4 rounded-lg border border-m8bs-border/30 mt-auto transition-all duration-300 hover:bg-[#1a1b2e]/70 hover:border-blue-900/30 hover:shadow-inner group/insights">
          <div className="text-xs text-gray-400 space-y-2 transition-colors duration-300 group-hover/insights:text-gray-300">
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
              <p className="text-blue-400">A high percentage of plate lickers may indicate a need to refine your event targeting or value proposition.</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
