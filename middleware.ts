import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Simple JWT verification for Edge Runtime
async function verifyJWT(token: string): Promise<boolean> {
  try {
    // For Edge Runtime, we'll do a simple check
    // In production, you'd want to implement proper JWT verification with Web Crypto API
    const parts = token.split('.')
    if (parts.length !== 3) return false

    // For now, just check if it's a valid JWT format and not expired
    const payload = JSON.parse(atob(parts[1]))
    const now = Math.floor(Date.now() / 1000)

    return payload.exp > now
  } catch {
    return false
  }
}

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value
  const isAuthRoute = req.nextUrl.pathname.startsWith("/login")
  const isDashboardRoute = req.nextUrl.pathname.startsWith("/dashboard")
  const isApiRoute = req.nextUrl.pathname.startsWith("/api")

  // console.log('Middleware:', req.nextUrl.pathname, 'Token:', !!token)

  // Skip middleware for API routes (they handle auth internally)
  if (isApiRoute) {
    return NextResponse.next()
  }

  // Verify token if it exists
  let isValidToken = false
  if (token) {
    isValidToken = await verifyJWT(token)
  }

  // Redirect to login if accessing dashboard without valid token
  if (isDashboardRoute && !isValidToken) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  // Redirect to dashboard if accessing login with valid token
  if (isAuthRoute && isValidToken) {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
