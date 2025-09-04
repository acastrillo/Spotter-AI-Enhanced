
import { NextRequest, NextResponse } from 'next/server'
import { auth } from "@/auth"
import { prisma } from "@/lib/db"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ workoutId: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { workoutId } = await params

    if (!workoutId) {
      return NextResponse.json({ error: 'Workout ID is required' }, { status: 400 })
    }

    // Fetch workout with all related data
    const workout = await prisma.workout.findFirst({
      where: {
        id: workoutId,
        userId: session.user.id, // Ensure user can only access their own workouts
      },
      include: {
        steps: {
          orderBy: {
            order: 'asc'
          }
        },
        sessions: {
          select: {
            id: true,
            endedAt: true,
            startedAt: true
          },
          orderBy: {
            startedAt: 'desc'
          }
        }
      }
    })

    if (!workout) {
      return NextResponse.json({ error: 'Workout not found' }, { status: 404 })
    }

    // Add session count and parse JSON fields
    const workoutWithSessionCount = {
      ...workout,
      sessionCount: workout.sessions.length,
      // Parse JSON strings back to arrays
      bodyParts: workout.bodyParts ? JSON.parse(workout.bodyParts) : [],
      equipment: workout.equipment ? JSON.parse(workout.equipment) : [],
      workoutTypes: workout.workoutTypes ? JSON.parse(workout.workoutTypes) : [],
      tags: workout.tags ? JSON.parse(workout.tags) : []
    }

    return NextResponse.json(workoutWithSessionCount)

  } catch (error) {
    console.error('Get workout error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ workoutId: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { workoutId } = await params
    const updateData = await request.json()

    if (!workoutId) {
      return NextResponse.json({ error: 'Workout ID is required' }, { status: 400 })
    }

    // Verify workout belongs to user
    const existingWorkout = await prisma.workout.findFirst({
      where: {
        id: workoutId,
        userId: session.user.id
      }
    })

    if (!existingWorkout) {
      return NextResponse.json({ error: 'Workout not found' }, { status: 404 })
    }

    // Update workout in a transaction to handle steps
    const updatedWorkout = await prisma.$transaction(async (tx: any) => {
      // Update the workout metadata
      const workout = await tx.workout.update({
        where: { id: workoutId },
        data: {
          title: updateData.title || existingWorkout.title,
          bodyParts: updateData.bodyParts || existingWorkout.bodyParts,
          equipment: updateData.equipment || existingWorkout.equipment,
          workoutTypes: updateData.workoutTypes || existingWorkout.workoutTypes,
          tags: updateData.tags || existingWorkout.tags,
          totalTimeEstimateSec: updateData.totalTimeEstimateSec || existingWorkout.totalTimeEstimateSec,
          updatedAt: new Date()
        }
      })

      // If steps are provided, update them
      if (updateData.steps) {
        // Delete existing steps
        await tx.workoutStep.deleteMany({
          where: { workoutId: workoutId }
        })

        // Create new steps
        for (const step of updateData.steps) {
          await tx.workoutStep.create({
            data: {
              workoutId: workoutId,
              order: step.order,
              type: step.type || 'exercise',
              raw: step.raw || step.exercise || '',
              exercise: step.exercise,
              sets: step.sets,
              repsJson: step.repsJson,
              duration: step.duration,
              weight: step.weight,
              distance: step.distance,
              timesThrough: step.timesThrough,
              workoutTypeHint: step.workoutTypeHint,
            }
          })
        }
      }

      // Return updated workout with steps
      return await tx.workout.findUnique({
        where: { id: workoutId },
        include: {
          steps: {
            orderBy: {
              order: 'asc'
            }
          },
          sessions: {
            select: {
              id: true,
              endedAt: true,
              startedAt: true
            },
            orderBy: {
              startedAt: 'desc'
            }
          }
        }
      })
    })

    // Add session count and parse JSON fields
    const workoutWithSessionCount = {
      ...updatedWorkout,
      sessionCount: updatedWorkout?.sessions.length || 0,
      // Parse JSON strings back to arrays
      bodyParts: updatedWorkout?.bodyParts ? JSON.parse(updatedWorkout.bodyParts) : [],
      equipment: updatedWorkout?.equipment ? JSON.parse(updatedWorkout.equipment) : [],
      workoutTypes: updatedWorkout?.workoutTypes ? JSON.parse(updatedWorkout.workoutTypes) : [],
      tags: updatedWorkout?.tags ? JSON.parse(updatedWorkout.tags) : []
    }

    return NextResponse.json(workoutWithSessionCount)

  } catch (error) {
    console.error('Update workout error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ workoutId: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { workoutId } = await params

    if (!workoutId) {
      return NextResponse.json({ error: 'Workout ID is required' }, { status: 400 })
    }

    // Verify workout belongs to user
    const existingWorkout = await prisma.workout.findFirst({
      where: {
        id: workoutId,
        userId: session.user.id
      }
    })

    if (!existingWorkout) {
      return NextResponse.json({ error: 'Workout not found' }, { status: 404 })
    }

    // Delete workout (this will cascade delete steps and sessions)
    await prisma.workout.delete({
      where: { id: workoutId }
    })

    return NextResponse.json({ success: true, message: 'Workout deleted' })

  } catch (error) {
    console.error('Delete workout error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
