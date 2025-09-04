

import { NextRequest, NextResponse } from 'next/server'
import { auth } from "@/auth"
import { prisma } from "@/lib/db"

interface SavePartialWorkoutRequest {
  title: string
  caption: string
  sourceUrl?: string
  source: 'manual' | 'instagram' | 'image' | 'other'
  confidence?: number
  notes?: string
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { title, caption, sourceUrl, source, confidence, notes }: SavePartialWorkoutRequest = await request.json()

    if (!title?.trim() || !caption?.trim()) {
      return NextResponse.json({ 
        error: 'Title and caption are required' 
      }, { status: 400 })
    }

    // Find the user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Create a draft workout with minimal parsing
    const workout = await prisma.workout.create({
      data: {
        title: title.trim(),
        caption: caption.trim(),
        url: sourceUrl || null,
        userId: user.id,
        tags: JSON.stringify(source === 'image' && confidence ? [`ocr-confidence-${Math.round(confidence)}`] : []),
        detectedTitle: null, // Will be filled during proper parsing
        equipment: JSON.stringify([]),
        workoutTypes: JSON.stringify([]),
        bodyParts: JSON.stringify([]),
        totalTimeEstimateSec: null,
        steps: {
          create: [
            {
              order: 1,
              type: 'exercise',
              raw: caption.trim(),
              exercise: 'Draft - Needs Review',
              sets: null,
              repsJson: null,
              duration: null,
              weight: null,
              distance: null,
              timesThrough: null,
              workoutTypeHint: source === 'instagram' ? 'social-media' : source
            }
          ]
        }
      },
      include: {
        steps: true
      }
    })

    return NextResponse.json({
      success: true,
      workoutId: workout.id,
      message: 'Partial workout saved successfully. You can edit and parse it later.',
      workout: {
        id: workout.id,
        title: workout.title,
        caption: workout.caption,
        createdAt: workout.createdAt,
        source,
        needsReview: true
      }
    })

  } catch (error) {
    console.error('Save partial workout error:', error)
    return NextResponse.json({ 
      error: 'Failed to save partial workout',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

