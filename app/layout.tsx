import type { Metadata } from "next";
import type React from "react";
import { Inter } from "next/font/google";
import UserNav from "@/components/user-nav";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

// Comprehensive metadata for SEO
export const metadata: Metadata = {
  title: {
    default:
      "Canadian Citizenship Test Study Guide 2024 | Pass Your Test with Confidence",
    template: "%s | Discover Canada Study Guide",
  },
  description:
    "Complete Canadian citizenship test preparation guide based on official Discover Canada materials. Free practice tests, study chapters, and everything you need to pass your citizenship test.",
  keywords: [
    "Canadian citizenship test",
    "citizenship study guide",
    "Discover Canada",
    "citizenship test preparation",
    "Canadian citizenship exam",
    "IRCC",
    "citizenship test practice",
    "become Canadian citizen",
    "timed quiz",
    "standard quiz",
  ],
  authors: [{ name: "Discover Canada Study Guide" }],
  creator: "Discover Canada Study Guide",
  publisher: "Discover Canada Study Guide",
  robots: "index, follow",
  openGraph: {
    title:
      "Canadian Citizenship Test Study Guide 2024 | Pass Your Test with Confidence",
    description:
      "Complete Canadian citizenship test preparation guide based on official Discover Canada materials. Free practice tests, study chapters, and everything you need to pass your citizenship test.",
    url: "https://your-domain.com",
    siteName: "Discover Canada Study Guide",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Canadian Citizenship Test Study Guide",
      },
    ],
    locale: "en_CA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Canadian Citizenship Test Study Guide 2024",
    description:
      "Complete Canadian citizenship test preparation guide based on official Discover Canada materials.",
    images: ["/og-image.jpg"],
  },
  alternates: {
    canonical: "https://your-domain.com",
  },
  verification: {
    google: "your-google-verification-code",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en-CA" suppressHydrationWarning>
      <head>
        {/* Structured Data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "EducationalOrganization",
              name: "Discover Canada Study Guide",
              description:
                "Complete Canadian citizenship test preparation guide based on official Discover Canada materials.",
              url: "https://your-domain.com",
              logo: "https://your-domain.com/logo.png",
              sameAs: [
                "https://facebook.com/your-page",
                "https://twitter.com/your-account",
              ],
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "CAD",
                availability: "https://schema.org/InStock",
              },
              educationalCredentialAwarded:
                "Canadian Citizenship Test Preparation",
            }),
          }}
        />

        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />

        {/* Theme color for mobile browsers */}
        <meta name="theme-color" content="#dc2626" />
        <meta name="msapplication-TileColor" content="#dc2626" />

        {/* Viewport meta tag for responsive design */}
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
      </head>
      <body
        className={`${inter.className} min-h-screen bg-background antialiased`}
      >
        {/* Skip to main content for accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-red-600 text-white px-4 py-2 rounded z-50"
        >
          Skip to main content
        </a>

        <UserNav />

        <main id="main-content" className="flex-1">
          {children}
        </main>

        <footer className="bg-gray-900 text-white py-12">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <h3 className="font-bold text-lg mb-4">Study Guide</h3>
                <ul className="space-y-2 text-gray-300">
                  <li>
                    <a
                      href="/study/canadian-history"
                      className="hover:text-white transition-colors"
                    >
                      Canadian History
                    </a>
                  </li>
                  <li>
                    <a
                      href="/study/rights-responsibilities"
                      className="hover:text-white transition-colors"
                    >
                      Rights & Responsibilities
                    </a>
                  </li>
                  <li>
                    <a
                      href="/study/government-structure"
                      className="hover:text-white transition-colors"
                    >
                      Government Structure
                    </a>
                  </li>
                  <li>
                    <a
                      href="/study/geography"
                      className="hover:text-white transition-colors"
                    >
                      Geography
                    </a>
                  </li>
                </ul>
              </div>
              <div className="text-center">
                <h3 className="font-bold text-lg mb-4">Practice Tests</h3>
                <ul className="space-y-2 text-gray-300">
                  <li>
                    <a
                      href="/quiz/standard"
                      className="hover:text-white transition-colors"
                    >
                      Standard Quiz
                    </a>
                  </li>
                  <li>
                    <a
                      href="/quiz/timed"
                      className="hover:text-white transition-colors"
                    >
                      Timed Quiz
                    </a>
                  </li>
                  <li>
                    <a
                      href="/faq"
                      className="hover:text-white transition-colors"
                    >
                      FAQ
                    </a>
                  </li>
                </ul>
              </div>

              <div className="text-center">
                <h3 className="font-bold text-lg mb-4">About</h3>
                <ul className="space-y-2 text-gray-300">
                  <li>
                    <a
                      href="/about"
                      className="hover:text-white transition-colors"
                    >
                      About Us
                    </a>
                  </li>
                  <li>
                    <a
                      href="/contact"
                      className="hover:text-white transition-colors"
                    >
                      Contact
                    </a>
                  </li>
                  <li>
                    <a
                      href="/privacy-policy"
                      className="hover:text-white transition-colors"
                    >
                      Privacy Policy
                    </a>
                  </li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
              <p>&copy; 2025 Canada Citizenship Guide. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
