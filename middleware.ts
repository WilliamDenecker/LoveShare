import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Check if the user has the login cookie we set in the login page
  const userCookie = request.cookies.get('loveshare_user')

  // If they don't have the cookie, redirect them to the login page
  if (!userCookie) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  // Otherwise, let them proceed
  return NextResponse.next()
}

// Specify which routes need to be protected by this middleware
export const config = {
  matcher: [
    '/dashboard/:path*', 
    '/notes/:path*', 
    '/calendar/:path*', 
    '/recap/:path*'
  ],
}