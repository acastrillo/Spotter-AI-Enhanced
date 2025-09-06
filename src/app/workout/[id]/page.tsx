"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { useAuthStore } from "@/store"
import { Login } from "@/components/auth/login"
import { Header } from "@/components/layout/header"
import { MobileNav } from "@/components/layout/mobile-nav"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Play,
  Edit,
  ExternalLink,
  ArrowLeft,
  Clock,
  Dumbbell,
  Calendar,
  User,
  Instagram
} from "lucide-react"

interface Workout {
  id: string
  title: string
  content: string
  parsedData: any
  author: any
  createdAt: string
  source: string
  type: string
}

export default function WorkoutDetailPage() {
  const { isAuthenticated } = useAuthStore()
  const params = useParams()
  const router = useRouter()
  const [workout, setWorkout] = useState<Workout | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!params.id) return

    // Load workout from localStorage
    const savedWorkouts = JSON.parse(localStorage.getItem('workouts') || '[]')
    const foundWorkout = savedWorkouts.find((w: Workout) => w.id === params.id)
    
    if (foundWorkout) {
      setWorkout(foundWorkout)
    } else {
      // Workout not found, redirect to library
      router.push('/library')
    }
    setLoading(false)
  }, [params.id, router])

  if (!isAuthenticated) {
    return <Login />
  }

  if (loading) {
    return (
      <>
        <Header />
        <main className="min-h-screen pb-20 md:pb-8 flex justify-center">
          <div className="w-full max-w-4xl mx-auto px-4 py-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-300 rounded mb-4"></div>
              <div className="h-64 bg-gray-300 rounded"></div>
            </div>
          </div>
        </main>
        <MobileNav />
      </>
    )
  }

  if (!workout) {
    return (
      <>
        <Header />
        <main className="min-h-screen pb-20 md:pb-8 flex justify-center">
          <div className="w-full max-w-4xl mx-auto px-4 py-8">
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-text-primary mb-2">Workout not found</h2>
              <p className="text-text-secondary mb-4">The workout you're looking for doesn't exist.</p>
              <Link href="/library">
                <Button>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Library
                </Button>
              </Link>
            </div>
          </div>
        </main>
        <MobileNav />
      </>
    )
  }

  const contentLines = workout.content.split('\n').filter(line => line.trim())
  const exercises = workout.parsedData?.exercises || []
  const equipmentTags = workout.parsedData?.equipment || []

  return (
    <>
      <Header />
      <main className="min-h-screen pb-20 md:pb-8 flex justify-center">
        <div className="w-full max-w-4xl mx-auto px-4 py-8">
          {/* Back Button */}
          <Link href="/library" className="inline-flex items-center text-text-secondary hover:text-text-primary mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Library
          </Link>

          {/* Workout Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-text-primary mb-4">{workout.title}</h1>
            
            {/* Workout Meta Info */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-text-secondary mb-4">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                {new Date(workout.createdAt).toLocaleDateString()}
              </div>
              <div className="flex items-center">
                <Dumbbell className="h-4 w-4 mr-1" />
                {exercises.length} exercises
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                0 min
              </div>
              {workout.author && (
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-1" />
                  @{workout.author.username}
                </div>
              )}
            </div>

            {/* Equipment Tags */}
            {equipmentTags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {equipmentTags.map((tag: string, index: number) => (
                  <Badge key={index} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              <Button size="lg" disabled className="flex items-center space-x-2 opacity-60">
                <Play className="h-4 w-4" />
                <span>Start Workout (Coming Soon)</span>
              </Button>
              <Link href={`/workout/${workout.id}/edit`}>
                <Button variant="outline" size="lg" className="flex items-center space-x-2">
                  <Edit className="h-4 w-4" />
                  <span>Edit Workout</span>
                </Button>
              </Link>
              {workout.source !== 'manual' && workout.source && (
                <a 
                  href={workout.source} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex"
                >
                  <Button variant="outline" size="lg" className="flex items-center space-x-2">
                    <Instagram className="h-4 w-4" />
                    <span>View Original</span>
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </a>
              )}
            </div>
          </div>

          {/* Workout Content */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Full Content */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Dumbbell className="h-5 w-5 mr-2" />
                  Workout Content
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {contentLines.map((line, index) => (
                    <p key={index} className="text-text-secondary">
                      {line}
                    </p>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Parsed Exercises */}
            {exercises.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Play className="h-5 w-5 mr-2" />
                    Parsed Exercises ({exercises.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {exercises.map((exercise: any, index: number) => (
                      <div key={index} className="border-l-2 border-primary pl-4">
                        <h4 className="font-medium text-text-primary">{exercise.name}</h4>
                        <div className="text-sm text-text-secondary">
                          {exercise.sets && exercise.reps && (
                            <span>{exercise.sets} sets × {exercise.reps} reps</span>
                          )}
                          {exercise.time && (
                            <span className="ml-2">• {exercise.time}</span>
                          )}
                          {exercise.weight && (
                            <span className="ml-2">• {exercise.weight}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
      <MobileNav />
    </>
  )
}