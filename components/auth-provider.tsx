"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import type { Session, User, AuthChangeEvent } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/client"
import { LoadingScreen } from "@/components/loading-screen"

type AuthContextType = {
  user: User | null
  session: Session | null
  isLoading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isLoading: true,
  signOut: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    let mounted = true

    const getSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        if (!mounted) return

        if (error) {
          console.error("Error getting session:", error)
          // Clear any invalid session state
          setSession(null)
          setUser(null)
          setIsLoading(false)
          return
        }

        setSession(session)
        setUser(session?.user ?? null)
        setIsLoading(false)
      } catch (error) {
        if (!mounted) return
        console.error("Exception getting session:", error)
        setSession(null)
        setUser(null)
        setIsLoading(false)
      }
    }

    getSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
      if (!mounted) return
      setSession(session)
      setUser(session?.user ?? null)
      setIsLoading(false)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const signOut = async () => {
    try {
      setIsLoading(true)
      // First clear the session
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      // Then clear local state
      setUser(null)
      setSession(null)
      
      // Clear any stored data
      localStorage.removeItem('supabase.auth.token')
      
      // Force a hard navigation to the login page
      window.location.href = "/"
    } catch (error) {
      console.error("Error signing out:", error)
      // Even if there's an error, try to redirect to login
      window.location.href = "/"
    } finally {
      setIsLoading(false)
    }
  }

  const value = {
    user,
    session,
    isLoading,
    signOut,
  }

  return <AuthContext.Provider value={value}>{isLoading ? <LoadingScreen /> : children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
