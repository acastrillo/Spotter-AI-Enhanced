"use client"

import { useSession } from "next-auth/react"
import { Login } from "@/components/auth/login"
import { Header } from "@/components/layout/header"
import { MobileNav } from "@/components/layout/mobile-nav"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "lucide-react"

export default function CalendarPage() {
  const { data: session, status } = useSession()

  if (status === "unauthenticated") {
    return <Login />
  }
  if (status !== "authenticated" || !session?.user) {
    return null
  }

  return (
    <>
      <Header />
      <main className="min-h-screen pb-20 md:pb-8 flex justify-center">
        <div className="w-full max-w-4xl mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-text-primary mb-2">
              Workout Calendar
            </h1>
            <p className="text-text-secondary">
              View your workout schedule and progress
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Your Workout Schedule</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-text-secondary">
                Calendar view coming soon. Track your workout dates and build your fitness routine.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
      <MobileNav />
    </>
  )
}