import NextAuth from "next-auth"
import { authConfig } from "./auth.config"
import { NextResponse } from "next/server"

const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const isLoggedin = !!req.auth
  const { nextUrl } = req

  const isAuthRoute = nextUrl.pathname.startsWith('/signin') || nextUrl.pathname.startsWith('/signup')
  const isPublicRoute = nextUrl.pathname === '/' || nextUrl.pathname.startsWith('/api') || nextUrl.pathname.startsWith('/_next')

  if (isAuthRoute) {
    if (isLoggedin) {
      return NextResponse.redirect(new URL('/dashboard', nextUrl))
    }
    return NextResponse.next()
  }

  if (!isLoggedin && !isPublicRoute) {
    return NextResponse.redirect(new URL('/signin', nextUrl))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
