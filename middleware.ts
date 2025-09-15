import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  // Allow access to login page and API routes
  if (req.nextUrl.pathname === '/login' || req.nextUrl.pathname.startsWith('/api')) {
    return NextResponse.next()
  }

  // For other routes, we'll handle auth check on the client side
  // This is a simplified approach - you could also implement server-side checking
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
