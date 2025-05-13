import type React from "react"
import { ThemeProvider } from "@/components/theme-provider"
import UserNav from "@/components/user-nav"
import "./globals.css"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>Canadian Citizenship Test Quiz</title>
        <meta
          name="description"
          content="Practice for your Canadian Citizenship Test with this interactive quiz application"
        />
      </head>
      <body>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <header className="border-b">
            <div className="container flex h-16 items-center justify-between">
              <div className="flex items-center gap-2">
                <img src="/placeholder.svg?key=59xw6" alt="Canadian Flag" className="h-8 w-8" />
                <span className="font-bold">Canadian Citizenship Quiz</span>
              </div>
              <UserNav />
            </div>
          </header>
          <main className="min-h-[calc(100vh-4rem)] bg-background">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  )
}

export const metadata = {
      generator: 'v0.dev'
    };
