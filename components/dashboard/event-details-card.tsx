import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, MapPin, Clock, Users, Target, DollarSign, MessageSquare } from "lucide-react"

interface EventDetailsCardProps {
  dayOfWeek?: string
  location?: string
  time?: string
  ageRange?: string
  mileRadius?: string
  incomeAssets?: string
  topic?: string // Add this new prop
  marketingAudienceSize?: string // Add this new prop
}

export function EventDetailsCard({
  dayOfWeek = "N/A",
  location = "N/A",
  time = "N/A",
  ageRange = "N/A",
  mileRadius = "N/A",
  incomeAssets = "N/A",
  topic = "N/A", // Add this new parameter with default
  marketingAudienceSize = "N/A",
}: EventDetailsCardProps) {
  return (
    <Card className="bg-m8bs-card border-m8bs-border rounded-lg overflow-hidden shadow-md">
      <CardHeader className="bg-m8bs-card border-b border-m8bs-border px-6 py-4">
        <CardTitle className="text-xl font-extrabold text-white flex items-center tracking-tight">
          <Calendar className="mr-3 h-6 w-6 text-m8bs-blue" />
          Event Details
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
          {/* Day of Week */}
          <div className="p-4 flex flex-col items-center justify-start text-center relative overflow-hidden group min-h-[140px] bg-black/30 border border-m8bs-border/40 rounded-lg hover:bg-black/50 hover:border-m8bs-border transition-all duration-300">
            <div className="bg-m8bs-card-alt p-2 rounded-lg mb-3 flex-shrink-0">
              <Calendar className="h-4 w-4 text-m8bs-blue" />
            </div>
            <div className="text-sm text-white/80 font-medium tracking-wide mb-2 leading-tight flex items-center">Day of Week</div>
            <div className="text-xl font-extrabold tracking-tight text-white break-words flex-1 flex items-center justify-center">{dayOfWeek}</div>
          </div>

          {/* Location */}
          <div className="p-4 flex flex-col items-center justify-start text-center relative overflow-hidden group min-h-[140px] bg-black/30 border border-m8bs-border/40 rounded-lg hover:bg-black/50 hover:border-emerald-500/60 transition-all duration-300">
            <div className="bg-emerald-500/20 p-2 rounded-lg mb-3 flex-shrink-0">
              <MapPin className="h-4 w-4 text-emerald-500" />
            </div>
            <div className="text-sm text-white/80 font-medium tracking-wide mb-2 leading-tight flex items-center">Location</div>
            <div className="text-xl font-extrabold tracking-tight text-white break-words flex-1 flex items-center justify-center">{location}</div>
          </div>

          {/* Time */}
          <div className="p-4 flex flex-col items-center justify-start text-center relative overflow-hidden group min-h-[140px] bg-black/30 border border-m8bs-border/40 rounded-lg hover:bg-black/50 hover:border-amber-500/60 transition-all duration-300">
            <div className="bg-amber-500/20 p-2 rounded-lg mb-3 flex-shrink-0">
              <Clock className="h-4 w-4 text-amber-500" />
            </div>
            <div className="text-sm text-white/80 font-medium tracking-wide mb-2 leading-tight flex items-center">Time</div>
            <div className="text-xl font-extrabold tracking-tight text-white break-words flex-1 flex items-center justify-center">
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

          {/* Topic of Marketing - Add this new section */}
          <div className="p-4 flex flex-col items-center justify-start text-center relative overflow-hidden group min-h-[140px] bg-black/30 border border-m8bs-border/40 rounded-lg hover:bg-black/50 hover:border-indigo-500/60 transition-all duration-300">
            <div className="bg-indigo-500/20 p-2 rounded-lg mb-3 flex-shrink-0">
              <MessageSquare className="h-4 w-4 text-indigo-500" />
            </div>
            <div className="text-sm text-white/80 font-medium tracking-wide mb-2 leading-tight flex items-center">Topic</div>
            <div className="text-xl font-extrabold tracking-tight text-white break-words flex-1 flex items-center justify-center">{topic}</div>
          </div>

          {/* Age Range */}
          <div className="p-4 flex flex-col items-center justify-start text-center relative overflow-hidden group min-h-[140px] bg-black/30 border border-m8bs-border/40 rounded-lg hover:bg-black/50 hover:border-purple-500/60 transition-all duration-300">
            <div className="bg-purple-500/20 p-2 rounded-lg mb-3 flex-shrink-0">
              <Users className="h-4 w-4 text-purple-500" />
            </div>
            <div className="text-sm text-white/80 font-medium tracking-wide mb-2 leading-tight flex items-center">Age Range</div>
            <div className="text-xl font-extrabold tracking-tight text-white break-words flex-1 flex items-center justify-center">{ageRange}</div>
          </div>

          {/* Mile Radius */}
          <div className="p-4 flex flex-col items-center justify-start text-center relative overflow-hidden group min-h-[140px] bg-black/30 border border-m8bs-border/40 rounded-lg hover:bg-black/50 hover:border-red-500/60 transition-all duration-300">
            <div className="bg-red-500/20 p-2 rounded-lg mb-3 flex-shrink-0">
              <Target className="h-4 w-4 text-red-500" />
            </div>
            <div className="text-sm text-white/80 font-medium tracking-wide mb-2 leading-tight flex items-center">Mile Radius</div>
            <div className="text-xl font-extrabold tracking-tight text-white break-words flex-1 flex items-center justify-center">
              {mileRadius === "N/A" ? mileRadius : (() => {
                const num = parseFloat(mileRadius);
                return isNaN(num) ? mileRadius : num.toLocaleString();
              })()}
            </div>
          </div>

          {/* Income Assets */}
          <div className="p-4 flex flex-col items-center justify-start text-center relative overflow-hidden group min-h-[140px] bg-black/30 border border-m8bs-border/40 rounded-lg hover:bg-black/50 hover:border-cyan-500/60 transition-all duration-300">
            <div className="bg-cyan-500/20 p-2 rounded-lg mb-3 flex-shrink-0">
              <DollarSign className="h-4 w-4 text-cyan-500" />
            </div>
            <div className="text-sm text-white/80 font-medium tracking-wide mb-2 leading-tight flex items-center">Income Assets</div>
            <div className="text-xl font-extrabold tracking-tight text-white break-words flex-1 flex items-center justify-center">{incomeAssets}</div>
          </div>

          {/* Marketing Audience Size */}
          <div className="p-4 flex flex-col items-center justify-start text-center relative overflow-hidden group min-h-[140px] bg-black/30 border border-m8bs-border/40 rounded-lg hover:bg-black/50 hover:border-pink-500/60 transition-all duration-300">
            <div className="bg-pink-500/20 p-2 rounded-lg mb-3 flex-shrink-0">
              <Users className="h-4 w-4 text-pink-500" />
            </div>
            <div className="text-sm text-white/80 font-medium tracking-wide mb-2 leading-tight flex items-center">Marketing Audience Size</div>
            <div className="text-xl font-extrabold tracking-tight text-white break-words flex-1 flex items-center justify-center">
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
