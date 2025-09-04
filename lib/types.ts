import type { DefaultSession } from "next-auth"
import type { Workout, WorkoutStep, WorkoutSession, Dictionary } from "@prisma/client"

export type User = {
  id: string
  email: string
  firstName?: string | null
  lastName?: string | null
  createdAt: Date
  updatedAt: Date
}

export type WorkoutWithSteps = Workout & {
  steps: WorkoutStep[]
  user: User
}

export type WorkoutSessionWithWorkout = WorkoutSession & {
  workout: Workout
  user: User
}

// Extend NextAuth types
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      firstName?: string | null
      lastName?: string | null
    } & DefaultSession["user"]
  }

  interface User {
    id: string
    firstName?: string | null
    lastName?: string | null
  }
}


// Workout types
export type WorkoutType = 'exercise' | 'rest' | 'time'

export interface ParsedWorkoutStep {
  order: number
  type: WorkoutType
  raw: string
  exercise?: string
  sets?: number
  reps?: number | number[]
  duration?: number
  weight?: string
  distance?: string
  timesThrough?: number
  workoutTypeHint?: string
}

export interface WorkoutMetadata {
  equipment: string[]
  workoutTypes: string[]
  tags: string[]
  totalTimeEstimateSec?: number
  detectedTitle?: string
  bodyParts: string[]
}

export interface ImportedWorkout {
  title: string
  url?: string
  caption?: string
  meta: WorkoutMetadata
  steps: ParsedWorkoutStep[]
}

// Dictionary types
export type DictionaryKind = 'equipment' | 'type' | 'bodypart'

export interface DictionaryEntry {
  id: string
  kind: DictionaryKind
  term: string
  normalized: string
}

// UI State types
export interface LoadingState {
  isLoading: boolean
  error?: string | null
}

// Date range for filtering
export type DateRange = {
  from: Date | undefined
  to: Date | undefined
}