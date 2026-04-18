import { createServerClient } from "@supabase/ssr"
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          if (!req.cookies) return undefined
          return req.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          res.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: any) {
          res.cookies.set({
            name,
            value: "",
            ...options,
          })
        },
      },
    }
  )

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Handle admin routes
  if (req.nextUrl.pathname.startsWith('/admin')) {
    // Allow access to admin login page
    if (req.nextUrl.pathname === '/admin/login') {
      return res
    }

    // Check if user is authenticated
    if (!session) {
      return NextResponse.redirect(new URL('/admin/login', req.url))
    }

    // Check if user has admin role
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single()

      if (!profile || profile.role !== 'admin') {
        return NextResponse.redirect(new URL('/admin/login', req.url))
      }
    } catch (error) {
      console.error('Error checking admin role:', error)
      return NextResponse.redirect(new URL('/admin/login', req.url))
    }
  }

  // Handle regular dashboard routes
  if (req.nextUrl.pathname.startsWith('/business-dashboard')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', req.url))
    }
  }

  // Allow password reset and forgot password pages - these need to work even with recovery sessions
  if (req.nextUrl.pathname === '/reset-password' || req.nextUrl.pathname === '/forgot-password') {
    return res
  }

  // Allow auth callback route
  if (req.nextUrl.pathname === '/auth/callback') {
    return res
  }

  // Handle login page - check for recovery parameters and redirect to reset-password
  if (req.nextUrl.pathname === '/login') {
    // Check if URL has recovery parameters (code, type=recovery, or hash with recovery tokens)
    const code = req.nextUrl.searchParams.get('code')
    const type = req.nextUrl.searchParams.get('type')
    const hash = req.nextUrl.hash
    
    // If we have recovery parameters, redirect to reset-password
    if (code && type === 'recovery') {
      const resetUrl = new URL('/reset-password', req.url)
      resetUrl.searchParams.set('code', code)
      resetUrl.searchParams.set('type', type)
      return NextResponse.redirect(resetUrl)
    }
    
    // Check hash for recovery tokens
    if (hash && hash.includes('type=recovery')) {
      const resetUrl = new URL('/reset-password', req.url)
      resetUrl.hash = hash
      return NextResponse.redirect(resetUrl)
    }
    
    // If user has a session but no recovery indicators, redirect to home
    if (session) {
      // Check if this might be a recovery session by checking if it's very new
      // Recovery sessions are typically created just before this redirect
      // We'll let the client component handle this more accurately
      // For now, only redirect if we're sure it's not a recovery session
      const hasRecoveryParams = code || type === 'recovery' || hash.includes('recovery')
      if (!hasRecoveryParams) {
        return NextResponse.redirect(new URL('/', req.url))
      }
    }
  }

  // Handle root page - redirect to login if not authenticated
  if (req.nextUrl.pathname === '/') {
    if (!session) {
      return NextResponse.redirect(new URL('/login', req.url))
    }
  }

  if (req.nextUrl.pathname === '/getting-started') {
    if (!session) {
      return NextResponse.redirect(new URL('/login', req.url))
    }
  }

  return res
}

export const config = {
  matcher: [
    '/',
    '/getting-started',
    '/business-dashboard/:path*',
    '/admin/:path*',
    '/login',
    '/reset-password',
    '/forgot-password',
  ],
}
