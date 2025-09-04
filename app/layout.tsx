
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Providers } from "@/components/auth/providers"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Spotter - Fitness Workout Tracker",
  description: "Import, parse, and track your fitness workouts with ease. Spotter helps you manage your fitness journey with intelligent workout parsing and comprehensive tracking.",
  keywords: ["fitness", "workout", "tracker", "exercise", "training"],
  authors: [{ name: "Spotter Team" }],
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#00D0BD',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} antialiased`}>
        <Providers>
          <div className="min-h-screen bg-background text-text-primary">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  )
}
