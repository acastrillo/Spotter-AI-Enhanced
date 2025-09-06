import { NextRequest, NextResponse } from 'next/server'
import { parseInstagramCaption, buildSpotterRefIndex, WorkoutAST, WorkoutRow } from '@/lib/igParser'

interface ParseWorkoutRequest {
  title: string
  sourceUrl?: string
  caption: string
}

// Simple ParsedWorkout interface for spotter-fresh
interface ParsedWorkout {
  title: string
  detectedTitle?: string
  steps: WorkoutStep[]
  meta: WorkoutMeta
  totalTimeEstimateSec?: number
}

interface WorkoutStep {
  order: number
  type: 'exercise' | 'rest' | 'time' | 'header'
  raw: string
  exercise?: string
  sets?: number
  repsJson?: string
  duration?: number
  weight?: string
  distance?: string
  timesThrough?: number
  workoutTypeHint?: string
}

interface WorkoutMeta {
  equipment: string[]
  workoutTypes: string[]
  bodyParts: string[]
  tags: string[]
}

// Convert Instagram parser output to ParsedWorkout format
function convertInstagramParserOutput(
  ast: WorkoutAST, 
  rows: WorkoutRow[], 
  title: string,
  sourceUrl?: string,
  originalCaption?: string
): ParsedWorkout {
  // Convert WorkoutRow[] to WorkoutStep[]
  const steps: WorkoutStep[] = rows.map((row, index) => {
    const step: WorkoutStep = {
      order: index,
      type: 'exercise', // Most rows are exercises
      raw: `${row.movement} ${row.qty || ''}${row.load ? ` (${row.load})` : ''}`.trim(),
      exercise: row.movement || undefined,
      sets: undefined,
      repsJson: undefined,
      duration: undefined,
      weight: row.load || undefined,
      distance: undefined,
      timesThrough: row.round > 1 ? row.round : undefined,
      workoutTypeHint: undefined
    }

    // Parse quantity into sets/reps or duration or distance
    if (row.qty) {
      const qtyMatch = row.qty.match(/^(\d+)\s*(reps?|rep|times?)$/i)
      if (qtyMatch) {
        step.repsJson = qtyMatch[1]
        step.sets = 1
      }
      
      const setsRepsMatch = row.qty.match(/^(\d+)x(\d+)$/)
      if (setsRepsMatch) {
        step.sets = parseInt(setsRepsMatch[1])
        step.repsJson = setsRepsMatch[2]
      }
      
      const timeMatch = row.qty.match(/^(\d+)\s*(sec|min|s|m)$/i)
      if (timeMatch) {
        const value = parseInt(timeMatch[1])
        const unit = timeMatch[2].toLowerCase()
        step.duration = unit.startsWith('min') || unit === 'm' ? value * 60 : value
      }
      
      const distanceMatch = row.qty.match(/^(\d+)\s*(m|meters?|km|miles?)$/i)
      if (distanceMatch) {
        step.distance = row.qty
      }
    }

    return step
  })

  // Add block headers as header steps
  const blockSteps: WorkoutStep[] = []
  ast.blocks.forEach((block, blockIndex) => {
    if (block.title && blockIndex > 0) { // Skip first block title if it's just "Block 1"
      blockSteps.push({
        order: blockSteps.length + steps.length,
        type: 'header',
        raw: block.title,
        workoutTypeHint: block.mode?.kind
      })
    }
  })

  // Combine and sort all steps
  const allSteps = [...blockSteps, ...steps].sort((a, b) => a.order - b.order)

  // Extract metadata
  const equipment = ast.classification?.equipment || []
  const workoutTypes = ast.classification?.formats || []
  const bodyParts = ast.classification?.bodyParts || []
  
  // Estimate total time
  let totalTimeEstimate = 0
  if (ast.capSec) {
    totalTimeEstimate = ast.capSec
  } else if (ast.classification?.estimated_duration) {
    totalTimeEstimate = ast.classification.estimated_duration
  } else {
    // Simple estimation: assume 30 seconds per movement
    totalTimeEstimate = rows.length * 30
  }

  const meta: WorkoutMeta = {
    equipment,
    workoutTypes,
    bodyParts,
    tags: []
  }

  return {
    title: title.trim(),
    detectedTitle: ast.title,
    steps: allSteps,
    meta,
    totalTimeEstimateSec: totalTimeEstimate
  }
}

export async function POST(request: NextRequest) {
  console.log('🏋️ Enhanced parse workout API called')
  
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

    // Parse the workout using the enhanced Instagram parser
    try {
      console.log('🚀 Using enhanced Instagram parser with glossary integration')
      
      // Build reference index for glossary matching
      const ref = buildSpotterRefIndex()
      
      // Parse with Instagram parser
      const { ast, rows, workoutV1 } = parseInstagramCaption(caption.trim(), ref, {
        platform: sourceUrl?.includes('instagram') ? 'instagram' : undefined,
        url: sourceUrl
      })
      
      console.log('📊 Instagram parser results:', {
        blocks: ast.blocks.length,
        totalMovements: rows.length,
        confidence: ast.confidence,
        glossaryHits: ast.glossaryHits?.length || 0
      })
      
      // Convert to ParsedWorkout format for compatibility
      const parsedWorkout = convertInstagramParserOutput(ast, rows, title.trim(), sourceUrl, caption.trim())
      
      // Add source URL to the parsed workout if provided
      const workoutWithMeta = {
        ...parsedWorkout,
        sourceUrl: sourceUrl || null,
        originalCaption: caption.trim()
      }

      return NextResponse.json({
        success: true,
        workout: workoutWithMeta,
        message: 'Workout parsed successfully with enhanced Instagram parser!',
        stats: {
          steps_found: parsedWorkout.steps.length,
          equipment_detected: parsedWorkout.meta.equipment.length,
          workout_types: parsedWorkout.meta.workoutTypes.length,
          estimated_time_sec: parsedWorkout.totalTimeEstimateSec || 0,
          confidence: ast.confidence,
          glossary_hits: ast.glossaryHits?.length || 0,
          parser_used: 'instagram_enhanced'
        }
      })

    } catch (parseError) {
      console.error('❌ Enhanced parser failed:', parseError)
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