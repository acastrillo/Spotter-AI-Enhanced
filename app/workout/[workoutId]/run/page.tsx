
"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useParams } from "next/navigation"
import { Header } from "@/components/layout/header"
import { MobileNav } from "@/components/layout/mobile-nav"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { SocialShare } from "@/components/ui/social-share"
import { useToast } from "@/hooks/use-toast"
import { 
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  Target,
  SkipForward,
  Pause,
  Play,
  Flag,
  RotateCcw,
  Share2
} from "lucide-react"

interface WorkoutStep {
  id: string
  order: number
  type: string
  raw: string
  exercise: string | null
  sets: number | null
  repsJson: string | null
  duration: number | null
  weight: number | null
  distance: number | null
  timesThrough: number | null
  workoutTypeHint: string | null
}

interface Workout {
  id: string
  title: string
  totalTimeEstimateSec: number | null
  steps: WorkoutStep[]
}

interface WorkoutSession {
  id: string
  workoutId: string
  userId: string
  startedAt: string
  endedAt: string | null
  elapsedSec: number | null
  rpe: number | null
  notes: string | null
  workout: Workout
}

interface StepProgress {
  stepId: string
  completed: boolean
  setsCompleted: number
  totalSets: number
  notes?: string
  startTime?: Date
  endTime?: Date
  totalTimeSpent?: number // in seconds
}

