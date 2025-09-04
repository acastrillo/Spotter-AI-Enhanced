
import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { Header } from "@/components/layout/header"
import { MobileNav } from "@/components/layout/mobile-nav"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Plus,
  Target,
  Dumbbell,
  Clock,
  Zap,
  Library,
  Calendar,
  TrendingUp
} from "lucide-react"
import Link from "next/link"

export default async function HomePage() {
  const session = await auth()

  if (!session) {
    redirect("/auth/login")
  }

  return (
    <>
      <Header />
      <main className="min-h-screen pb-20 md:pb-8 bg-background">
        <div className="container max-w-screen-xl mx-auto px-4 py-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-text-primary mb-2">
              Welcome back, {session?.user?.firstName || 'test'}!
            </h1>
            <p className="text-text-secondary">
              Ready to crush your fitness goals today?
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="bg-surface border-border transition-all duration-300 ease-out hover:border-primary/30 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 hover:scale-[1.02] cursor-pointer group">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-text-secondary uppercase tracking-wide group-hover:text-primary/80 transition-colors duration-200">
                      WORKOUTS THIS WEEK
                    </p>
                    <p className="text-3xl font-bold text-text-primary group-hover:text-primary transition-colors duration-200 group-hover:scale-110 transform origin-left">0</p>
                  </div>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                    <Target className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-surface border-border transition-all duration-300 ease-out hover:border-blue-500/30 hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1 hover:scale-[1.02] cursor-pointer group">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-text-secondary uppercase tracking-wide group-hover:text-blue-400 transition-colors duration-200">
                      TOTAL WORKOUTS
                    </p>
                    <p className="text-3xl font-bold text-text-primary group-hover:text-blue-400 transition-colors duration-200 group-hover:scale-110 transform origin-left">0</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center group-hover:bg-blue-500/20 group-hover:scale-110 transition-all duration-300">
                    <Dumbbell className="h-6 w-6 text-blue-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-surface border-border transition-all duration-300 ease-out hover:border-yellow-500/30 hover:shadow-xl hover:shadow-yellow-500/10 hover:-translate-y-1 hover:scale-[1.02] cursor-pointer group">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-text-secondary uppercase tracking-wide group-hover:text-yellow-400 transition-colors duration-200">
                      HOURS TRAINED
                    </p>
                    <p className="text-3xl font-bold text-text-primary group-hover:text-yellow-400 transition-colors duration-200 group-hover:scale-110 transform origin-left">0h</p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-500/10 rounded-lg flex items-center justify-center group-hover:bg-yellow-500/20 group-hover:scale-110 transition-all duration-300">
                    <Clock className="h-6 w-6 text-yellow-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-surface border-border transition-all duration-300 ease-out hover:border-green-500/30 hover:shadow-xl hover:shadow-green-500/10 hover:-translate-y-1 hover:scale-[1.02] cursor-pointer group">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-text-secondary uppercase tracking-wide group-hover:text-green-400 transition-colors duration-200">
                      STREAK
                    </p>
                    <p className="text-3xl font-bold text-text-primary group-hover:text-green-400 transition-colors duration-200 group-hover:scale-110 transform origin-left">0 days</p>
                  </div>
                  <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center group-hover:bg-green-500/20 group-hover:scale-110 transition-all duration-300">
                    <Zap className="h-6 w-6 text-green-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-text-primary mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href="/add">
                <Card className="bg-surface border-border transition-all duration-300 ease-out hover:border-primary/50 hover:shadow-xl hover:shadow-primary/20 hover:-translate-y-2 hover:scale-[1.03] cursor-pointer group relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <CardContent className="p-6 relative z-10">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-primary/30">
                        <Plus className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-text-primary group-hover:text-primary transition-colors duration-200">Add Workout</h3>
                        <p className="text-sm text-text-secondary group-hover:text-text-primary transition-colors duration-200">Import or create a new workout</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/library">
                <Card className="bg-surface border-border transition-all duration-300 ease-out hover:border-purple-500/50 hover:shadow-xl hover:shadow-purple-500/20 hover:-translate-y-2 hover:scale-[1.03] cursor-pointer group relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <CardContent className="p-6 relative z-10">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-surface-elevated rounded-lg flex items-center justify-center group-hover:bg-purple-500/20 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                        <Library className="h-6 w-6 text-text-primary group-hover:text-purple-400 transition-colors duration-200" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-text-primary group-hover:text-purple-400 transition-colors duration-200">Browse Library</h3>
                        <p className="text-sm text-text-secondary group-hover:text-text-primary transition-colors duration-200">View your saved workouts</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/calendar">
                <Card className="bg-surface border-border transition-all duration-300 ease-out hover:border-orange-500/50 hover:shadow-xl hover:shadow-orange-500/20 hover:-translate-y-2 hover:scale-[1.03] cursor-pointer group relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <CardContent className="p-6 relative z-10">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-surface-elevated rounded-lg flex items-center justify-center group-hover:bg-orange-500/20 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                        <Calendar className="h-6 w-6 text-text-primary group-hover:text-orange-400 transition-colors duration-200" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-text-primary group-hover:text-orange-400 transition-colors duration-200">View Calendar</h3>
                        <p className="text-sm text-text-secondary group-hover:text-text-primary transition-colors duration-200">See your workout schedule</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <h2 className="text-xl font-semibold text-text-primary mb-4">Recent Activity</h2>
            <Card className="bg-surface border-border">
              <CardContent className="p-8 text-center">
                <div className="flex items-center justify-center mb-4">
                  <TrendingUp className="h-12 w-12 text-text-secondary" />
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">No recent activity</h3>
                <p className="text-text-secondary mb-6">
                  Start by adding your first workout to see your progress here.
                </p>
                <Link href="/add">
                  <Button className="bg-primary hover:bg-primary/90 text-white">
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
