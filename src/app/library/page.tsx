"use client"

import { Login } from "@/components/auth/login"
import { Header } from "@/components/layout/header"
import { MobileNav } from "@/components/layout/mobile-nav"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Library } from "lucide-react"
import { useSession } from "next-auth/react"

export default function LibraryPage() {
  const { data: session } = useSession()

  if (!session) {
    return <Login />
  }

  return (
    <>
      <Header />
      <main className="min-h-screen pb-20 md:pb-8 flex justify-center">
        <div className="w-full max-w-4xl mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-text-primary mb-2">
              Workout Library
            </h1>
            <p className="text-text-secondary">
              Browse and manage your saved workouts
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Library className="h-5 w-5" />
                <span>Your Workout Library</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-text-secondary">
                No workouts found. Add your first workout to get started!
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
      <MobileNav />
    </>
  )
}