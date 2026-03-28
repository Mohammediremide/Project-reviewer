import '@/globals.css'
import type { Metadata } from 'next'
import { Providers } from '@/components/Providers'
import Navbar from '@/components/Navbar'

export const metadata: Metadata = {
  title: 'P R O R E V I E W E R - AI Code Audit Core',
  description: 'Deep neural analysis for developers who refuse to settle for mediocre code quality.',
  icons: {
    icon: "/favicon.png",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body suppressHydrationWarning>
        <Providers>
          <div className="bg-mesh"></div>
          <Navbar />
          <main>{children}</main>
        </Providers>
      </body>
    </html>
  )
}
