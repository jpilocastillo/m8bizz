"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ViewAsUserProvider } from "@/components/admin/view-as-user-context"
import { ViewAsSidebar } from "@/components/admin/view-as-sidebar"
import { getProfileForViewAs } from "@/app/admin/actions"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { AnimatedBackground } from "@/components/dashboard/animated-background"

export function ViewAsLayoutClient({ children }: { children: React.ReactNode }) {
  const params = useParams()
  const router = useRouter()
  const userId = params.userId as string

  const [profile, setProfile] = useState<{ id: string; full_name?: string | null; email?: string | null } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) {
      setError("Invalid user")
      setLoading(false)
      return
    }
    let cancelled = false
    getProfileForViewAs(userId).then((result) => {
      if (cancelled) return
      if (!result.success) {
        setError(result.error || "User not found")
        setProfile(null)
        router.replace("/admin/dashboard")
        return
      }
      setProfile(result.data ?? null)
      setError(null)
    }).finally(() => {
      if (!cancelled) setLoading(false)
    })
    return () => { cancelled = true }
  }, [userId, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-m8bs-blue/20 border-t-m8bs-blue mx-auto" />
          <p className="text-m8bs-muted">Loading user...</p>
        </div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-center space-y-4">
          <p className="text-red-400">{error || "User not found"}</p>
          <Link href="/admin/dashboard">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to admin
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <ViewAsUserProvider userId={userId} profile={profile}>
      <div className="flex h-screen bg-black text-white overflow-hidden">
        <AnimatedBackground />
        <ViewAsSidebar profile={profile} />
        <div className="flex-1 flex flex-col overflow-hidden relative z-10">
          <main className="flex-1 overflow-y-auto px-4 sm:px-5 lg:px-6 xl:px-8 pt-6 sm:pt-8 pb-4 sm:pb-6 bg-black">
            <div className="max-w-5xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </ViewAsUserProvider>
  )
}
