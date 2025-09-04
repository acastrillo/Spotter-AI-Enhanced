import { NextRequest, NextResponse } from 'next/server'
import { auth } from "@/auth"
import { prisma } from "@/lib/db"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { sessionId } = await params

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 })
    }

    // Fetch session with workout details
    const workoutSession = await prisma.workoutSession.findFirst({
      where: {
        id: sessionId,
        userId: session.user.id
      },
      include: {
        workout: {
          include: {
            steps: {
              orderBy: {
                order: 'asc'
              }
            }
          }
        }
      }
    })

    if (!workoutSession) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    return NextResponse.json(workoutSession)

  } catch (error) {
    console.error('Get session error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { sessionId } = await params
    const updateData = await request.json()

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 })
    }

    // Verify session belongs to user
    const existingSession = await prisma.workoutSession.findFirst({
      where: {
        id: sessionId,
        userId: session.user.id
      }
    })

    if (!existingSession) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    // Update session
    const updatedSession = await prisma.workoutSession.update({
      where: { id: sessionId },
      data: {
        endedAt: updateData.endedAt ? new Date(updateData.endedAt) : existingSession.endedAt,
        elapsedSec: updateData.elapsedSec || existingSession.elapsedSec,
        rpe: updateData.rpe || existingSession.rpe,
        notes: updateData.notes || existingSession.notes,
      }
    })

    return NextResponse.json(updatedSession)

  } catch (error) {
    console.error('Update session error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}