
import { NextRequest, NextResponse } from 'next/server'
import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { ParsedWorkout } from "@/lib/workout-parser"

interface SaveWorkoutRequest extends ParsedWorkout {
  sourceUrl?: string
  originalCaption?: string
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ 
        error: 'Authentication required. Please log in.'
      }, { status: 401 })
    }

    const workoutData: SaveWorkoutRequest = await request.json()

    if (!workoutData.title?.trim()) {
      return NextResponse.json({ 
        error: 'Title is required' 
      }, { status: 400 })
    }

    if (!workoutData.steps?.length) {
      return NextResponse.json({ 
        error: 'Steps are required' 
      }, { status: 400 })
    }

    // Create the workout
    const workout = await prisma.workout.create({
      data: {
        title: workoutData.title.trim(),
        url: workoutData.sourceUrl || null,
        caption: workoutData.originalCaption || null,
        userId: session.user.id,
        equipment: JSON.stringify(workoutData.meta?.equipment || []),
        workoutTypes: JSON.stringify(workoutData.meta?.workoutTypes || []),
        tags: JSON.stringify(workoutData.meta?.tags || []),
        bodyParts: JSON.stringify(workoutData.meta?.bodyParts || []),
        totalTimeEstimateSec: workoutData.totalTimeEstimateSec || null,
        detectedTitle: workoutData.detectedTitle || null,
        steps: {
          create: workoutData.steps.map((step, index) => ({
            order: step.order || index,
            type: step.type,
            raw: step.raw,
            exercise: step.exercise || null,
            sets: step.sets || null,
            repsJson: step.repsJson || null,
            duration: step.duration || null,
            weight: step.weight || null,
            distance: step.distance || null,
            timesThrough: step.timesThrough || null,
            workoutTypeHint: step.workoutTypeHint || null,
          }))
        }
      },
      include: {
        steps: {
          orderBy: {
            order: 'asc'
          }
        }
      }
    })

    return NextResponse.json(workout, { status: 201 })

  } catch (error) {
    console.error('Save workout error:', error)
    
    return NextResponse.json({ 
      error: 'Failed to save workout. Please try again.',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const equipment = searchParams.get('equipment')?.split(',').filter(Boolean) || []
    const bodyParts = searchParams.get('bodyParts')?.split(',').filter(Boolean) || []
    const workoutTypes = searchParams.get('workoutTypes')?.split(',').filter(Boolean) || []

    // Build where clause for filtering
    const where: any = {
      userId: session.user.id,
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { tags: { contains: search } }
      ]
    }

    if (equipment.length > 0) {
      where.equipment = { contains: equipment[0] } // SQLite string search
    }

    if (bodyParts.length > 0) {
      where.bodyParts = { contains: bodyParts[0] } // SQLite string search
    }

    if (workoutTypes.length > 0) {
      where.workoutTypes = { contains: workoutTypes[0] } // SQLite string search
    }

    const workouts = await prisma.workout.findMany({
      where,
      include: {
        steps: {
          orderBy: {
            order: 'asc'
          }
        },
        sessions: {
          select: {
            id: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Add session count to each workout and parse JSON fields
    const workoutsWithSessionCount = workouts.map((workout: any) => ({
      ...workout,
      sessionCount: workout.sessions.length,
      // Parse JSON strings back to arrays
      bodyParts: workout.bodyParts ? JSON.parse(workout.bodyParts) : [],
      equipment: workout.equipment ? JSON.parse(workout.equipment) : [],
      workoutTypes: workout.workoutTypes ? JSON.parse(workout.workoutTypes) : [],
      tags: workout.tags ? JSON.parse(workout.tags) : []
    }))

    return NextResponse.json(workoutsWithSessionCount)

  } catch (error) {
    console.error('Get workouts error:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch workouts' 
    }, { status: 500 })
  }
}
