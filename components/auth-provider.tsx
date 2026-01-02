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
    let refreshInterval: NodeJS.Timeout | null = null
    let keepAliveInterval: NodeJS.Timeout | null = null

    // Set up session keep-alive: refresh session every 45 minutes (before 1 hour expiration)
    const setupKeepAlive = () => {
      if (keepAliveInterval) {
        clearInterval(keepAliveInterval)
      }
      
      keepAliveInterval = setInterval(async () => {
        if (!mounted) return
        
        try {
          const { data: { session: currentSession } } = await supabase.auth.getSession()
          if (currentSession) {
            // Refresh the session proactively before it expires
            const { data: { session: refreshedSession }, error } = await supabase.auth.refreshSession()
            if (error) {
              console.error("Error refreshing session in keep-alive:", error)
            } else if (refreshedSession) {
              setSession(refreshedSession)
              setUser(refreshedSession.user ?? null)
              console.log("Session refreshed via keep-alive")
            }
          }
        } catch (error) {
          console.error("Error in keep-alive refresh:", error)
        }
      }, 45 * 60 * 1000) // 45 minutes
    }

    // Set up automatic token refresh check every 5 minutes
    const setupTokenRefresh = () => {
      if (refreshInterval) {
        clearInterval(refreshInterval)
      }
      
      refreshInterval = setInterval(async () => {
        if (!mounted) return
        
        try {
          const { data: { session: currentSession } } = await supabase.auth.getSession()
          if (currentSession) {
            // Check if token is about to expire (within 10 minutes)
            const expiresAt = currentSession.expires_at
            if (expiresAt) {
              const expiresIn = expiresAt * 1000 - Date.now()
              const tenMinutes = 10 * 60 * 1000
              
              if (expiresIn < tenMinutes && expiresIn > 0) {
                // Refresh token proactively
                const { data: { session: refreshedSession }, error } = await supabase.auth.refreshSession()
                if (error) {
                  console.error("Error refreshing token:", error)
                } else if (refreshedSession) {
                  setSession(refreshedSession)
                  setUser(refreshedSession.user ?? null)
                  console.log("Token refreshed proactively")
                }
              }
            }
          }
        } catch (error) {
          console.error("Error in token refresh check:", error)
        }
      }, 5 * 60 * 1000) // Check every 5 minutes
    }

    const getSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        if (!mounted) return

        if (error) {
          console.error("Error getting session:", error)
          // Try to refresh the session if it's expired
          if (error.message?.includes('expired') || error.message?.includes('invalid')) {
            try {
              const { data: { session: refreshedSession } } = await supabase.auth.refreshSession()
              if (refreshedSession) {
                setSession(refreshedSession)
                setUser(refreshedSession.user ?? null)
                setIsLoading(false)
                // Set up keep-alive after successful refresh
                setupKeepAlive()
                setupTokenRefresh()
                return
              }
            } catch (refreshError) {
              console.error("Error refreshing session:", refreshError)
            }
          }
          // Clear any invalid session state
          setSession(null)
          setUser(null)
          setIsLoading(false)
          return
        }

        setSession(session)
        setUser(session?.user ?? null)
        setIsLoading(false)
        
        // Set up keep-alive if we have a session
        if (session) {
          setupKeepAlive()
          setupTokenRefresh()
        }
      } catch (error) {
        if (!mounted) return
        console.error("Exception getting session:", error)
        setSession(null)
        setUser(null)
        setIsLoading(false)
      }
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
      if (!mounted) return
      
      if (event === 'TOKEN_REFRESHED' && session) {
        console.log("Session token refreshed via auth state change")
        setSession(session)
        setUser(session.user ?? null)
        setIsLoading(false)
      } else if (event === 'SIGNED_OUT') {
        setSession(null)
        setUser(null)
        setIsLoading(false)
        if (keepAliveInterval) clearInterval(keepAliveInterval)
        if (refreshInterval) clearInterval(refreshInterval)
      } else {
        setSession(session)
        setUser(session?.user ?? null)
        setIsLoading(false)
        
        // Set up keep-alive when session is established
        if (session) {
          setupKeepAlive()
          setupTokenRefresh()
        } else {
          // Clear intervals if session is lost
          if (keepAliveInterval) clearInterval(keepAliveInterval)
          if (refreshInterval) clearInterval(refreshInterval)
        }
      }
    })

    // Initialize session
    getSession()

    return () => {
      mounted = false
      subscription.unsubscribe()
      if (keepAliveInterval) clearInterval(keepAliveInterval)
      if (refreshInterval) clearInterval(refreshInterval)
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
