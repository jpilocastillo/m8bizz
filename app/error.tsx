"use client"

import { useEffect } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, RefreshCw, Home } from "lucide-react"
import { logger } from "@/lib/logger"
import Link from "next/link"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    logger.error("Next.js error boundary caught error:", error)
  }, [error])

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full bg-gray-900 border-red-500">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-6 w-6 text-red-500" />
            <CardTitle>Something went wrong</CardTitle>
          </div>
          <CardDescription>
            An unexpected error occurred. We've been notified and are looking into it.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error Details</AlertTitle>
            <AlertDescription className="mt-2">
              <div className="font-mono text-sm">
                {error.message || "An unexpected error occurred"}
              </div>
              {error.digest && (
                <div className="mt-2 text-xs text-gray-400">
                  Error ID: {error.digest}
                </div>
              )}
              {process.env.NODE_ENV === "development" && error.stack && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-sm">Stack Trace</summary>
                  <pre className="mt-2 text-xs overflow-auto max-h-48 bg-black/50 p-2 rounded">
                    {error.stack}
                  </pre>
                </details>
              )}
            </AlertDescription>
          </Alert>

          <div className="flex gap-2">
            <Button onClick={reset} variant="default">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
            <Button asChild variant="outline">
              <Link href="/">
                <Home className="h-4 w-4 mr-2" />
                Go Home
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


