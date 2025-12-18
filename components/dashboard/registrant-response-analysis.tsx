"use client"
import { Users } from "lucide-react"
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

  // Helper function to format percentages with commas when needed
  const formatPercentage = (value: number, decimals: number = 2): string => {
    const formatted = value.toFixed(decimals)
    // If the number is 1000 or greater, add commas
    const parts = formatted.split('.')
    const integerPart = parseInt(parts[0])
    if (integerPart >= 1000) {
      parts[0] = integerPart.toLocaleString()
    }
    return parts.join('.')
  }

  // Format rates for display
  const registrantRateFormatted = formatPercentage(registrantRate, 2)
  const confirmationRateFormatted = formatPercentage(confirmationRate, 1)
  const attendanceRateFormatted = formatPercentage(attendanceRate, 0)
  const overallRateFormatted = formatPercentage(overallRate, 2)

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
      <CardHeader className="bg-m8bs-card border-b border-m8bs-border px-5 py-3">
        <CardTitle className="text-lg font-extrabold text-white flex items-center tracking-tight">
          <Users className="mr-2 h-5 w-5 text-gray-500" />
          Registrant Analysis
        </CardTitle>
        <p className="text-xs text-white/60 font-medium mt-1">
          Analysis of registrant rates from marketing campaigns
        </p>
      </CardHeader>
      <CardContent className="p-4 md:p-5 flex-1 flex flex-col">
        {/* Summary Stats */}
        <div className="bg-black/30 border border-m8bs-border/40 rounded-lg p-4 mb-4">
          <div className="grid grid-cols-5 gap-3 md:gap-4 text-center">
            <div className="flex flex-col items-center">
              <div className="mb-2">
                <div className="text-[10px] font-semibold text-white/70 tracking-wide uppercase mb-1">Marketing Audience</div>
                <div className="text-lg md:text-xl font-extrabold text-white tabular-nums leading-none">{marketingAudienceSize.toLocaleString()}</div>
              </div>
            </div>
            <div className="flex flex-col items-center border-l border-m8bs-border/30 pl-3 md:pl-4">
              <div className="mb-2">
                <div className="text-[10px] font-semibold text-cyan-400 tracking-wide uppercase mb-1">Registrants</div>
                <div className="text-lg md:text-xl font-extrabold text-white tabular-nums leading-none">{registrants.toLocaleString()}</div>
                <div className="text-[10px] text-cyan-400/80 font-medium mt-1 tabular-nums">{formatPercentage((registrants / marketingAudienceSize) * 100, 2)}%</div>
              </div>
            </div>
            <div className="flex flex-col items-center border-l border-m8bs-border/30 pl-3 md:pl-4">
              <div className="mb-2">
                <div className="text-[10px] font-semibold text-emerald-400 tracking-wide uppercase mb-1">Confirmations</div>
                <div className="text-lg md:text-xl font-extrabold text-white tabular-nums leading-none">{confirmations.toLocaleString()}</div>
                <div className="text-[10px] text-emerald-400/80 font-medium mt-1 tabular-nums">{registrants > 0 ? formatPercentage((confirmations / registrants) * 100, 1) : '0'}%</div>
              </div>
            </div>
            <div className="flex flex-col items-center border-l border-m8bs-border/30 pl-3 md:pl-4">
              <div className="mb-2">
                <div className="text-[10px] font-semibold text-purple-400 tracking-wide uppercase mb-1">Attendees</div>
                <div className="text-lg md:text-xl font-extrabold text-white tabular-nums leading-none">{attendees.toLocaleString()}</div>
                <div className="text-[10px] text-purple-400/80 font-medium mt-1 tabular-nums">{confirmations > 0 ? formatPercentage((attendees / confirmations) * 100, 1) : '0'}%</div>
              </div>
            </div>
            <div className="flex flex-col items-center border-l border-m8bs-border/30 pl-3 md:pl-4">
              <div className="mb-2">
                <div className="text-[10px] font-semibold text-cyan-400 tracking-wide uppercase mb-1">Plate Lickers</div>
                <div className="text-lg md:text-xl font-extrabold text-white tabular-nums leading-none">{plateLickers.toLocaleString()}</div>
                <div className="text-[10px] text-cyan-400/80 font-medium mt-1 tabular-nums">{registrants > 0 ? formatPercentage((plateLickers / registrants) * 100, 1) : '0'}%</div>
              </div>
            </div>
          </div>
        </div>

        {/* Conversion Numbers Summary */}
        <div className="mb-4">
          <h3 className="text-xs font-semibold text-white/90 tracking-wide mb-3 uppercase">Conversion Metrics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {/* Marketing Audience to Registrants */}
            <div className="bg-black/30 border border-cyan-500/30 rounded-lg p-3 transition-all duration-300 hover:bg-black/50 hover:border-cyan-500/60">
              <div className="mb-2">
                <span className="text-[10px] font-semibold text-cyan-400 tracking-wide uppercase">Audience → Registrants</span>
              </div>
              <div className="flex items-baseline justify-between mb-2">
                <div className="text-sm font-extrabold tracking-tight text-white tabular-nums">
                  {registrants.toLocaleString()} / {marketingAudienceSize.toLocaleString()}
                </div>
                <div className="text-sm font-extrabold text-cyan-400 tabular-nums">
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
            <div className="bg-black/30 border border-emerald-500/30 rounded-lg p-3 transition-all duration-300 hover:bg-black/50 hover:border-emerald-500/60">
              <div className="mb-2">
                <span className="text-[10px] font-semibold text-emerald-400 tracking-wide uppercase">Registrants → Confirmations</span>
              </div>
              <div className="flex items-baseline justify-between mb-2">
                <div className="text-sm font-extrabold tracking-tight text-white tabular-nums">
                  {confirmations.toLocaleString()} / {registrants.toLocaleString()}
                </div>
                <div className="text-sm font-extrabold text-emerald-400 tabular-nums">
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
            <div className="bg-black/30 border border-purple-500/30 rounded-lg p-3 transition-all duration-300 hover:bg-black/50 hover:border-purple-500/60">
              <div className="mb-2">
                <span className="text-[10px] font-semibold text-purple-400 tracking-wide uppercase">Confirmations → Attendees</span>
              </div>
              <div className="flex items-baseline justify-between mb-2">
                <div className="text-sm font-extrabold tracking-tight text-white tabular-nums">
                  {attendees.toLocaleString()} / {confirmations.toLocaleString()}
                </div>
                <div className="text-sm font-extrabold text-purple-400 tabular-nums">
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
            <div className="bg-black/30 border border-cyan-500/30 rounded-lg p-3 transition-all duration-300 hover:bg-black/50 hover:border-cyan-500/60">
              <div className="mb-2">
                <span className="text-[10px] font-semibold text-cyan-400 tracking-wide uppercase">Plate Lickers</span>
              </div>
              <div className="flex items-baseline justify-between mb-2">
                <div className="text-sm font-extrabold tracking-tight text-white tabular-nums">
                  {plateLickers.toLocaleString()} / {registrants.toLocaleString()}
                </div>
                <div className="text-sm font-extrabold text-cyan-400 tabular-nums">
                  {registrants > 0 ? formatPercentage((plateLickers / registrants) * 100, 1) : '0'}%
                </div>
              </div>
              <div className="w-full bg-m8bs-border/30 rounded-full h-2">
                <div
                  className="bg-cyan-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(registrants > 0 ? (plateLickers / registrants) * 100 : 0, 100)}%` }}
                />
              </div>
            </div>

            {/* Total Drop-off */}
            <div className="bg-black/30 border border-red-500/30 rounded-lg p-3 transition-all duration-300 hover:bg-black/50 hover:border-red-500/60">
              <div className="mb-2">
                <span className="text-[10px] font-semibold text-red-400 tracking-wide uppercase">Total Drop-off</span>
              </div>
              <div className="flex items-baseline justify-between mb-2">
                <div className="text-sm font-extrabold tracking-tight text-white tabular-nums">
                  {totalDropOff.toLocaleString()} people
                </div>
                <div className="text-sm font-extrabold text-red-400 tabular-nums">
                  {formatPercentage(100 - overallRate, 2)}%
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
            <div className="bg-black/30 border border-gray-500/30 rounded-lg p-3 transition-all duration-300 hover:bg-black/50 hover:border-gray-500/60">
              <div className="mb-2">
                <span className="text-[10px] font-semibold text-gray-400 tracking-wide uppercase">Overall Conversion</span>
              </div>
              <div className="flex items-baseline justify-between mb-2">
                <div className="text-sm font-extrabold tracking-tight text-white tabular-nums">
                  {attendees.toLocaleString()} / {marketingAudienceSize.toLocaleString()}
                </div>
                <div className="text-sm font-extrabold text-gray-400 tabular-nums">
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
        <div className="bg-black/30 border border-m8bs-border/40 rounded-lg p-4 mb-4">
          <h3 className="text-xs font-semibold text-white/90 tracking-wide mb-3 uppercase">Conversion Funnel</h3>
          <div className="space-y-3">
            {/* Marketing Audience */}
            <div className="flex items-center group/stage">
              <div className="w-32 text-right pr-3">
                <div className="text-xs font-medium text-white/80">
                  Marketing Audience
                </div>
                <div className="text-[10px] text-white/60 font-medium tabular-nums">
                  {marketingAudienceSize.toLocaleString()} people
                </div>
              </div>

              <div className="flex-grow">
                <div className="h-8 bg-m8bs-border/30 rounded-lg relative overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 bg-gray-500 rounded-lg transition-all duration-300"
                    style={{ width: "100%" }}
                  ></div>
                </div>
              </div>

              <div className="w-16 pl-3 text-right">
                <div className="text-xs font-extrabold text-white tabular-nums">
                  100%
                </div>
              </div>
            </div>

            {/* Registrants */}
            <div className="flex items-center group/stage">
              <div className="w-32 text-right pr-3">
                <div className="text-xs font-medium text-white/80">
                  Registrants
                </div>
                <div className="text-[10px] text-white/60 font-medium tabular-nums">
                  {registrants.toLocaleString()} people
                </div>
              </div>

              <div className="flex-grow">
                <div className="h-8 bg-m8bs-border/30 rounded-lg relative overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 bg-cyan-500 rounded-lg transition-all duration-300"
                    style={{ width: `${registrantRate}%` }}
                  ></div>
                </div>
              </div>

              <div className="w-16 pl-3 text-right">
                <div className="text-xs font-extrabold text-white tabular-nums">
                  {registrantRateFormatted}%
                </div>
                <div className="text-[10px] text-white/60 font-medium tabular-nums">
                  -{formatPercentage(registrantDropOffPercent, 1)}%
                </div>
              </div>
            </div>

            {/* Confirmations */}
            <div className="flex items-center group/stage">
              <div className="w-32 text-right pr-3">
                <div className="text-xs font-medium text-white/80">
                  Confirmations
                </div>
                <div className="text-[10px] text-white/60 font-medium tabular-nums">
                  {confirmations.toLocaleString()} people
                </div>
              </div>

              <div className="flex-grow">
                <div className="h-8 bg-m8bs-border/30 rounded-lg relative overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 bg-emerald-500 rounded-lg transition-all duration-300"
                    style={{ width: `${confirmationRate}%` }}
                  ></div>
                </div>
              </div>

              <div className="w-16 pl-3 text-right">
                <div className="text-xs font-extrabold text-white tabular-nums">
                  {confirmationRateFormatted}%
                </div>
                <div className="text-[10px] text-white/60 font-medium tabular-nums">
                  -{formatPercentage(confirmationDropOffPercent, 1)}%
                </div>
              </div>
            </div>

            {/* Attendees */}
            <div className="flex items-center group/stage">
              <div className="w-32 text-right pr-3">
                <div className="text-xs font-medium text-white/80">
                  Attendees
                </div>
                <div className="text-[10px] text-white/60 font-medium tabular-nums">
                  {attendees.toLocaleString()} people
                </div>
              </div>

              <div className="flex-grow">
                <div className="h-8 bg-m8bs-border/30 rounded-lg relative overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 bg-purple-500 rounded-lg transition-all duration-300"
                    style={{ width: `${attendanceRate}%` }}
                  ></div>
                </div>
              </div>

              <div className="w-16 pl-3 text-right">
                <div className="text-xs font-extrabold text-white tabular-nums">
                  {attendanceRateFormatted}%
                </div>
                <div className="text-[10px] text-white/60 font-medium tabular-nums">
                  -{formatPercentage(attendanceDropOffPercent, 0)}%
                </div>
              </div>
            </div>

            {/* Plate Lickers */}
            <div className="flex items-center group/stage">
              <div className="w-32 text-right pr-3">
                <div className="text-xs font-medium text-white/80">
                  Plate Lickers
                </div>
                <div className="text-[10px] text-white/60 font-medium tabular-nums">
                  {plateLickers.toLocaleString()} people
                </div>
              </div>
              <div className="flex-grow">
                <div className="h-8 bg-m8bs-border/30 rounded-lg relative overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 bg-cyan-500 rounded-lg transition-all duration-300"
                    style={{ width: `${registrants > 0 ? (plateLickers / registrants) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
              <div className="w-16 pl-3 text-right">
                <div className="text-xs font-extrabold text-white tabular-nums">
                  {registrants > 0 ? formatPercentage((plateLickers / registrants) * 100, 1) : '0'}%
                </div>
                <div className="text-[10px] text-white/60 font-medium tabular-nums">
                  -{registrants > 0 ? formatPercentage(100 - (plateLickers / registrants) * 100, 1) : '0'}%
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Overall Conversion & Drop-off Analysis */}
        {/* REMOVE the section with the horizontal bar chart for Marketing Audience Size, Registrants, Confirmations, and Attendees */}

        {/* Insights */}
        <div className="bg-black/30 border border-m8bs-border/40 rounded-lg p-3 md:p-4 mt-auto">
          <h4 className="text-[10px] font-semibold text-white/90 tracking-wide uppercase mb-2">Insights</h4>
          <div className="text-[10px] text-white/70 font-medium space-y-2 leading-relaxed">
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

            {plateLickers / Math.max(1, registrants) > 0.3 && (
              <p className="text-white/80">A high percentage of plate lickers may indicate a need to refine your event targeting or value proposition.</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
