"use client"

import { Suspense, type ReactNode } from "react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { AnimatedBackground } from "@/components/dashboard/animated-background"
import { DatabaseStatus } from "@/components/database-status"
import { PageGuide } from "@/components/onboarding/page-guide"

export function DashboardShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen bg-black text-white overflow-hidden">
      <AnimatedBackground />
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        <main className="flex-1 overflow-y-auto px-4 sm:px-5 lg:px-6 xl:px-8 pt-6 sm:pt-8 pb-4 sm:pb-6 bg-black">
          <DatabaseStatus />
          <div className="max-w-5xl mx-auto">
            <PageGuide />
            <Suspense fallback={<div className="text-m8bs-muted text-sm py-6">Loading...</div>}>{children}</Suspense>
          </div>
        </main>
      </div>
    </div>
  )
}
