
"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Header } from "@/components/layout/header"
import { MobileNav } from "@/components/layout/mobile-nav"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Search,
  Filter,
  Library as LibraryIcon,
  Plus,
  Clock,
  Target,
  Dumbbell
} from "lucide-react"

interface Workout {
  id: string
  title: string
  createdAt: string
  totalTimeEstimateSec: number | null
  bodyParts: string[]
  equipment: string[]
  workoutTypes: string[]
  steps: Array<{
    type: string
    exercise: string | null
    raw: string
  }>
  sessionCount: number
}

export default function LibraryPage() {
  const { data: session, status } = useSession() || {}
  const router = useRouter()
  const [activeFilter, setActiveFilter] = useState("All")
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login")
      return
    }
    
    if (status === "authenticated" && session) {
      fetchWorkouts()
    }
  }, [status, session, router])

  const fetchWorkouts = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/workouts')
      
      if (!response.ok) {
        throw new Error('Failed to fetch workouts')
      }
      
      const data = await response.json()
      setWorkouts(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load workouts')
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (totalSec: number | null) => {
    if (!totalSec) return 'Unknown duration'
    const minutes = Math.floor(totalSec / 60)
    if (minutes < 60) return `${minutes} min`
    const hours = Math.floor(minutes / 60)
    const remainingMin = minutes % 60
    return `${hours}h ${remainingMin}m`
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-border border-t-primary"></div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  const handleFilterClick = () => {
    alert("Advanced filters will be available in the next update!")
  }

  const handleTagFilter = (tag: string) => {
    setActiveFilter(tag)
    // In a real implementation, this would filter the workouts
    console.log(`Filtering by: ${tag}`)
  }

  const filterTags = ["All", "Upper Body", "Lower Body", "Cardio", "Strength", "HIIT"]

  return (
    <>
      <Header />
      <main className="min-h-screen pb-20 md:pb-8">
        <div className="container max-w-screen-xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-text-primary">Workout Library</h1>
              <p className="text-text-secondary mt-1">Your saved workouts and routines</p>
            </div>
            <Button asChild>
              <a href="/add">
                <Plus className="h-4 w-4 mr-2" />
                Add Workout
              </a>
            </Button>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Input 
                placeholder="Search workouts..." 
                icon={<Search className="h-4 w-4" />}
              />
            </div>
            <Button variant="outline" className="flex items-center space-x-2" onClick={handleFilterClick}>
              <Filter className="h-4 w-4" />
              <span>Filter</span>
            </Button>
          </div>

          {/* Filter Tags */}
          <div className="flex flex-wrap gap-2 mb-8">
            {filterTags.map((tag) => (
              <Button 
                key={tag} 
                variant={tag === activeFilter ? "default" : "outline"} 
                size="sm"
                className="rounded-full"
                onClick={() => handleTagFilter(tag)}
              >
                {tag}
              </Button>
            ))}
          </div>

          {/* Error State */}
          {error && (
            <Card className="text-center p-8 border-destructive">
              <CardContent>
                <p className="text-destructive">{error}</p>
                <Button onClick={fetchWorkouts} className="mt-4">Try Again</Button>
              </CardContent>
            </Card>
          )}

          {/* Empty State */}
          {!error && workouts.length === 0 && (
            <Card className="text-center p-8">
              <CardContent className="space-y-4">
                <div className="mx-auto w-16 h-16 bg-surface rounded-full flex items-center justify-center">
                  <LibraryIcon className="h-8 w-8 text-text-secondary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-text-primary mb-2">
                    No workouts yet
                  </h3>
                  <p className="text-text-secondary mb-4 max-w-md mx-auto">
                    Your workout library is empty. Start by importing or creating your first workout.
                  </p>
                  <Button asChild>
                    <a href="/add">
                      <Plus className="h-4 w-4 mr-2" />
                      Import Your First Workout
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Workouts Grid */}
          {!error && workouts.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {workouts.map((workout) => (
                <Card key={workout.id} className="hover:shadow-lg transition-all duration-200">
                  <CardHeader>
                    <CardTitle className="text-lg">{workout.title}</CardTitle>
                    <CardDescription>
                      {new Date(workout.createdAt).toLocaleDateString()} · {workout.steps.length} steps
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Workout Summary */}
                    <div className="text-sm text-text-secondary">
                      {workout.steps.filter(s => s.type === 'exercise').length} exercises
                      {workout.totalTimeEstimateSec && ` · ${formatTime(workout.totalTimeEstimateSec)}`}
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1">
                      {workout.bodyParts.map((part) => (
                        <span key={part} className="px-2 py-1 text-xs bg-primary/10 text-primary rounded-full">
                          {part}
                        </span>
                      ))}
                      {workout.equipment.map((equip) => (
                        <span key={equip} className="px-2 py-1 text-xs bg-secondary/10 text-secondary rounded-full">
                          {equip}
                        </span>
                      ))}
                    </div>

                    {/* Preview Steps */}
                    <div className="space-y-1">
                      {workout.steps.slice(0, 2).map((step, index) => (
                        <div key={index} className="text-sm text-text-secondary truncate">
                          {index + 1}. {step.exercise || step.raw}
                        </div>
                      ))}
                      {workout.steps.length > 2 && (
                        <div className="text-xs text-text-secondary">
                          +{workout.steps.length - 2} more steps...
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => router.push(`/library/${workout.id}`)}
                      >
                        View Details
                      </Button>
                      <Button 
                        size="sm" 
                        className="flex-1"
                        onClick={() => router.push(`/workout/${workout.id}/run`)}
                      >
                        Start Workout
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Stats Preview */}
          {workouts.length > 0 && (
            <div className="grid grid-cols-3 gap-4 mt-8">
              <Card>
                <CardContent className="p-4 text-center">
                  <Dumbbell className="h-8 w-8 text-primary mx-auto mb-2" />
                  <p className="text-2xl font-bold text-text-primary">{workouts.length}</p>
                  <p className="text-sm text-text-secondary">Total Workouts</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Target className="h-8 w-8 text-secondary mx-auto mb-2" />
                  <p className="text-2xl font-bold text-text-primary">
                    {new Set(workouts.flatMap(w => w.bodyParts)).size}
                  </p>
                  <p className="text-sm text-text-secondary">Body Parts</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Clock className="h-8 w-8 text-rest mx-auto mb-2" />
                  <p className="text-2xl font-bold text-text-primary">
                    {workouts.reduce((total, w) => total + (w.totalTimeEstimateSec || 0), 0) > 0 
                      ? formatTime(workouts.reduce((total, w) => total + (w.totalTimeEstimateSec || 0), 0))
                      : '0h'
                    }
                  </p>
                  <p className="text-sm text-text-secondary">Total Time</p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
      <MobileNav />
    </>
  )
}
