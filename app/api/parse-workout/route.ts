
import { NextRequest, NextResponse } from 'next/server'
import { parseWorkoutCaption } from '@/lib/workout-parser'

interface ParseWorkoutRequest {
  title: string
  sourceUrl?: string
  caption: string
}

export async function POST(request: NextRequest) {
  console.log('🏋️ Parse workout API called')
  
  try {
    const contentType = request.headers.get('content-type')

    if (!contentType?.includes('application/json')) {
      return NextResponse.json({ 
        error: 'Invalid request format. Expected JSON.' 
      }, { status: 400 })
    }

    let requestData: ParseWorkoutRequest
    
    try {
      requestData = await request.json()
    } catch (jsonError) {
      return NextResponse.json({ 
        error: 'Invalid JSON in request body',
        details: jsonError instanceof Error ? jsonError.message : 'JSON parse error'
      }, { status: 400 })
    }

    const { title, sourceUrl, caption } = requestData

    console.log(`📝 Parse request: title="${title}" (${caption?.length || 0} chars)`)

    if (!title?.trim() || !caption?.trim()) {
      return NextResponse.json({ 
        error: 'Title and caption are required and cannot be empty' 
      }, { status: 400 })
    }

    // Parse the workout using the workout parser
    try {
      const parsedWorkout = parseWorkoutCaption(caption.trim(), title.trim())
      
      // Add source URL to the parsed workout if provided
      const workoutWithMeta = {
        ...parsedWorkout,
        sourceUrl: sourceUrl || null,
        originalCaption: caption.trim()
      }

      return NextResponse.json({
        success: true,
        workout: workoutWithMeta,
        message: 'Workout parsed successfully!',
        stats: {
          steps_found: parsedWorkout.steps.length,
          equipment_detected: parsedWorkout.meta.equipment.length,
          workout_types: parsedWorkout.meta.workoutTypes.length,
          estimated_time_sec: parsedWorkout.totalTimeEstimateSec || 0
        }
      })

    } catch (parseError) {
      console.error('❌ Workout parsing failed:', parseError)
      return NextResponse.json({
        success: false,
        error: 'Failed to parse workout content',
        details: parseError instanceof Error ? parseError.message : 'Unknown parsing error',
        fallback: {
          suggestion: 'Try simplifying the workout format or check for typos',
          manualParsingTips: [
            'Use clear sets x reps format (e.g., 3x10)',
            'Include exercise names before rep counts',
            'Separate exercises with line breaks',
            'Use standard abbreviations (lbs, kg, sec, min)'
          ]
        }
      }, { status: 422 }) // Unprocessable Entity
    }

  } catch (error) {
    console.error('❌ Parse workout error:', error)
    return NextResponse.json({ 
      error: 'Failed to process request',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
