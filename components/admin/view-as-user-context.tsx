"use client"

import { createContext, useContext, useMemo, ReactNode } from "react"
import type { User } from "@supabase/supabase-js"

export interface ViewAsProfile {
  id: string
  full_name?: string | null
  email?: string | null
}

interface ViewAsUserContextType {
  /** The user ID being viewed (from URL). */
  viewAsUserId: string
  /** Profile of the viewed user for display (name, email). */
  profile: ViewAsProfile | null
  /** Minimal User-like object for data hooks that only need user.id (e.g. useAdvisorBasecamp, fetchAllEvents). */
  viewAsUser: User
}

const ViewAsUserContext = createContext<ViewAsUserContextType | null>(null)

export function ViewAsUserProvider({
  userId,
  profile,
  children,
}: {
  userId: string
  profile: ViewAsProfile | null
  children: ReactNode
}) {
  const value = useMemo<ViewAsUserContextType>(
    () => ({
      viewAsUserId: userId,
      profile,
      viewAsUser: { id: userId } as User,
    }),
    [userId, profile]
  )

  return (
    <ViewAsUserContext.Provider value={value}>
      {children}
    </ViewAsUserContext.Provider>
  )
}

export function useViewAsUser(): ViewAsUserContextType | null {
  return useContext(ViewAsUserContext)
}

/** Use when inside admin view-as routes: returns the virtual user for data loading. Throws if not in view-as context. */
export function useViewAsUserOrThrow(): ViewAsUserContextType {
  const ctx = useContext(ViewAsUserContext)
  if (!ctx) {
    throw new Error("useViewAsUserOrThrow must be used within ViewAsUserProvider (admin view-as routes)")
  }
  return ctx
}
