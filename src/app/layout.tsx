/* =========================================================
   IMPORTS
========================================================= */
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"


/* =========================================================
   FONTS (Next.js Font Optimization)
========================================================= */
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})


/* =========================================================
   METADATA (SEO / APP INFO)
========================================================= */
export const metadata: Metadata = {
  title: "SnapQuote",
  description: "SnapQuote Quote Builder",
}


/* =========================================================
   ROOT LAYOUT COMPONENT
========================================================= */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`
        ${geistSans.variable}
        ${geistMono.variable}
        h-full
        antialiased
      `}
    >
      <body className="min-h-full flex flex-col">
        {children}
      </body>
    </html>
  )
}