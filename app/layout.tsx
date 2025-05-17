import type { Metadata } from "next";
import type React from "react";
import Link from "next/link";
import { ThemeProvider } from "@/components/theme-provider";
import UserNav from "@/components/user-nav";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Title and Description will be handled by the metadata object */}
      </head>
      <body className="min-h-screen bg-background antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {/* This div acts as the main centered container for the entire app content */}
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col min-h-screen">
            <header className="border-b">
              {/* Header content, constrained by the parent's max-width and padding. h-16 for height. */}
              <div className="flex h-16 items-center justify-between">
                <Link href="/" className="flex items-center gap-2 group">
                  <img
                    src="/favicon.ico"
                    alt="Canadian Flag"
                    className="h-8 w-8 group-hover:opacity-80 transition-opacity"
                  />
                  <span className="font-bold group-hover:text-primary transition-colors">
                    Canadian Citizenship Test
                  </span>
                </Link>
                <UserNav />
              </div>
            </header>

            <main className="flex-grow py-8">
              {" "}
              {/* Main content area with vertical padding */}
              {children}
            </main>

            {/* Optional Footer Example:
            <footer className="py-6 border-t text-center">
              <p className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} Canadian Citizenship Quiz
              </p>
            </footer>
            */}
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}

export const metadata: Metadata = {
  title: "Canadian Citizenship Test",
  description:
    "Practice for your Canadian Citizenship Test with this interactive quiz application",
  icons: {
    icon: "/favicon.ico",
  },
  generator: "v0.dev",
};
