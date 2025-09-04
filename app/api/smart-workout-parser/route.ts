import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { workoutText, sourceUrl } = await request.json()
    
    if (!workoutText) {
      return NextResponse.json({ 
        error: 'Workout text is required' 
      }, { status: 400 })
    }

    console.log('Smart workout parsing requested')
    console.log('Source URL:', sourceUrl || 'manual input')
    console.log('Content length:', workoutText.length)

    // Use ChatGPT to intelligently parse the workout content
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are an expert fitness trainer and workout parser. Your job is to extract structured workout data from any text format.

Parse the following workout text and return a JSON object with this exact structure:
{
  "exercises": [
    {
      "name": "Exercise Name",
      "sets": [
        {
          "reps": number or "to failure" or "AMRAP",
          "weight": "weight with unit" or null,
          "duration": "time duration" or null,
          "distance": "distance with unit" or null,
          "notes": "additional notes" or null
        }
      ],
      "category": "strength/cardio/mobility/other",
      "muscleGroups": ["primary", "secondary"],
      "equipment": ["equipment needed"] or []
    }
  ],
  "workoutTitle": "suggested title",
  "workoutType": "strength/cardio/mixed/other",
  "estimatedDuration": "estimated time",
  "difficulty": "beginner/intermediate/advanced",
  "notes": "general workout notes"
}

