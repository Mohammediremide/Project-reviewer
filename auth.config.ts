import GitHub from "next-auth/providers/github"
import Google from "next-auth/providers/google"
import type { NextAuthConfig } from "next-auth"

export const authConfig = {
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard') || nextUrl.pathname.startsWith('/reviews') || nextUrl.pathname.startsWith('/import') || nextUrl.pathname.startsWith('/rate') || nextUrl.pathname.startsWith('/admin')
      
      if (isOnDashboard) {
        if (isLoggedIn) return true
        return false // Redirect to /signin
      }
      return true
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = (token.sub as string)
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.sub = user.id
      }
      return token
    }
  },
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/signin",
  },
} satisfies NextAuthConfig
