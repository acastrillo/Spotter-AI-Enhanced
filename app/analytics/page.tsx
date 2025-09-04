"use client"

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation" 
import { useEffect } from "react"
import { BarChart3, TrendingUp, Target, Calendar } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MobileNav } from "@/components/layout/mobile-nav"

export default function AnalyticsPage() {
  const { data: session, status } = useSession()

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/auth/login")
    }
  }, [status])

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-border border-t-primary"></div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  const stats = [
    {
      title: "Total Workouts",
      value: "0",
      icon: Target,
      color: "text-primary"
    },
    {
      title: "This Week",
      value: "0",
      icon: Calendar,
      color: "text-accent"
    },
    {
      title: "Average Duration",
      value: "0min",
      icon: TrendingUp,
      color: "text-success"
    }
  ]

  return (
    <>
      <main className="min-h-screen pb-20 md:pb-8 bg-background">
        <div className="container-padding py-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-text-primary mb-2">
              Analytics
            </h1>
            <p className="text-text-secondary">
              Track your fitness progress and performance
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-text-secondary uppercase tracking-wide font-medium">
                          {stat.title}
                        </p>
                        <p className="text-2xl font-bold text-text-primary mt-1">
                          {stat.value}
                        </p>
                      </div>
                      <Icon className={`h-8 w-8 ${stat.color}`} />
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Empty State */}
          <Card>
            <CardContent className="p-8 text-center">
              <BarChart3 className="h-12 w-12 text-text-secondary mx-auto mb-4" />
              <h3 className="text-lg font-medium text-text-primary mb-2">
                No data to analyze yet
              </h3>
              <p className="text-text-secondary">
                Start logging workouts to see your progress and analytics here.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
      <MobileNav />
    </>
  )
}