
"use client"

import { useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState, Suspense } from "react"
import { Header } from "@/components/layout/header"
import { MobileNav } from "@/components/layout/mobile-nav"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  Save,
  Edit3,
  Clock,
  Target,
  Dumbbell,
  Timer,
  Hash,
  Loader2,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
  ArrowLeft,
  ExternalLink,
  Trash2,
  X,
  Undo2
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { ParsedWorkout, WorkoutStep } from "@/lib/workout-parser"
import Link from "next/link"

interface ParsedWorkoutData extends ParsedWorkout {
  sourceUrl?: string
  originalCaption?: string
}

function ReviewPageContent() {
  const { data: session, status } = useSession() || {}
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [workoutData, setWorkoutData] = useState<ParsedWorkoutData | null>(null)
  const [editableTitle, setEditableTitle] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [stepsToDelete, setStepsToDelete] = useState<Set<number>>(new Set())

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login")
      return
    }

    if (status === "loading") {
      return // Still loading, wait
    }

    if (!session) {
      console.error('No session found, redirecting to login')
      router.push("/auth/login")
      return
    }

    // Get workout data from URL params
    const dataParam = searchParams.get('data')
    if (!dataParam) {
      console.error('No workout data in URL params')
      router.push('/add')
      return
    }

    try {
      const parsed: ParsedWorkoutData = JSON.parse(decodeURIComponent(dataParam))
      console.log('Parsed workout data:', parsed)
      setWorkoutData(parsed)
      setEditableTitle(parsed.title || '')
    } catch (e) {
      console.error('Failed to parse workout data:', e)
      router.push('/add')
    }
  }, [status, session, router, searchParams])

  if (status === "loading" || !workoutData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-border border-t-primary"></div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  const handleStepEdit = (index: number, field: keyof WorkoutStep, value: any) => {
    setWorkoutData(prev => {
      if (!prev) return prev
      
      const newSteps = [...prev.steps]
      newSteps[index] = { ...newSteps[index], [field]: value }
      
      return { ...prev, steps: newSteps }
    })
  }

  const toggleStepDeletion = (index: number) => {
    setStepsToDelete(prev => {
      const newSet = new Set(prev)
      if (newSet.has(index)) {
        newSet.delete(index)
      } else {
        newSet.add(index)
      }
      return newSet
    })
  }

  const clearAllDeletions = () => {
    setStepsToDelete(new Set())
  }

  const deleteStepsByType = (type: string) => {
    if (!workoutData) return
    
    const indicesToDelete = new Set<number>()
    (workoutData.steps || []).forEach((step, index) => {
      if (step.type === type) {
        indicesToDelete.add(index)
      }
    })
    
    setStepsToDelete(prev => new Set([...prev, ...indicesToDelete]))
  }

  const saveWorkout = async () => {
    if (!workoutData) {
      setError('No workout data to save')
      return
    }

    if (!session) {
      setError('You must be logged in to save workouts')
      router.push("/auth/login")
      return
    }

    if (!session.user) {
      setError('Invalid session - please log in again')
      router.push("/auth/login")
      return
    }

    setIsSaving(true)
    setError(null)

    try {
      // Filter out steps marked for deletion
      const filteredSteps = (workoutData.steps || []).filter((_, index) => !stepsToDelete.has(index))
      
      const workoutToSave = {
        ...workoutData,
        title: (editableTitle || '').trim() || workoutData.title,
        steps: filteredSteps
      }

      console.log('Sending workout data:', workoutToSave)
      console.log('Current session:', session)
      
      const response = await fetch('/api/workouts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(workoutToSave),
      })

      console.log('Response status:', response.status)
      
      if (!response.ok) {
        const errorData = await response.json()
        console.error('API error response:', errorData)
        
        // Handle authentication errors specifically
        if (response.status === 401) {
          setError('Authentication failed - please log in again')
          router.push("/auth/login")
          return
        }
        
        throw new Error(errorData.error || `Failed to save workout (${response.status})`)
      }

      const savedWorkout = await response.json()
      console.log('Workout saved successfully:', savedWorkout.id)
      
      toast({
        title: "Success!",
        description: "Workout saved to your library.",
      })

      // For now, redirect to library since individual workout pages aren't implemented yet
      router.push('/library')

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save workout'
      console.error('Save workout error:', err)
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const formatDuration = (seconds?: number) => {
    if (!seconds) return null
    if (seconds < 60) return `${seconds}s`
    if (seconds < 3600) return `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`
    return `${Math.floor(seconds / 3600)}:${Math.floor((seconds % 3600) / 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`
  }

  const formatTime = (totalSec?: number) => {
    if (!totalSec) return 'Unknown duration'
    const minutes = Math.floor(totalSec / 60)
    if (minutes < 60) return `~${minutes} min`
    const hours = Math.floor(minutes / 60)
    const remainingMin = minutes % 60
    return `~${hours}h ${remainingMin}m`
  }

  const getStepIcon = (step: WorkoutStep) => {
    switch (step.type) {
      case 'rest':
        return <Timer className="h-4 w-4 text-rest" />
      case 'header':
        return <Hash className="h-4 w-4 text-secondary" />
      case 'time':
        return <Clock className="h-4 w-4 text-primary" />
      default:
        return <Target className="h-4 w-4 text-primary" />
    }
  }

  const getStepColor = (step: WorkoutStep) => {
    switch (step.type) {
      case 'rest':
        return 'border-l-rest bg-rest/5'
      case 'header':
        return 'border-l-secondary bg-secondary/5'
      case 'time':
        return 'border-l-primary bg-primary/10'
      default:
        return 'border-l-primary bg-primary/5'
    }
  }

  const renderStepContent = (step: WorkoutStep) => {
    if (step.type === 'header') {
      return (
        <div className="font-semibold text-secondary">
          {step.raw}
          {step.workoutTypeHint && (
            <Badge variant="secondary" className="ml-2 text-xs">
              {step.workoutTypeHint}
            </Badge>
          )}
        </div>
      )
    }

    if (step.type === 'rest') {
      return (
        <div className="text-rest">
          <span className="font-medium">Rest</span>
          {step.duration && (
            <span className="ml-2 text-sm">({formatDuration(step.duration)})</span>
          )}
        </div>
      )
    }

    return (
      <div>
        <div className="font-medium text-text-primary mb-1">
          {step.exercise || step.raw}
        </div>
        <div className="flex flex-wrap gap-2 text-sm text-text-secondary">
          {step.sets && step.repsJson && (
            <Badge variant="outline" className="text-xs">
              {step.sets} sets × {JSON.parse(step.repsJson)}
            </Badge>
          )}
          {step.duration && (
            <Badge variant="outline" className="text-xs">
              {formatDuration(step.duration)}
            </Badge>
          )}
          {step.distance && (
            <Badge variant="outline" className="text-xs">
              {step.distance}
            </Badge>
          )}
          {step.weight && (
            <Badge variant="outline" className="text-xs">
              {step.weight}
            </Badge>
          )}
          {step.timesThrough && (
            <Badge variant="outline" className="text-xs">
              {step.timesThrough} rounds
            </Badge>
          )}
        </div>
      </div>
    )
  }

  return (
    <>
      <Header />
      <main className="min-h-screen pb-20 md:pb-8">
        <div className="container max-w-screen-xl mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/add">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Import
                </Link>
              </Button>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-text-primary">
                  Review & Edit Workout
                </h1>
                <p className="text-text-secondary">
                  Review the parsed workout and make any necessary adjustments
                </p>
              </div>
            </div>

            {/* Title Editor */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Edit3 className="h-5 w-5 text-primary" />
                  Workout Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Workout Title</Label>
                  <Input
                    id="title"
                    value={editableTitle || ''}
                    onChange={(e) => setEditableTitle(e.target.value)}
                    className="bg-surface border-border"
                  />
                </div>
                
                {workoutData.sourceUrl && (
                  <div className="space-y-2">
                    <Label>Source</Label>
                    <div className="flex items-center gap-2 p-3 bg-surface rounded-lg">
                      <ExternalLink className="h-4 w-4 text-text-secondary" />
                      <a 
                        href={workoutData.sourceUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline flex-1 truncate"
                      >
                        {workoutData.sourceUrl}
                      </a>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Metadata */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Dumbbell className="h-5 w-5 text-primary" />
                  Workout Metadata
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h4 className="font-medium text-text-primary mb-2 flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Duration
                    </h4>
                    <p className="text-text-secondary">
                      {formatTime(workoutData.totalTimeEstimateSec)}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-text-primary mb-2">Equipment</h4>
                    <div className="flex flex-wrap gap-1">
                      {workoutData.meta?.equipment?.length > 0 ? (
                        workoutData.meta.equipment.map((item, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {item}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-sm text-text-secondary">None detected</span>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-text-primary mb-2">Body Parts</h4>
                    <div className="flex flex-wrap gap-1">
                      {workoutData.meta?.bodyParts?.length > 0 ? (
                        workoutData.meta.bodyParts.map((part, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {part}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-sm text-text-secondary">None detected</span>
                      )}
                    </div>
                  </div>
                </div>
                
                {workoutData.meta?.workoutTypes?.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-medium text-text-primary mb-2">Workout Types</h4>
                    <div className="flex flex-wrap gap-1">
                      {workoutData.meta.workoutTypes.map((type, index) => (
                        <Badge key={index} variant="default" className="text-xs">
                          {type}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Parsed Steps */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Workout Steps ({(workoutData.steps?.length || 0) - stepsToDelete.size} of {workoutData.steps?.length || 0})
                </CardTitle>
                <CardDescription>
                  The workout has been parsed into the following steps. Check the boxes to remove unwanted steps before saving.
                </CardDescription>
                
                {/* Quick Actions */}
                {(workoutData.steps?.length || 0) > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => deleteStepsByType('header')}
                      disabled={(workoutData.steps?.filter(s => s.type === 'header') || []).length === 0}
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Remove Headers ({(workoutData.steps?.filter(s => s.type === 'header') || []).length})
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => deleteStepsByType('rest')}
                      disabled={(workoutData.steps?.filter(s => s.type === 'rest') || []).length === 0}
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Remove Rest ({(workoutData.steps?.filter(s => s.type === 'rest') || []).length})
                    </Button>
                    {stepsToDelete.size > 0 && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={clearAllDeletions}
                      >
                        <Undo2 className="h-3 w-3 mr-1" />
                        Clear All ({stepsToDelete.size})
                      </Button>
                    )}
                  </div>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(workoutData.steps || []).map((step, index) => {
                    const isMarkedForDeletion = stepsToDelete.has(index)
                    return (
                      <div
                        key={index}
                        className={`border-l-4 pl-4 py-3 rounded-r-lg transition-all ${
                          isMarkedForDeletion 
                            ? 'bg-red-50 dark:bg-red-950/20 border-l-red-500 opacity-60' 
                            : getStepColor(step)
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {/* Delete Checkbox */}
                          <div className="flex items-center pt-1">
                            <Checkbox
                              checked={isMarkedForDeletion}
                              onCheckedChange={() => toggleStepDeletion(index)}
                              className="data-[state=checked]:bg-red-500 data-[state=checked]:border-red-500"
                            />
                          </div>

                          <div className={`flex items-center gap-2 min-w-0 flex-1 ${isMarkedForDeletion ? 'line-through' : ''}`}>
                            {getStepIcon(step)}
                            <span className="text-sm font-mono text-text-secondary w-8">
                              {index + 1}.
                            </span>
                            <div className="min-w-0 flex-1">
                              {renderStepContent(step)}
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-1">
                            {isMarkedForDeletion ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="shrink-0 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950/20"
                                onClick={() => toggleStepDeletion(index)}
                              >
                                <Undo2 className="h-3 w-3" />
                              </Button>
                            ) : (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="shrink-0 opacity-60 hover:opacity-100"
                                  onClick={() => {
                                    // TODO: Implement inline editing
                                    toast({
                                      title: "Coming Soon",
                                      description: "Step editing will be available in the next update.",
                                    })
                                  }}
                                >
                                  <Edit3 className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="shrink-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                                  onClick={() => toggleStepDeletion(index)}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                        
                        {/* Delete Warning */}
                        {isMarkedForDeletion && (
                          <div className="mt-2 ml-8 text-xs text-red-600 dark:text-red-400">
                            This step will be removed when you save the workout
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Deletion Summary */}
            {stepsToDelete.size > 0 && (
              <Alert className="mb-6">
                <Trash2 className="h-4 w-4" />
                <AlertDescription>
                  {stepsToDelete.size} step{stepsToDelete.size > 1 ? 's' : ''} will be removed when you save. 
                  The final workout will have {(workoutData.steps?.length || 0) - stepsToDelete.size} steps.
                </AlertDescription>
              </Alert>
            )}

            {/* Error Display */}
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={saveWorkout}
                disabled={isSaving || !(editableTitle || '').trim()}
                className="flex-1"
                size="lg"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Saving Workout...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {stepsToDelete.size > 0 
                      ? `Save ${(workoutData.steps?.length || 0) - stepsToDelete.size} Steps to Library`
                      : 'Save to Library'
                    }
                  </>
                )}
              </Button>
              
              <Button
                variant="outline"
                onClick={() => router.push('/add')}
                className="sm:w-auto"
                size="lg"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Start Over
              </Button>
            </div>

            {/* Parsing Quality Info */}
            <Card className="mt-8 bg-surface/50">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <h3 className="font-semibold text-text-primary">Parsing Results</h3>
                </div>
                <div className="text-sm text-text-secondary space-y-1">
                  {(() => {
                    const remainingSteps = (workoutData.steps || []).filter((_, index) => !stepsToDelete.has(index))
                    const remainingExercises = remainingSteps.filter(s => s.type === 'exercise').length
                    const remainingRest = remainingSteps.filter(s => s.type === 'rest').length
                    
                    return (
                      <>
                        <div>✓ Will save {remainingExercises} exercises 
                          {stepsToDelete.size > 0 && (workoutData.steps?.filter(s => s.type === 'exercise') || []).length !== remainingExercises && 
                            ` (${(workoutData.steps?.filter(s => s.type === 'exercise') || []).length - remainingExercises} removed)`
                          }
                        </div>
                        <div>✓ Will save {remainingRest} rest periods 
                          {stepsToDelete.size > 0 && (workoutData.steps?.filter(s => s.type === 'rest') || []).length !== remainingRest && 
                            ` (${(workoutData.steps?.filter(s => s.type === 'rest') || []).length - remainingRest} removed)`
                          }
                        </div>
                        <div>✓ Identified {workoutData.meta?.equipment?.length || 0} equipment types</div>
                        <div>✓ Estimated {formatTime(workoutData.totalTimeEstimateSec)} total duration</div>
                      </>
                    )
                  })()}
                </div>
                <Separator className="my-3" />
                <p className="text-xs text-text-secondary">
                  If anything looks incorrect, you can edit individual steps after saving to your library.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <MobileNav />
    </>
  )
}

export default function ReviewPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-border border-t-primary"></div>
      </div>
    }>
      <ReviewPageContent />
    </Suspense>
  )
}
