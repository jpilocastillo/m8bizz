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

  // Handle login page - redirect if already authenticated
  if (req.nextUrl.pathname === '/login') {
    if (session) {
      return NextResponse.redirect(new URL('/', req.url))
    }
  }

  // Handle root page - redirect to login if not authenticated
  if (req.nextUrl.pathname === '/') {
    if (!session) {
      return NextResponse.redirect(new URL('/login', req.url))
    }
  }

  return res
}

export const config = {
  matcher: [
    '/',
    '/business-dashboard/:path*',
    '/admin/:path*',
    '/login',
  ],
}
