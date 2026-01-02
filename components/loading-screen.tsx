import { Loader2 } from "lucide-react"

export function LoadingScreen() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background z-50">
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="bg-gray-500 text-white rounded-full p-2 w-10 h-10 flex items-center justify-center font-bold">
            M8BS
          </div>
          <h2 className="text-xl font-bold">Marketing Dashboard</h2>
        </div>
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <p className="text-sm text-muted-foreground">Initializing session...</p>
      </div>
    </div>
  )
}

export function LoadingOverlay({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-40">
      <div className="flex flex-col items-center gap-3 bg-m8bs-card p-6 rounded-lg border border-m8bs-card-alt">
        <Loader2 className="h-6 w-6 animate-spin text-m8bs-blue" />
        <p className="text-sm text-white">{message}</p>
      </div>
    </div>
  )
}
