
import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { Header } from "@/components/layout/header"
import { MobileNav } from "@/components/layout/mobile-nav"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Target,
  TrendingUp,
  Clock
} from "lucide-react"

export default async function CalendarPage() {
  const session = await auth()

  if (!session) {
    redirect("/auth/login")
  }

  const currentDate = new Date()
  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  // Generate calendar days (simplified)
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()
  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay()
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const emptyDays = Array.from({ length: firstDay }, (_, i) => null)

  return (
    <>
      <Header />
      <main className="min-h-screen pb-20 md:pb-8">
        <div className="container max-w-screen-xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-text-primary">Workout Calendar</h1>
              <p className="text-text-secondary mt-1">Track your fitness journey</p>
            </div>
            <Button asChild>
              <a href="/add">
                <Plus className="h-4 w-4 mr-2" />
                Schedule Workout
              </a>
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Calendar */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">{monthName}</CardTitle>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="icon">
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon">
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Week Headers */}
                  <div className="grid grid-cols-7 gap-1 mb-4">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                      <div key={day} className="p-2 text-center text-sm font-medium text-text-secondary">
                        {day}
                      </div>
                    ))}
                  </div>
                  
                  {/* Calendar Grid */}
                  <div className="grid grid-cols-7 gap-1">
                    {[...emptyDays, ...days].map((day, index) => (
                      <div 
                        key={index} 
                        className={`
                          aspect-square flex items-center justify-center text-sm rounded-lg transition-colors cursor-pointer
                          ${day ? 'hover:bg-surface' : ''}
                          ${day === currentDate.getDate() ? 'bg-primary text-primary-foreground font-bold' : 'text-text-primary'}
                        `}
                      >
                        {day}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* This Month Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">This Month</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Target className="h-4 w-4 text-primary" />
                      <span className="text-sm text-text-secondary">Workouts</span>
                    </div>
                    <span className="font-semibold text-text-primary">0</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-secondary" />
                      <span className="text-sm text-text-secondary">Hours</span>
                    </div>
                    <span className="font-semibold text-text-primary">0h</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-4 w-4 text-success" />
                      <span className="text-sm text-text-secondary">Streak</span>
                    </div>
                    <span className="font-semibold text-text-primary">0 days</span>
                  </div>
                </CardContent>
              </Card>

              {/* Upcoming Workouts */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Upcoming</CardTitle>
                  <CardDescription>Your scheduled workouts</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <CalendarIcon className="h-12 w-12 text-text-secondary mx-auto mb-4" />
                    <p className="text-text-secondary text-sm mb-4">
                      No workouts scheduled
                    </p>
                    <Button size="sm" variant="outline" asChild>
                      <a href="/add">Schedule One</a>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Weekly Goal */}
              <Card className="border-primary/20 bg-primary/5">
                <CardHeader>
                  <CardTitle className="text-lg">Weekly Goal</CardTitle>
                  <CardDescription>Stay consistent with your training</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-text-secondary">Progress</span>
                      <span className="text-text-primary font-medium">0/3 workouts</span>
                    </div>
                    <div className="w-full bg-border rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: '0%' }}></div>
                    </div>
                    <p className="text-xs text-text-secondary">
                      Keep going! You&apos;re on track to reach your weekly goal.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <MobileNav />
    </>
  )
}
