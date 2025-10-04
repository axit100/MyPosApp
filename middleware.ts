import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Simple JWT verification for Edge Runtime
async function verifyJWT(token: string): Promise<boolean> {
  try {
    // For Edge Runtime, we'll do a simple check
    // In production, you'd want to implement proper JWT verification with Web Crypto API
    const parts = token.split('.')
    if (parts.length !== 3) return false

    // Decode and check the payload
    const payload = JSON.parse(atob(parts[1]))
    const now = Math.floor(Date.now() / 1000)

    // Check if token has required fields and is not expired
    if (!payload.userId || !payload.email || !payload.exp) {
      return false
    }

    return payload.exp > now
  } catch (error) {
    console.error('JWT verification error:', error)
    return false
  }
}

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("auth-token")?.value
  const isAuthRoute = req.nextUrl.pathname.startsWith("/login")
  const isDashboardRoute = req.nextUrl.pathname.startsWith("/dashboard")
  const isApiRoute = req.nextUrl.pathname.startsWith("/api")

  console.log('🔄 Middleware:', req.nextUrl.pathname, 'Has Token:', !!token)

  // Skip middleware for API routes (they handle auth internally)
  if (isApiRoute) {
    console.log('⏭️  Skipping middleware for API route')
    return NextResponse.next()
  }

  // Verify token if it exists
  let isValidToken = false
  if (token) {
    console.log('🔍 Verifying JWT token...')
    isValidToken = await verifyJWT(token)
    console.log('🎫 Token valid:', isValidToken)
  }

  // Redirect to login if accessing dashboard without valid token
  if (isDashboardRoute && !isValidToken) {
    console.log('🚫 Redirecting to login - no valid token for dashboard')
    return NextResponse.redirect(new URL("/login", req.url))
  }

  // Redirect to dashboard if accessing login with valid token
  if (isAuthRoute && isValidToken) {
    console.log('✅ Redirecting to dashboard - already logged in')
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
