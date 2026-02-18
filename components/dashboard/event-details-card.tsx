import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, MapPin, Clock, Users, Target, DollarSign, MessageSquare } from "lucide-react"

interface EventDetailsCardProps {
  dayOfWeek?: string
  location?: string
  time?: string
  ageRange?: string
  mileRadius?: string
  incomeAssets?: string
  topic?: string
  marketingAudienceSize?: string
}

export function EventDetailsCard({
  dayOfWeek = "N/A",
  location = "N/A",
  time = "N/A",
  ageRange = "N/A",
  mileRadius = "N/A",
  incomeAssets = "N/A",
  topic = "N/A",
  marketingAudienceSize = "N/A",
}: EventDetailsCardProps) {
  return (
    <Card className="bg-m8bs-card border-m8bs-border rounded-xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 backdrop-blur-sm">
      <CardHeader className="bg-gradient-to-r from-m8bs-card via-m8bs-card/95 to-m8bs-card border-b border-m8bs-border/50 px-6 py-6">
        <CardTitle className="text-xl md:text-2xl font-extrabold text-white flex items-center tracking-tight">
          <div className="mr-3 p-2 rounded-lg bg-m8bs-blue/20 backdrop-blur-sm border border-m8bs-blue/30">
            <Calendar className="h-5 w-5 md:h-6 md:w-6 text-m8bs-blue" />
          </div>
          Event Details
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 md:p-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-5">
          {/* Day of Week */}
          <div className="group relative p-4 md:p-5 flex flex-col items-center justify-start text-center overflow-hidden bg-gradient-to-br from-black/40 via-black/30 to-black/40 border border-m8bs-border/50 rounded-xl hover:from-black/60 hover:via-black/50 hover:to-black/60 hover:border-m8bs-blue/70 hover:shadow-lg hover:shadow-m8bs-blue/20 hover:-translate-y-1 transition-all duration-300 cursor-pointer">
            <div className="absolute inset-0 bg-gradient-to-br from-m8bs-blue/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative bg-gradient-to-br from-m8bs-blue/30 to-m8bs-blue/20 p-2.5 rounded-xl mb-3 flex-shrink-0 shadow-lg shadow-m8bs-blue/20 group-hover:scale-110 group-hover:shadow-xl group-hover:shadow-m8bs-blue/30 transition-all duration-300">
              <Calendar className="h-4 w-4 md:h-5 md:w-5 text-m8bs-blue" />
            </div>
            <div className="relative text-xs md:text-sm text-white/80 font-semibold tracking-wide mb-2 leading-tight line-clamp-2 group-hover:text-white transition-colors duration-300">Day of Week</div>
            <div className="relative text-sm md:text-base font-extrabold tracking-tight text-white break-words flex-1 flex items-center justify-center line-clamp-2 group-hover:text-m8bs-blue/90 transition-colors duration-300">{dayOfWeek}</div>
          </div>

          {/* Location */}
          <div className="group relative p-4 md:p-5 flex flex-col items-center justify-start text-center overflow-hidden bg-gradient-to-br from-black/40 via-black/30 to-black/40 border border-m8bs-border/50 rounded-xl hover:from-black/60 hover:via-black/50 hover:to-black/60 hover:border-emerald-500/70 hover:shadow-lg hover:shadow-emerald-500/20 hover:-translate-y-1 transition-all duration-300 cursor-pointer">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative bg-gradient-to-br from-emerald-500/30 to-emerald-500/20 p-2.5 rounded-xl mb-3 flex-shrink-0 shadow-lg shadow-emerald-500/20 group-hover:scale-110 group-hover:shadow-xl group-hover:shadow-emerald-500/30 transition-all duration-300">
              <MapPin className="h-4 w-4 md:h-5 md:w-5 text-emerald-500" />
            </div>
            <div className="relative text-xs md:text-sm text-white/80 font-semibold tracking-wide mb-2 leading-tight line-clamp-2 group-hover:text-white transition-colors duration-300">Location</div>
            <div className="relative text-sm md:text-base font-extrabold tracking-tight text-white break-words flex-1 flex items-center justify-center line-clamp-2 group-hover:text-emerald-500/90 transition-colors duration-300">{location}</div>
          </div>

          {/* Time */}
          <div className="group relative p-4 md:p-5 flex flex-col items-center justify-start text-center overflow-hidden bg-gradient-to-br from-black/40 via-black/30 to-black/40 border border-m8bs-border/50 rounded-xl hover:from-black/60 hover:via-black/50 hover:to-black/60 hover:border-amber-500/70 hover:shadow-lg hover:shadow-amber-500/20 hover:-translate-y-1 transition-all duration-300 cursor-pointer">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative bg-gradient-to-br from-amber-500/30 to-amber-500/20 p-2.5 rounded-xl mb-3 flex-shrink-0 shadow-lg shadow-amber-500/20 group-hover:scale-110 group-hover:shadow-xl group-hover:shadow-amber-500/30 transition-all duration-300">
              <Clock className="h-4 w-4 md:h-5 md:w-5 text-amber-500" />
            </div>
            <div className="relative text-xs md:text-sm text-white/80 font-semibold tracking-wide mb-2 leading-tight line-clamp-2 group-hover:text-white transition-colors duration-300">Time</div>
            <div className="relative text-sm md:text-base font-extrabold tracking-tight text-white break-words flex-1 flex items-center justify-center line-clamp-2 group-hover:text-amber-500/90 transition-colors duration-300">
              {time === "N/A" ? time : time.includes("AM") || time.includes("PM") ? time : (() => {
                try {
                  const [hours, minutes] = time.split(":");
                  const hour = parseInt(hours);
                  const ampm = hour >= 12 ? "PM" : "AM";
                  const hour12 = hour % 12 || 12;
                  return `${hour12}:${minutes} ${ampm}`;
                } catch {
                  return time;
                }
              })()}
            </div>
          </div>

          {/* Topic */}
          <div className="group relative p-4 md:p-5 flex flex-col items-center justify-start text-center overflow-hidden bg-gradient-to-br from-black/40 via-black/30 to-black/40 border border-m8bs-border/50 rounded-xl hover:from-black/60 hover:via-black/50 hover:to-black/60 hover:border-indigo-500/70 hover:shadow-lg hover:shadow-indigo-500/20 hover:-translate-y-1 transition-all duration-300 cursor-pointer">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative bg-gradient-to-br from-indigo-500/30 to-indigo-500/20 p-2.5 rounded-xl mb-3 flex-shrink-0 shadow-lg shadow-indigo-500/20 group-hover:scale-110 group-hover:shadow-xl group-hover:shadow-indigo-500/30 transition-all duration-300">
              <MessageSquare className="h-4 w-4 md:h-5 md:w-5 text-indigo-500" />
            </div>
            <div className="relative text-xs md:text-sm text-white/80 font-semibold tracking-wide mb-2 leading-tight line-clamp-2 group-hover:text-white transition-colors duration-300">Topic</div>
            <div className="relative text-sm md:text-base font-extrabold tracking-tight text-white break-words flex-1 flex items-center justify-center line-clamp-2 group-hover:text-indigo-500/90 transition-colors duration-300">{topic}</div>
          </div>

          {/* Age Range */}
          <div className="group relative p-4 md:p-5 flex flex-col items-center justify-start text-center overflow-hidden bg-gradient-to-br from-black/40 via-black/30 to-black/40 border border-m8bs-border/50 rounded-xl hover:from-black/60 hover:via-black/50 hover:to-black/60 hover:border-purple-500/70 hover:shadow-lg hover:shadow-purple-500/20 hover:-translate-y-1 transition-all duration-300 cursor-pointer">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative bg-gradient-to-br from-purple-500/30 to-purple-500/20 p-2.5 rounded-xl mb-3 flex-shrink-0 shadow-lg shadow-purple-500/20 group-hover:scale-110 group-hover:shadow-xl group-hover:shadow-purple-500/30 transition-all duration-300">
              <Users className="h-4 w-4 md:h-5 md:w-5 text-purple-500" />
            </div>
            <div className="relative text-xs md:text-sm text-white/80 font-semibold tracking-wide mb-2 leading-tight line-clamp-2 group-hover:text-white transition-colors duration-300">Age Range</div>
            <div className="relative text-sm md:text-base font-extrabold tracking-tight text-white break-words flex-1 flex items-center justify-center line-clamp-2 group-hover:text-purple-500/90 transition-colors duration-300">{ageRange}</div>
          </div>

          {/* Mile Radius */}
          <div className="group relative p-4 md:p-5 flex flex-col items-center justify-start text-center overflow-hidden bg-gradient-to-br from-black/40 via-black/30 to-black/40 border border-m8bs-border/50 rounded-xl hover:from-black/60 hover:via-black/50 hover:to-black/60 hover:border-red-500/70 hover:shadow-lg hover:shadow-red-500/20 hover:-translate-y-1 transition-all duration-300 cursor-pointer">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative bg-gradient-to-br from-red-500/30 to-red-500/20 p-2.5 rounded-xl mb-3 flex-shrink-0 shadow-lg shadow-red-500/20 group-hover:scale-110 group-hover:shadow-xl group-hover:shadow-red-500/30 transition-all duration-300">
              <Target className="h-4 w-4 md:h-5 md:w-5 text-red-500" />
            </div>
            <div className="relative text-xs md:text-sm text-white/80 font-semibold tracking-wide mb-2 leading-tight line-clamp-2 group-hover:text-white transition-colors duration-300">Mile Radius</div>
            <div className="relative text-sm md:text-base font-extrabold tracking-tight text-white break-words flex-1 flex items-center justify-center line-clamp-2 group-hover:text-red-500/90 transition-colors duration-300">
              {mileRadius === "N/A" ? mileRadius : (() => {
                const num = parseFloat(mileRadius);
                return isNaN(num) ? mileRadius : num.toLocaleString();
              })()}
            </div>
          </div>

          {/* Income Assets */}
          <div className="group relative p-4 md:p-5 flex flex-col items-center justify-start text-center overflow-hidden bg-gradient-to-br from-black/40 via-black/30 to-black/40 border border-m8bs-border/50 rounded-xl hover:from-black/60 hover:via-black/50 hover:to-black/60 hover:border-cyan-500/70 hover:shadow-lg hover:shadow-cyan-500/20 hover:-translate-y-1 transition-all duration-300 cursor-pointer">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative bg-gradient-to-br from-cyan-500/30 to-cyan-500/20 p-2.5 rounded-xl mb-3 flex-shrink-0 shadow-lg shadow-cyan-500/20 group-hover:scale-110 group-hover:shadow-xl group-hover:shadow-cyan-500/30 transition-all duration-300">
              <DollarSign className="h-4 w-4 md:h-5 md:w-5 text-cyan-500" />
            </div>
            <div className="relative text-xs md:text-sm text-white/80 font-semibold tracking-wide mb-2 leading-tight line-clamp-2 group-hover:text-white transition-colors duration-300">Income Assets</div>
            <div className="relative text-sm md:text-base font-extrabold tracking-tight text-white break-words flex-1 flex items-center justify-center line-clamp-2 group-hover:text-cyan-500/90 transition-colors duration-300">{incomeAssets}</div>
          </div>

          {/* Marketing Audience Size */}
          <div className="group relative p-4 md:p-5 flex flex-col items-center justify-start text-center overflow-hidden bg-gradient-to-br from-black/40 via-black/30 to-black/40 border border-m8bs-border/50 rounded-xl hover:from-black/60 hover:via-black/50 hover:to-black/60 hover:border-pink-500/70 hover:shadow-lg hover:shadow-pink-500/20 hover:-translate-y-1 transition-all duration-300 cursor-pointer">
            <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative bg-gradient-to-br from-pink-500/30 to-pink-500/20 p-2.5 rounded-xl mb-3 flex-shrink-0 shadow-lg shadow-pink-500/20 group-hover:scale-110 group-hover:shadow-xl group-hover:shadow-pink-500/30 transition-all duration-300">
              <Users className="h-4 w-4 md:h-5 md:w-5 text-pink-500" />
            </div>
            <div className="relative text-xs md:text-sm text-white/80 font-semibold tracking-wide mb-2 leading-tight line-clamp-2 group-hover:text-white transition-colors duration-300">Marketing Audien...</div>
            <div className="relative text-sm md:text-base font-extrabold tracking-tight text-white break-words flex-1 flex items-center justify-center line-clamp-2 group-hover:text-pink-500/90 transition-colors duration-300">
              {marketingAudienceSize === "N/A" ? marketingAudienceSize : (() => {
                const num = parseFloat(marketingAudienceSize);
                return isNaN(num) ? marketingAudienceSize : num.toLocaleString();
              })()}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
