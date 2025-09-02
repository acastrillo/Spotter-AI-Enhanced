"use client"

import { Login } from "@/components/auth/login"
import { Header } from "@/components/layout/header"
import { MobileNav } from "@/components/layout/mobile-nav"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus } from "lucide-react"
import { useSession } from "next-auth/react"

export default function AddPage() {
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
              Add Workout
            </h1>
            <p className="text-text-secondary">
              Import or create a new workout
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Plus className="h-5 w-5" />
                <span>Add Workout Feature</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-text-secondary">
                This feature is coming soon. You&apos;ll be able to import workouts from images, text, or create them manually.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
      <MobileNav />
    </>
  )
}