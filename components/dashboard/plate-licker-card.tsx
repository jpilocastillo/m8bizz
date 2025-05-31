import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";

interface PlateLickerCardProps {
  plateLickers: number;
  attendees: number;
}

export function PlateLickerCard({ plateLickers, attendees }: PlateLickerCardProps) {
  const percentage = attendees > 0 ? (plateLickers / attendees) * 100 : 0;
  console.log('Plate Licker Data:', { plateLickers, attendees, percentage });
  return (
    <Card className="bg-gradient-to-br from-m8bs-card to-m8bs-card-alt border-m8bs-border rounded-lg overflow-hidden shadow-md">
      <CardHeader className="bg-m8bs-card-alt border-b border-m8bs-border px-6 py-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-extrabold text-white tracking-tight text-center">
            Plate Lickers
          </CardTitle>
          <div className="bg-blue-500/20 p-2 rounded-lg">
            <Users className="h-5 w-5 text-blue-400" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 flex flex-col items-center justify-center">
        <div>
          <div className="text-white text-sm font-medium mb-1">No interest in appointments or services</div>
          <div className="text-white text-4xl font-bold">{plateLickers}</div>
          <div className="text-gray-400 text-xs mt-1">{percentage.toFixed(1)}% of attendees</div>
        </div>
      </CardContent>
    </Card>
  );
} 