export default function WorkoutRunnerPage() {
  const { data: session, status } = useSession() || {}
  const router = useRouter()
  const params = useParams()
  const workoutId = params?.workoutId as string
  const { toast } = useToast()

  const [workoutSession, setWorkoutSession] = useState<WorkoutSession | null>(null)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [stepProgress, setStepProgress] = useState<Record<string, StepProgress>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [currentExerciseStartTime, setCurrentExerciseStartTime] = useState<Date | null>(null)
  const [currentExerciseSeconds, setCurrentExerciseSeconds] = useState(0)
  const [showShareModal, setShowShareModal] = useState(false)
  const [workoutCompleted, setWorkoutCompleted] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login")
      return
    }

    if (status === "authenticated" && workoutId) {
      startWorkoutSession()
    }
  }, [status, workoutId, router])

  // Timer effects
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    
    if (sessionStartTime && !workoutSession?.endedAt) {
      interval = setInterval(() => {
        const now = new Date()
        const elapsed = Math.floor((now.getTime() - sessionStartTime.getTime()) / 1000)
        setElapsedSeconds(elapsed)
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [sessionStartTime, workoutSession?.endedAt])

  // Current exercise timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    
    if (currentExerciseStartTime && !workoutSession?.endedAt) {
      interval = setInterval(() => {
        const now = new Date()
        const elapsed = Math.floor((now.getTime() - currentExerciseStartTime.getTime()) / 1000)
        setCurrentExerciseSeconds(elapsed)
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [currentExerciseStartTime, workoutSession?.endedAt])

  // Start exercise timer when moving to a new exercise step
  useEffect(() => {
    if (workoutSession && currentStepIndex >= 0) {
      const currentStep = workoutSession.workout.steps[currentStepIndex]
      if (currentStep && currentStep.type === 'exercise') {
        const now = new Date()
        setCurrentExerciseStartTime(now)
        setCurrentExerciseSeconds(0)
        
        // Update step progress with start time
        setStepProgress(prev => ({
          ...prev,
          [currentStep.id]: {
            ...prev[currentStep.id],
            startTime: now
          }
        }))
      } else {
        // Reset exercise timer for non-exercise steps
        setCurrentExerciseStartTime(null)
        setCurrentExerciseSeconds(0)
      }
    }
  }, [currentStepIndex, workoutSession])

  const startWorkoutSession = async () => {
    try {
      setLoading(true)
      
      // Start new session
      const sessionResponse = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workoutId })
      })

      if (!sessionResponse.ok) {
        throw new Error('Failed to start workout session')
      }

      const sessionData = await sessionResponse.json()
      
      // Fetch session details with workout
      const detailResponse = await fetch(`/api/sessions/${sessionData.session.id}`)
      
      if (!detailResponse.ok) {
        throw new Error('Failed to fetch session details')
      }

      const fullSession = await detailResponse.json()
      setWorkoutSession(fullSession)
      setSessionStartTime(new Date(fullSession.startedAt))
      
      // Initialize step progress
      const initialProgress: Record<string, StepProgress> = {}
      fullSession.workout.steps.forEach((step: WorkoutStep) => {
        if (step.type === 'exercise') {
          initialProgress[step.id] = {
            stepId: step.id,
            completed: false,
            setsCompleted: 0,
            totalSets: step.sets || 1
          }
        }
      })
      setStepProgress(initialProgress)
      
      // Load saved progress from localStorage
      const savedProgress = localStorage.getItem(`workout-session-${fullSession.id}`)
      if (savedProgress) {
        const parsed = JSON.parse(savedProgress)
        setStepProgress(parsed.stepProgress || initialProgress)
        setCurrentStepIndex(parsed.currentStepIndex || 0)
      }

      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start workout')
      toast({
        title: "Error",
        description: "Failed to start workout session",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const saveProgressToLocal = () => {
    if (workoutSession) {
      const progressData = {
        sessionId: workoutSession.id,
        currentStepIndex,
        stepProgress,
        timestamp: new Date().toISOString()
      }
      localStorage.setItem(`workout-session-${workoutSession.id}`, JSON.stringify(progressData))
    }
  }

  const markSetComplete = (stepId: string) => {
    setStepProgress(prev => {
      const current = prev[stepId]
      if (!current) return prev
      
      const newSetsCompleted = Math.min(current.setsCompleted + 1, current.totalSets)
      const updated = {
        ...prev,
        [stepId]: {
          ...current,
          setsCompleted: newSetsCompleted,
          completed: newSetsCompleted >= current.totalSets
        }
      }
      
      // Save to localStorage immediately
      setTimeout(() => saveProgressToLocal(), 100)
      
      return updated
    })

    toast({
      title: "Set Complete!",
      description: "Great work! Keep going.",
    })
  }

  const resetStep = (stepId: string) => {
    setStepProgress(prev => ({
      ...prev,
      [stepId]: {
        ...prev[stepId],
        setsCompleted: 0,
        completed: false
      }
    }))

    setTimeout(() => saveProgressToLocal(), 100)
  }

  const nextStep = () => {
    if (workoutSession && currentStepIndex < workoutSession.workout.steps.length - 1) {
      // Save end time for current exercise before moving to next
      const currentStep = workoutSession.workout.steps[currentStepIndex]
      if (currentStep && currentStep.type === 'exercise' && currentExerciseStartTime) {
        const endTime = new Date()
        const timeSpent = Math.floor((endTime.getTime() - currentExerciseStartTime.getTime()) / 1000)
        
        setStepProgress(prev => ({
          ...prev,
          [currentStep.id]: {
            ...prev[currentStep.id],
            endTime,
            totalTimeSpent: (prev[currentStep.id]?.totalTimeSpent || 0) + timeSpent
          }
        }))
      }
      
      setCurrentStepIndex(prev => prev + 1)
      setTimeout(() => saveProgressToLocal(), 100)
    }
  }

  const prevStep = () => {
    if (currentStepIndex > 0) {
      // Save end time for current exercise before moving to previous
      if (workoutSession) {
        const currentStep = workoutSession.workout.steps[currentStepIndex]
        if (currentStep && currentStep.type === 'exercise' && currentExerciseStartTime) {
          const endTime = new Date()
          const timeSpent = Math.floor((endTime.getTime() - currentExerciseStartTime.getTime()) / 1000)
          
          setStepProgress(prev => ({
            ...prev,
            [currentStep.id]: {
              ...prev[currentStep.id],
              endTime,
              totalTimeSpent: (prev[currentStep.id]?.totalTimeSpent || 0) + timeSpent
            }
          }))
        }
      }
      
      setCurrentStepIndex(prev => prev - 1)
      setTimeout(() => saveProgressToLocal(), 100)
    }
  }

  const completeWorkout = async () => {
    if (!workoutSession) return

    try {
      const endTime = new Date()
      
      // Save timing for the final exercise if we're on an exercise step
      const currentStep = workoutSession.workout.steps[currentStepIndex]
      if (currentStep && currentStep.type === 'exercise' && currentExerciseStartTime) {
        const timeSpent = Math.floor((endTime.getTime() - currentExerciseStartTime.getTime()) / 1000)
        
        setStepProgress(prev => ({
          ...prev,
          [currentStep.id]: {
            ...prev[currentStep.id],
            endTime,
            totalTimeSpent: (prev[currentStep.id]?.totalTimeSpent || 0) + timeSpent
          }
        }))
      }
      
      await fetch(`/api/sessions/${workoutSession.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endedAt: endTime.toISOString(),
          elapsedSec: elapsedSeconds,
          rpe: 7, // Default RPE, could be user input later
          notes: 'Completed via workout runner'
        })
      })

      // Clear localStorage
      localStorage.removeItem(`workout-session-${workoutSession.id}`)

      // Mark workout as completed and show sharing options
      setWorkoutCompleted(true)

      toast({
        title: "Workout Complete! 🎉",
        description: `Great job! You completed "${workoutSession.workout.title}" in ${formatTime(elapsedSeconds)}.`,
      })

      // Show sharing modal after a brief celebration
      setTimeout(() => {
        setShowShareModal(true)
      }, 1500)

    } catch (err) {
      console.error('Error completing workout:', err)
      toast({
        title: "Error",
        description: "Failed to save workout completion",
        variant: "destructive",
      })
    }
  }

  const getWorkoutSummary = () => {
    if (!workoutSession) return null

    const exerciseSteps = workoutSession.workout.steps.filter(step => step.type === 'exercise')
    const totalReps = exerciseSteps.reduce((sum, step) => {
      const progress = stepProgress[step.id]
      if (progress && step.repsJson) {
        // Simple parsing for demo - would be more sophisticated in production
        const reps = parseInt(step.repsJson) || 0
        return sum + (progress.setsCompleted * reps)
      }
      return sum
    }, 0)

    const totalWeight = exerciseSteps.reduce((sum, step) => {
      const progress = stepProgress[step.id]
      if (progress && step.weight) {
        return sum + (progress.setsCompleted * step.weight)
      }
      return sum
    }, 0)

    // Calculate per-exercise timing breakdown
    const exerciseTimings = exerciseSteps.map(step => {
      const progress = stepProgress[step.id]
      return {
        exercise: step.exercise || 'Unknown Exercise',
        timeSpent: progress?.totalTimeSpent || 0,
        setsCompleted: progress?.setsCompleted || 0,
        totalSets: progress?.totalSets || 0
      }
    }).filter(timing => timing.timeSpent > 0)

    return {
      title: workoutSession.workout.title,
      duration: formatTime(elapsedSeconds),
      exercises: exerciseSteps.length,
      totalReps: totalReps > 0 ? totalReps : undefined,
      totalWeight: totalWeight > 0 ? totalWeight : undefined,
      exerciseTimings,
      date: new Date()
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const formatReps = (repsJson: string | null, sets: number | null) => {
    if (!repsJson && !sets) return ''
    if (sets && repsJson) return `${sets} × ${repsJson}`
    if (sets) return `${sets} sets`
    if (repsJson) return repsJson
    return ''
  }

  const calculateOverallProgress = () => {
    if (!workoutSession) return 0
    
    const exerciseSteps = workoutSession.workout.steps.filter(step => step.type === 'exercise')
    if (exerciseSteps.length === 0) return 0

    const totalSets = exerciseSteps.reduce((sum, step) => sum + (step.sets || 1), 0)
    const completedSets = exerciseSteps.reduce((sum, step) => {
      const progress = stepProgress[step.id]
      return sum + (progress?.setsCompleted || 0)
    }, 0)

    return totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (!session) {
    return null
  }

  if (error) {
    return (
      <>
        <Header />
        <main className="min-h-screen pb-20 md:pb-8">
          <div className="container max-w-screen-lg mx-auto px-4 py-8">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-text-primary mb-2">Unable to Start Workout</h1>
              <p className="text-text-secondary mb-4">{error}</p>
              <Button onClick={() => router.push(`/library/${workoutId}`)} variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Workout Details
              </Button>
            </div>
          </div>
        </main>
        <MobileNav />
      </>
    )
  }

  if (!workoutSession) {
    return (
      <>
        <Header />
        <main className="min-h-screen pb-20 md:pb-8">
          <div className="container max-w-screen-lg mx-auto px-4 py-8">
            <LoadingSpinner />
          </div>
        </main>
        <MobileNav />
      </>
    )
  }

  const currentStep = workoutSession.workout.steps[currentStepIndex]
  const isLastStep = currentStepIndex === workoutSession.workout.steps.length - 1
  const currentStepProgress = stepProgress[currentStep.id]
  const overallProgress = calculateOverallProgress()

  return (
    <>
      <Header />
      <main className="min-h-screen pb-20 md:pb-8 bg-background">
        <div className="container max-w-screen-lg mx-auto px-4 py-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <Button 
              onClick={() => router.push(`/library/${workoutId}`)} 
              variant="ghost"
              size="sm"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Exit
            </Button>
            
            <div className="text-center">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-text-secondary">
                  <Clock className="h-4 w-4" />
                  <span className="font-medium">Total: {formatTime(elapsedSeconds)}</span>
                </div>
                {currentStep?.type === 'exercise' && (
                  <div className="flex items-center gap-2 text-xs text-text-secondary">
                    <Target className="h-3 w-3" />
                    <span>Exercise: {formatTime(currentExerciseSeconds)}</span>
                  </div>
                )}
              </div>
            </div>

            <Badge variant="secondary" className="text-xs">
              {currentStepIndex + 1} of {workoutSession.workout.steps.length}
            </Badge>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between text-sm text-text-secondary mb-2">
              <span>Overall Progress</span>
              <span>{overallProgress}% Complete</span>
            </div>
            <Progress value={overallProgress} className="h-2" />
          </div>

          {/* Current Step */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                    {currentStep.order + 1}
                  </div>
                  <div>
                    <CardTitle className="text-lg">
                      {currentStep.exercise || 'Exercise'}
                    </CardTitle>
                    <CardDescription>
                      {currentStep.type === 'exercise' && formatReps(currentStep.repsJson, currentStep.sets)}
                      {currentStep.duration && ` • ${currentStep.duration}s duration`}
                      {currentStep.weight && ` • ${currentStep.weight} lbs`}
                    </CardDescription>
                  </div>
                </div>
                
                <Badge variant={currentStep.type === 'exercise' ? 'default' : 'secondary'}>
                  {currentStep.type}
                </Badge>
              </div>
            </CardHeader>

            {currentStep.type === 'exercise' && currentStepProgress && (
              <CardContent>
                <div className="space-y-4">
                  {/* Set Progress */}
                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span>Sets Completed</span>
                      <span>
                        {currentStepProgress.setsCompleted} / {currentStepProgress.totalSets}
                      </span>
                    </div>
                    <Progress 
                      value={(currentStepProgress.setsCompleted / currentStepProgress.totalSets) * 100} 
                      className="h-2"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    {currentStepProgress.setsCompleted < currentStepProgress.totalSets ? (
                      <Button 
                        onClick={() => markSetComplete(currentStep.id)}
                        className="flex-1"
                        size="lg"
                      >
                        <CheckCircle2 className="h-5 w-5 mr-2" />
                        Complete Set {currentStepProgress.setsCompleted + 1}
                      </Button>
                    ) : (
                      <div className="flex gap-2 flex-1">
                        <Button 
                          onClick={() => resetStep(currentStep.id)}
                          variant="outline"
                          className="flex-1"
                        >
                          <RotateCcw className="h-4 w-4 mr-2" />
                          Reset
                        </Button>
                        {!isLastStep ? (
                          <Button 
                            onClick={nextStep}
                            className="flex-1"
                          >
                            Next Step
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </Button>
                        ) : (
                          <Button 
                            onClick={completeWorkout}
                            className="flex-1 bg-green-600 hover:bg-green-700"
                          >
                            <Flag className="h-4 w-4 mr-2" />
                            Finish Workout
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            )}

            {currentStep.type !== 'exercise' && (
              <CardContent>
                <div className="text-center space-y-4">
                  <p className="text-text-secondary">
                    {currentStep.raw}
                  </p>
                  <Button 
                    onClick={nextStep}
                    disabled={isLastStep}
                    className="w-full"
                  >
                    {isLastStep ? 'Last Step' : 'Continue'}
                    {!isLastStep && <ArrowRight className="h-4 w-4 ml-2" />}
                  </Button>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Navigation */}
          <div className="flex justify-between gap-4">
            <Button 
              onClick={prevStep}
              disabled={currentStepIndex === 0}
              variant="outline"
              size="lg"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            <Button 
              onClick={nextStep}
              disabled={isLastStep}
              variant="outline" 
              size="lg"
            >
              <SkipForward className="h-4 w-4 mr-2" />
              Skip Step
            </Button>
          </div>

          {/* Workout Overview */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-base">Workout: {workoutSession.workout.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-center">
                  <div className="font-semibold text-text-primary">{workoutSession.workout.steps.length}</div>
                  <div className="text-text-secondary">Total Steps</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-text-primary">
                    {workoutSession.workout.steps.filter(s => s.type === 'exercise').length}
                  </div>
                  <div className="text-text-secondary">Exercises</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Workout Completed Screen */}
        {workoutCompleted && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 flex items-center justify-center p-4 overflow-y-auto">
            <Card className="bg-surface border-border max-w-lg w-full text-center my-8">
              <CardContent className="p-8">
                <div className="mb-6">
                  <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="h-10 w-10 text-green-500" />
                  </div>
                  <h2 className="text-2xl font-bold text-text-primary mb-2">
                    Workout Complete! 🎉
                  </h2>
                  <p className="text-text-secondary">
                    Great job completing "{workoutSession?.workout.title}"
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                  <div className="bg-background/50 rounded-lg p-3">
                    <div className="font-bold text-text-primary">{formatTime(elapsedSeconds)}</div>
                    <div className="text-text-secondary">Total Duration</div>
                  </div>
                  <div className="bg-background/50 rounded-lg p-3">
                    <div className="font-bold text-text-primary">{overallProgress}%</div>
                    <div className="text-text-secondary">Complete</div>
                  </div>
                </div>

                {/* Exercise Timing Breakdown */}
                {(() => {
                  const summary = getWorkoutSummary()
                  const hasTimings = summary?.exerciseTimings && summary.exerciseTimings.length > 0
                  
                  return hasTimings ? (
                    <div className="mb-6">
                      <h3 className="text-sm font-semibold text-text-primary mb-3">Exercise Breakdown</h3>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {summary!.exerciseTimings.map((timing, index) => (
                          <div key={index} className="bg-background/30 rounded-lg p-3 text-left">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium text-text-primary truncate">
                                {timing.exercise}
                              </span>
                              <span className="text-sm text-text-secondary">
                                {formatTime(timing.timeSpent)}
                              </span>
                            </div>
                            <div className="text-xs text-text-secondary mt-1">
                              {timing.setsCompleted}/{timing.totalSets} sets completed
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null
                })()}

                <div className="flex gap-3">
                  <Button
                    onClick={() => setShowShareModal(true)}
                    className="flex-1 bg-primary hover:bg-primary/90"
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Share Achievement
                  </Button>
                  <Button
                    onClick={() => router.push('/library')}
                    variant="outline"
                    className="flex-1"
                  >
                    Done
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
      <MobileNav />

      {/* Social Share Modal */}
      {showShareModal && getWorkoutSummary() && (
        <SocialShare
          workout={getWorkoutSummary()!}
          isOpen={showShareModal}
          onClose={() => {
            setShowShareModal(false)
            // Navigate to library after closing share modal
            setTimeout(() => {
              router.push('/library')
            }, 500)
          }}
        />
      )}
    </>
  )
}
