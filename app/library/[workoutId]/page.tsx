
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
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  ArrowLeft,
  Play,
  Clock,
  Target,
  Dumbbell,
  Calendar,
  Edit2,
  Share2,
  Bookmark,
  Save,
  X,
  Trash2,
  Plus,
  ChevronUp,
  ChevronDown,
  AlertTriangle,
  Check
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
  createdAt: string
  totalTimeEstimateSec: number | null
  bodyParts: string[]
  equipment: string[]
  workoutTypes: string[]
  tags: string[]
  url: string | null
  caption: string | null
  userId: string
  steps: WorkoutStep[]
  sessionCount: number
}

export default function WorkoutDetailPage() {
  const { data: session, status } = useSession() || {}
  const router = useRouter()
  const params = useParams()
  const workoutId = params?.workoutId as string

  const [workout, setWorkout] = useState<Workout | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Edit mode state
  const [isEditing, setIsEditing] = useState(false)
  const [editedWorkout, setEditedWorkout] = useState<Workout | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login")
      return
    }

    if (status === "authenticated" && workoutId) {
      fetchWorkout()
    }
  }, [status, workoutId, router])

  const fetchWorkout = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/workouts/${workoutId}`)
      
      if (!response.ok) {
        if (response.status === 404) {
          setError('Workout not found')
        } else {
          throw new Error('Failed to fetch workout')
        }
        return
      }
      
      const data = await response.json()
      setWorkout(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load workout')
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

  const formatReps = (repsJson: string | null, sets: number | null) => {
    if (!repsJson && !sets) return ''
    if (sets && repsJson) return `${sets} × ${repsJson}`
    if (sets) return `${sets} sets`
    if (repsJson) return repsJson
    return ''
  }

  const startWorkout = () => {
    router.push(`/workout/${workoutId}/run`)
  }

  // Edit mode functions
  const enterEditMode = () => {
    if (workout) {
      setEditedWorkout({ ...workout })
      setIsEditing(true)
      setSaveError(null)
    }
  }

  const exitEditMode = () => {
    setIsEditing(false)
    setEditedWorkout(null)
    setSaveError(null)
  }

  const updateWorkoutMetadata = (field: keyof Workout, value: any) => {
    if (editedWorkout) {
      setEditedWorkout({ ...editedWorkout, [field]: value })
    }
  }

  const updateStep = (stepId: string, field: keyof WorkoutStep, value: any) => {
    if (editedWorkout) {
      const updatedSteps = editedWorkout.steps.map(step => 
        step.id === stepId ? { ...step, [field]: value } : step
      )
      setEditedWorkout({ ...editedWorkout, steps: updatedSteps })
    }
  }

  const deleteStep = (stepId: string) => {
    if (editedWorkout) {
      const updatedSteps = editedWorkout.steps
        .filter(step => step.id !== stepId)
        .map((step, index) => ({ ...step, order: index }))
      setEditedWorkout({ ...editedWorkout, steps: updatedSteps })
    }
  }

  const moveStep = (stepId: string, direction: 'up' | 'down') => {
    if (editedWorkout) {
      const steps = [...editedWorkout.steps]
      const currentIndex = steps.findIndex(step => step.id === stepId)
      
      if (currentIndex === -1) return
      
      const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
      
      if (newIndex < 0 || newIndex >= steps.length) return
      
      // Swap steps
      [steps[currentIndex], steps[newIndex]] = [steps[newIndex], steps[currentIndex]]
      
      // Update order values
      const updatedSteps = steps.map((step, index) => ({ ...step, order: index }))
      setEditedWorkout({ ...editedWorkout, steps: updatedSteps })
    }
  }

  const addNewStep = () => {
    if (editedWorkout) {
      const newStep: WorkoutStep = {
        id: `temp-${Date.now()}`, // Temporary ID for new steps
        order: editedWorkout.steps.length,
        type: 'exercise',
        raw: '',
        exercise: 'New Exercise',
        sets: 3,
        repsJson: '10',
        duration: null,
        weight: null,
        distance: null,
        timesThrough: null,
        workoutTypeHint: null,
      }
      setEditedWorkout({ 
        ...editedWorkout, 
        steps: [...editedWorkout.steps, newStep] 
      })
    }
  }

  const saveChanges = async () => {
    if (!editedWorkout) return
    
    setIsSaving(true)
    setSaveError(null)
    
    try {
      const response = await fetch(`/api/workouts/${workoutId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editedWorkout.title,
          bodyParts: editedWorkout.bodyParts,
          equipment: editedWorkout.equipment,
          workoutTypes: editedWorkout.workoutTypes,
          tags: editedWorkout.tags,
          steps: editedWorkout.steps
        })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save changes')
      }
      
      const updatedWorkout = await response.json()
      setWorkout(updatedWorkout)
      setIsEditing(false)
      setEditedWorkout(null)
      
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save changes')
    } finally {
      setIsSaving(false)
    }
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
              <h1 className="text-2xl font-bold text-text-primary mb-2">Workout Not Found</h1>
              <p className="text-text-secondary mb-4">{error}</p>
              <Button onClick={() => router.push('/library')} variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Library
              </Button>
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
        <main className="min-h-screen pb-20 md:pb-8">
          <div className="container max-w-screen-lg mx-auto px-4 py-8">
            <LoadingSpinner />
          </div>
        </main>
        <MobileNav />
      </>
    )
  }

  const exerciseSteps = workout.steps.filter(step => step.type === 'exercise')
  const totalExercises = exerciseSteps.length

  return (
    <>
      <Header />
      <main className="min-h-screen pb-20 md:pb-8">
        <div className="container max-w-screen-lg mx-auto px-4 py-8">
          {/* Back Button */}
          <Button 
            onClick={() => router.push('/library')} 
            variant="ghost" 
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Library
          </Button>

          {/* Workout Header */}
          <div className="mb-6">
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Workout Title
                  </label>
                  <Input
                    value={editedWorkout?.title || ''}
                    onChange={(e) => updateWorkoutMetadata('title', e.target.value)}
                    className="text-2xl font-bold"
                    placeholder="Enter workout title"
                  />
                </div>
              </div>
            ) : (
              <h1 className="text-3xl font-bold text-text-primary mb-2">{workout.title}</h1>
            )}
            
            <div className="flex flex-wrap gap-4 text-sm text-text-secondary mt-4">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {new Date(workout.createdAt).toLocaleDateString()}
              </div>
              <div className="flex items-center gap-1">
                <Target className="h-4 w-4" />
                {(isEditing ? editedWorkout?.steps : workout.steps)?.filter(step => step.type === 'exercise').length} exercises
              </div>
              {workout.totalTimeEstimateSec && (
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {formatTime(workout.totalTimeEstimateSec)}
                </div>
              )}
              {workout.sessionCount > 0 && (
                <div className="flex items-center gap-1">
                  <Dumbbell className="h-4 w-4" />
                  Completed {workout.sessionCount} times
                </div>
              )}
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mt-4">
              {(isEditing ? editedWorkout?.bodyParts : workout.bodyParts)?.map((part) => (
                <Badge key={part} variant="secondary">
                  {part}
                </Badge>
              ))}
              {(isEditing ? editedWorkout?.equipment : workout.equipment)?.map((equip) => (
                <Badge key={equip} variant="outline">
                  {equip}
                </Badge>
              ))}
              {(isEditing ? editedWorkout?.workoutTypes : workout.workoutTypes)?.map((type) => (
                <Badge key={type} variant="default">
                  {type}
                </Badge>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 mb-8">
            {isEditing ? (
              <>
                <Button 
                  onClick={saveChanges}
                  disabled={isSaving}
                  size="lg" 
                  className="flex-1 min-w-[200px]"
                >
                  {isSaving ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-border border-t-primary mr-2" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={exitEditMode}
                  disabled={isSaving}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <Button 
                  onClick={startWorkout}
                  size="lg" 
                  className="flex-1 min-w-[200px]"
                >
                  <Play className="h-5 w-5 mr-2" />
                  Start Workout
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={enterEditMode}
                >
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button variant="outline" size="lg">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
                <Button variant="outline" size="lg">
                  <Bookmark className="h-4 w-4 mr-2" />
                  Save
                </Button>
              </>
            )}
          </div>

          {/* Save Error Alert */}
          {saveError && (
            <Alert variant="destructive" className="mb-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{saveError}</AlertDescription>
            </Alert>
          )}

          {/* Workout Steps */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Workout Steps</CardTitle>
                  <CardDescription>
                    {(isEditing ? editedWorkout?.steps : workout.steps)?.filter(step => step.type === 'exercise').length} exercises • {isEditing ? 'Edit your workout steps' : 'Follow the steps in order'}
                  </CardDescription>
                </div>
                {isEditing && (
                  <Button onClick={addNewStep} variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Step
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {(isEditing ? editedWorkout?.steps : workout.steps)?.map((step, index) => (
                <div key={step.id}>
                  {isEditing ? (
                    /* Edit Mode Step */
                    <div className="border border-border rounded-lg p-4 space-y-4">
                      <div className="flex gap-4 items-start">
                        {/* Step Number & Move Controls */}
                        <div className="flex flex-col items-center gap-2">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                            {index + 1}
                          </div>
                          <div className="flex flex-col gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => moveStep(step.id, 'up')}
                              disabled={index === 0}
                              className="h-6 w-6 p-0"
                            >
                              <ChevronUp className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => moveStep(step.id, 'down')}
                              disabled={index === (editedWorkout?.steps.length || 0) - 1}
                              className="h-6 w-6 p-0"
                            >
                              <ChevronDown className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        
                        {/* Step Content - Editable */}
                        <div className="flex-1 min-w-0 space-y-3">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-text-primary mb-1">
                                Exercise Name
                              </label>
                              <Input
                                value={step.exercise || ''}
                                onChange={(e) => updateStep(step.id, 'exercise', e.target.value)}
                                placeholder="Exercise name"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-text-primary mb-1">
                                Type
                              </label>
                              <select
                                value={step.type}
                                onChange={(e) => updateStep(step.id, 'type', e.target.value)}
                                className="w-full px-3 py-2 border border-border rounded-md bg-background text-text-primary"
                              >
                                <option value="exercise">Exercise</option>
                                <option value="rest">Rest</option>
                                <option value="header">Header</option>
                                <option value="time">Time</option>
                              </select>
                            </div>
                          </div>
                          
                          {step.type === 'exercise' && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-text-primary mb-1">
                                  Sets
                                </label>
                                <Input
                                  type="number"
                                  value={step.sets || ''}
                                  onChange={(e) => updateStep(step.id, 'sets', e.target.value ? parseInt(e.target.value) : null)}
                                  placeholder="3"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-text-primary mb-1">
                                  Reps
                                </label>
                                <Input
                                  value={step.repsJson || ''}
                                  onChange={(e) => updateStep(step.id, 'repsJson', e.target.value)}
                                  placeholder="10"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-text-primary mb-1">
                                  Weight (lbs)
                                </label>
                                <Input
                                  value={step.weight || ''}
                                  onChange={(e) => updateStep(step.id, 'weight', e.target.value)}
                                  placeholder="135"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-text-primary mb-1">
                                  Duration (s)
                                </label>
                                <Input
                                  type="number"
                                  value={step.duration || ''}
                                  onChange={(e) => updateStep(step.id, 'duration', e.target.value ? parseInt(e.target.value) : null)}
                                  placeholder="60"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {/* Delete Button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteStep(step.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    /* View Mode Step */
                    <div className="flex gap-4">
                      {/* Step Number */}
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                        {step.order + 1}
                      </div>
                      
                      {/* Step Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-text-primary">
                              {step.exercise || 'Exercise'}
                            </h4>
                            {step.type === 'exercise' && (
                              <div className="text-sm text-text-secondary mt-1">
                                {formatReps(step.repsJson, step.sets)}
                                {step.duration && ` • ${step.duration}s duration`}
                                {step.weight && ` • ${step.weight} lbs`}
                                {step.distance && ` • ${step.distance}m`}
                              </div>
                            )}
                            {step.raw && step.raw !== step.exercise && (
                              <p className="text-xs text-text-secondary mt-1 opacity-75">
                                Original: {step.raw}
                              </p>
                            )}
                          </div>
                          
                          {/* Step Type Badge */}
                          <Badge 
                            variant={step.type === 'exercise' ? 'default' : 'secondary'}
                            className="ml-2"
                          >
                            {step.type}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {index < (isEditing ? editedWorkout?.steps.length || 0 : workout.steps.length) - 1 && (
                    <Separator className="mt-4" />
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Source Information */}
          {workout.url && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-sm">Source</CardTitle>
              </CardHeader>
              <CardContent>
                <a 
                  href={workout.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline text-sm break-all"
                >
                  {workout.url}
                </a>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      <MobileNav />
    </>
  )
}