Rules:
1. Extract ALL exercises mentioned, even if format varies
2. Identify sets, reps, weights from various formats (3x10, 10 reps, 10x3, etc.)
3. Handle different units (lbs, kg, km, miles, minutes, seconds)
4. Recognize rest periods, supersets, circuits
5. Extract tempo, RPE, or other training notes
6. If information is unclear, make reasonable assumptions based on context
7. Group related exercises (supersets, circuits) with notes
8. Handle emojis and social media formatting
9. Extract hashtags as potential tags or categories
10. Return valid JSON only - no explanations`
        },
        {
          role: "user",
          content: workoutText
        }
      ],
      temperature: 0.1,
      max_tokens: 2000
    })

    const aiResponse = completion.choices[0]?.message?.content
    
    if (!aiResponse) {
      throw new Error('No response from AI parser')
    }

    console.log('AI Response received, length:', aiResponse.length)

    // Parse the AI response
    let parsedWorkout
    try {
      parsedWorkout = JSON.parse(aiResponse)
    } catch (parseError) {
      console.error('AI response parsing error:', parseError)
      console.error('Raw AI response:', aiResponse)
      
      // Fallback: try to extract JSON from response if it contains explanatory text
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        try {
          parsedWorkout = JSON.parse(jsonMatch[0])
        } catch {
          throw new Error('Could not parse AI response as JSON')
        }
      } else {
        throw new Error('AI response does not contain valid JSON')
      }
    }

    // Validate required structure
    if (!parsedWorkout.exercises || !Array.isArray(parsedWorkout.exercises)) {
      throw new Error('Invalid workout structure: missing exercises array')
    }

    // Transform AI response to expected format for review page
    const transformedWorkout = transformAIResponseToSteps(parsedWorkout, sourceUrl)

    console.log(`Successfully parsed ${parsedWorkout.exercises.length} exercises, transformed to ${transformedWorkout.steps.length} steps`)

    return NextResponse.json({
      success: true,
      workout: transformedWorkout,
      message: 'Workout parsed successfully using AI!'
    })

  } catch (error) {
    console.error('Smart workout parser error:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown parsing error'
    
    return NextResponse.json({ 
      success: false,
      error: 'Failed to parse workout',
      details: errorMessage,
      fallback: {
        suggestion: 'Try breaking down your workout into smaller sections or use simpler formatting',
        manualParsingTips: [
          'List exercises clearly (e.g., "Bench Press: 3 sets of 10 reps at 135lbs")',
          'Separate different exercises with line breaks',
          'Include sets, reps, and weights when available',
          'Add any notes about rest periods or special instructions'
        ]
      }
    }, { status: 500 })
  }
}

function transformAIResponseToSteps(aiResponse: any, sourceUrl?: string) {
  const steps: any[] = []
  let stepOrder = 0
  
  // Extract equipment and body parts for metadata
  const allEquipment = new Set<string>()
  const allBodyParts = new Set<string>()
  const workoutTypes = new Set<string>()
  
  // Process each exercise from AI response
  for (const exercise of aiResponse.exercises || []) {
    // Add exercise name as header if it's complex
    if (exercise.sets && exercise.sets.length > 1) {
      steps.push({
        order: stepOrder++,
        type: 'header',
        raw: exercise.name,
        exercise: exercise.name
      })
    }
    
    // Process each set
    for (let setIndex = 0; setIndex < (exercise.sets?.length || 1); setIndex++) {
      const set = exercise.sets?.[setIndex] || {}
      
      steps.push({
        order: stepOrder++,
        type: 'exercise',
        raw: `${exercise.name}: ${formatSetDescription(set)}`,
        exercise: exercise.name,
        sets: exercise.sets?.length || 1,
        repsJson: set.reps ? JSON.stringify(set.reps) : undefined,
        weight: set.weight || undefined,
        duration: parseDurationStringToSeconds(set.duration) || undefined,
        distance: set.distance || undefined
      })
    }
    
    // Collect equipment and muscle groups
    if (exercise.equipment) {
      exercise.equipment.forEach((eq: string) => allEquipment.add(eq))
    }
    if (exercise.muscleGroups) {
      exercise.muscleGroups.forEach((muscle: string) => allBodyParts.add(muscle))
    }
  }
  
  // Add workout type if specified
  if (aiResponse.workoutType) {
    workoutTypes.add(aiResponse.workoutType)
  }
  
  // Estimate total duration
  let totalTimeEstimate = 0
  if (aiResponse.estimatedDuration) {
    totalTimeEstimate = parseDurationStringToSeconds(aiResponse.estimatedDuration) || 0
  }
  
  return {
    title: aiResponse.workoutTitle || 'AI Parsed Workout',
    detectedTitle: aiResponse.workoutTitle,
    steps,
    meta: {
      equipment: Array.from(allEquipment),
      bodyParts: Array.from(allBodyParts),
      workoutTypes: Array.from(workoutTypes),
      tags: []
    },
    totalTimeEstimateSec: totalTimeEstimate,
    sourceUrl: sourceUrl || null,
    originalCaption: aiResponse.notes || null
  }
}

function formatSetDescription(set: any): string {
  const parts = []
  
  if (set.reps) {
    if (typeof set.reps === 'number') {
      parts.push(`${set.reps} reps`)
    } else {
      parts.push(`${set.reps}`)
    }
  }
  
  if (set.weight) {
    parts.push(`@${set.weight}`)
  }
  
  if (set.duration) {
    parts.push(`for ${set.duration}`)
  }
  
  if (set.distance) {
    parts.push(`${set.distance}`)
  }
  
  if (set.notes) {
    parts.push(`(${set.notes})`)
  }
  
  return parts.join(' ')
}

function parseDurationStringToSeconds(duration: string): number | null {
  if (!duration || typeof duration !== 'string') return null
  
  // Handle formats like "30 seconds", "2 minutes", "1 hour"
  const timeMatch = duration.match(/(\d+(?:\.\d+)?)\s*(sec|second|min|minute|hr|hour)s?/i)
  if (timeMatch) {
    const value = parseFloat(timeMatch[1])
    const unit = timeMatch[2].toLowerCase()
    
    if (unit.startsWith('sec')) return value
    if (unit.startsWith('min')) return value * 60
    if (unit.startsWith('hr') || unit.startsWith('hour')) return value * 3600
  }
  
  // Handle MM:SS format
  const timeFormatMatch = duration.match(/(\d+):(\d+)/)
  if (timeFormatMatch) {
    const minutes = parseInt(timeFormatMatch[1])
    const seconds = parseInt(timeFormatMatch[2])
    return minutes * 60 + seconds
  }
  
  return null
}