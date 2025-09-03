"use client"

import { useAuthStore } from "@/store"
import { Login } from "@/components/auth/login"
import { Header } from "@/components/layout/header"
import { MobileNav } from "@/components/layout/mobile-nav"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Calendar, 
  Target, 
  TrendingUp, 
  Dumbbell,
  Plus,
  Library,
  Clock,
  Award
} from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  const { isAuthenticated, user } = useAuthStore()

  if (!isAuthenticated) {
    return <Login />
  }

  const stats = [
    {
      title: "Workouts This Week",
      value: "0",
      icon: Target,
      color: "text-primary",
    },
    {
      title: "Total Workouts",
      value: "0", 
      icon: Dumbbell,
      color: "text-secondary",
    },
    {
      title: "Hours Trained",
      value: "0h",
      icon: Clock,
      color: "text-rest",
    },
    {
      title: "Streak",
      value: "0 days",
      icon: Award,
      color: "text-success",
    },
  ]

  const quickActions = [
    {
      title: "Add Workout",
      description: "Import or create a new workout",
      href: "/add",
      icon: Plus,
      primary: true,
    },
    {
      title: "Browse Library", 
      description: "View your saved workouts",
      href: "/library",
      icon: Library,
    },
    {
      title: "View Calendar",
      description: "See your workout schedule",
      href: "/calendar", 
      icon: Calendar,
    },
  ]

  return (
    <>
      <Header />
      <main className="min-h-screen pb-20 md:pb-8 flex justify-center">
        <div className="w-full max-w-4xl mx-auto px-4 py-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-text-primary mb-2">
              Welcome back, {user?.firstName || "there"}!
            </h1>
            <p className="text-text-secondary">
              Ready to crush your fitness goals today?
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <Card key={index} className="hover:shadow-medium transition-shadow duration-200">
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

          {/* Quick Actions */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-text-primary mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {quickActions.map((action, index) => {
                const Icon = action.icon
                return (
                  <Link key={index} href={action.href}>
                    <Card className={`hover:shadow-lg transition-all duration-200 cursor-pointer group ${
                      action.primary ? 'border-primary/30 bg-primary/10 hover:bg-primary/15' : 'hover:border-border/80'
                    }`}>
                      <CardHeader className="pb-4">
                        <div className="flex items-center space-x-3">
                          <div 
                            className={`p-3 rounded-xl transition-colors duration-200 ${
                              action.primary 
                                ? 'bg-primary text-primary-foreground group-hover:bg-primary/90' 
                                : 'bg-surface text-text-secondary group-hover:bg-surface/80'
                            }`}
                          >
                            <Icon className="h-5 w-5" />
                          </div>
                          <div>
                            <CardTitle className="text-base font-semibold">{action.title}</CardTitle>
                            <CardDescription className="text-sm mt-1">
                              {action.description}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <h2 className="text-xl font-semibold text-text-primary mb-4">Recent Activity</h2>
            <Card className="border-0">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-8 w-8 text-text-secondary" />
                </div>
                <h3 className="text-lg font-medium text-text-primary mb-2">No recent activity</h3>
                <p className="text-text-secondary mb-6 max-w-md mx-auto">
                  Start by adding your first workout to see your progress here.
                </p>
                <Link href="/add">
                  <Button size="lg" className="font-semibold">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Workout
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <MobileNav />
    </>
  )
}