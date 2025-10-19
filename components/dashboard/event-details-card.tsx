import { Card, CardContent, CardHeader } from "@/components/ui/card"
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
    <Card className="bg-gradient-to-br from-m8bs-card to-m8bs-card-alt border-m8bs-border rounded-lg overflow-hidden shadow-md">
      <CardHeader className="bg-m8bs-card-alt border-b border-m8bs-border px-6 py-4">
        <h3 className="text-xl font-extrabold text-white flex items-center tracking-tight">
          <Calendar className="mr-3 h-6 w-6 text-m8bs-blue" />
          Event Details
        </h3>
      </CardHeader>
      <CardContent className="p-0">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 divide-x divide-m8bs-border">
          {/* Day of Week */}
          <div className="p-4 lg:p-6 flex flex-col items-center justify-start text-center relative overflow-hidden group min-h-[140px]">
            <div className="absolute inset-0 bg-m8bs-blue/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="bg-m8bs-blue/20 p-2.5 rounded-md mb-3 flex-shrink-0 w-10 h-10 flex items-center justify-center">
              <Calendar className="h-5 w-5 text-m8bs-blue" />
            </div>
            <div className="text-white text-xs tracking-wider uppercase font-bold mb-2 leading-tight h-4 flex items-center">Day of Week</div>
            <div className="text-white text-lg lg:text-2xl font-extrabold leading-tight break-words flex-1 flex items-center justify-center">{dayOfWeek}</div>
          </div>

          {/* Location */}
          <div className="p-4 lg:p-6 flex flex-col items-center justify-start text-center relative overflow-hidden group min-h-[140px]">
            <div className="absolute inset-0 bg-emerald-900/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="bg-emerald-900/20 p-2.5 rounded-md mb-3 flex-shrink-0 w-10 h-10 flex items-center justify-center">
              <MapPin className="h-5 w-5 text-emerald-400" />
            </div>
            <div className="text-white text-xs tracking-wider uppercase font-bold mb-2 leading-tight h-4 flex items-center">Location</div>
            <div className="text-white text-lg lg:text-2xl font-extrabold leading-tight break-words flex-1 flex items-center justify-center">{location}</div>
          </div>

          {/* Time */}
          <div className="p-4 lg:p-6 flex flex-col items-center justify-start text-center relative overflow-hidden group min-h-[140px]">
            <div className="absolute inset-0 bg-amber-900/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="bg-amber-900/20 p-2.5 rounded-md mb-3 flex-shrink-0 w-10 h-10 flex items-center justify-center">
              <Clock className="h-5 w-5 text-amber-400" />
            </div>
            <div className="text-white text-xs tracking-wider uppercase font-bold mb-2 leading-tight h-4 flex items-center">Time</div>
            <div className="text-white text-lg lg:text-2xl font-extrabold leading-tight break-words flex-1 flex items-center justify-center">
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
          <div className="p-4 lg:p-6 flex flex-col items-center justify-start text-center relative overflow-hidden group min-h-[140px]">
            <div className="absolute inset-0 bg-indigo-900/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="bg-indigo-900/20 p-2.5 rounded-md mb-3 flex-shrink-0 w-10 h-10 flex items-center justify-center">
              <MessageSquare className="h-5 w-5 text-indigo-400" />
            </div>
            <div className="text-white text-xs tracking-wider uppercase font-bold mb-2 leading-tight h-4 flex items-center">Topic</div>
            <div className="text-white text-lg lg:text-2xl font-extrabold leading-tight break-words flex-1 flex items-center justify-center">{topic}</div>
          </div>

          {/* Age Range */}
          <div className="p-4 lg:p-6 flex flex-col items-center justify-start text-center relative overflow-hidden group min-h-[140px]">
            <div className="absolute inset-0 bg-purple-900/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="bg-purple-900/20 p-2.5 rounded-md mb-3 flex-shrink-0 w-10 h-10 flex items-center justify-center">
              <Users className="h-5 w-5 text-purple-400" />
            </div>
            <div className="text-white text-xs tracking-wider uppercase font-bold mb-2 leading-tight h-4 flex items-center">Age Range</div>
            <div className="text-white text-lg lg:text-2xl font-extrabold leading-tight break-words flex-1 flex items-center justify-center">{ageRange}</div>
          </div>

          {/* Mile Radius */}
          <div className="p-4 lg:p-6 flex flex-col items-center justify-start text-center relative overflow-hidden group min-h-[140px]">
            <div className="absolute inset-0 bg-red-900/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="bg-red-900/20 p-2.5 rounded-md mb-3 flex-shrink-0 w-10 h-10 flex items-center justify-center">
              <Target className="h-5 w-5 text-red-400" />
            </div>
            <div className="text-white text-xs tracking-wider uppercase font-bold mb-2 leading-tight h-4 flex items-center">Mile Radius</div>
            <div className="text-white text-lg lg:text-2xl font-extrabold leading-tight break-words flex-1 flex items-center justify-center">{mileRadius}</div>
          </div>

          {/* Income Assets */}
          <div className="p-4 lg:p-6 flex flex-col items-center justify-start text-center relative overflow-hidden group min-h-[140px]">
            <div className="absolute inset-0 bg-cyan-900/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="bg-cyan-900/20 p-2.5 rounded-md mb-3 flex-shrink-0 w-10 h-10 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-cyan-400" />
            </div>
            <div className="text-white text-xs tracking-wider uppercase font-bold mb-2 leading-tight h-4 flex items-center">Income Assets</div>
            <div className="text-white text-lg lg:text-2xl font-extrabold leading-tight break-words flex-1 flex items-center justify-center">{incomeAssets}</div>
          </div>

          {/* Marketing Audience Size */}
          <div className="p-4 lg:p-6 flex flex-col items-center justify-start text-center relative overflow-hidden group min-h-[140px]">
            <div className="absolute inset-0 bg-pink-900/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="bg-pink-900/20 p-2.5 rounded-md mb-3 flex-shrink-0 w-10 h-10 flex items-center justify-center">
              <Users className="h-5 w-5 text-pink-400" />
            </div>
            <div className="text-white text-xs tracking-wider uppercase font-bold mb-2 leading-tight h-4 flex items-center">Marketing Audience Size</div>
            <div className="text-white text-lg lg:text-2xl font-extrabold leading-tight break-words flex-1 flex items-center justify-center">{marketingAudienceSize}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
