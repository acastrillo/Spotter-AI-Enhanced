import { NextRequest, NextResponse } from 'next/server'
import { auth } from "@/auth"
import { prisma } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { workoutId } = await request.json()

    if (!workoutId) {
      return NextResponse.json({ error: 'Workout ID is required' }, { status: 400 })
    }

    // Verify workout belongs to user
    const workout = await prisma.workout.findFirst({
      where: {
        id: workoutId,
        userId: session.user.id
      }
    })

    if (!workout) {
      return NextResponse.json({ error: 'Workout not found' }, { status: 404 })
    }

    // Create new workout session
    const workoutSession = await prisma.workoutSession.create({
      data: {
        workoutId: workoutId,
        userId: session.user.id,
        startedAt: new Date(),
      }
    })

    return NextResponse.json({
      success: true,
      session: workoutSession
    })

  } catch (error) {
    console.error('Create session error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}