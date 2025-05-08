import { Loader2 } from "lucide-react"

export function LoadingScreen() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="bg-blue-500 text-white rounded-full p-2 w-10 h-10 flex items-center justify-center font-bold">
            M8BS
          </div>
          <h2 className="text-xl font-bold">Marketing Dashboard</h2>
        </div>
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    </div>
  )
}
