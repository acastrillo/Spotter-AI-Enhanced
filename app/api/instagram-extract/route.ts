import { NextRequest, NextResponse } from 'next/server'
import { ApifyClient } from 'apify-client'

export async function POST(request: NextRequest) {
  try {
    const { postUrl } = await request.json()
    
    if (!postUrl) {
      return NextResponse.json({ 
        error: 'Instagram post URL is required' 
      }, { status: 400 })
    }

    console.log('Instagram extraction requested for:', postUrl)

    const apiToken = process.env.APIFY_API_TOKEN
    if (!apiToken) {
      console.error('Apify API token not configured')
      return NextResponse.json({
        error: 'Service configuration error',
        message: 'Instagram extraction service is not properly configured'
      }, { status: 500 })
    }

    // Initialize the ApifyClient with API token
    const client = new ApifyClient({
      token: apiToken,
    })

    // Validate that it's a proper Instagram post URL
    const postId = extractPostIdFromUrl(postUrl)
    if (!postId) {
      return NextResponse.json({
        error: 'Invalid Instagram URL format',
        message: 'Please provide a valid Instagram post URL (e.g., https://www.instagram.com/p/ABC123/)'
      }, { status: 400 })
    }

    // Prepare Actor input - based on your working example, put URL in username field
    const input = {
      username: [postUrl], // This actor expects the URL in username field (weird but works)
      resultsType: "posts", // We want post data including full caption  
      resultsLimit: 1 // We only need one post
    }

    try {

      console.log('Running Apify Instagram scraper with input:', input)

      // Run the Actor and wait for it to finish
      const run = await client.actor("nH2AHrwxeTRJoN5hX").call(input)

      // Fetch and process Actor results from the run's dataset
      const { items } = await client.dataset(run.defaultDatasetId).listItems()
      
      if (!items || items.length === 0) {
        return NextResponse.json({
          success: false,
          error: 'No data extracted',
          message: 'The Instagram post could not be extracted. It may be private or unavailable.',
          fallback: {
            suggestion: 'Try copying the post content manually from Instagram',
            manualEntry: true,
            postUrl: postUrl
          }
        }, { status: 404 })
      }

      const postData = items[0] // Get the first (and likely only) result
      console.log('Successfully fetched post data via Apify')
      console.log('Post data structure:', {
        hasCaption: !!postData.caption,
        captionLength: postData.caption?.length || 0,
        captionPreview: postData.caption?.substring(0, 100) + '...',
        ownerUsername: postData.ownerUsername,
        postId: postData.id,
        allKeys: Object.keys(postData)
      })

      const workoutContent = extractWorkoutFromPost(postData)
      const username_extracted = postData.ownerUsername || extractUsernameFromUrl(postUrl) || 'user'
      
      console.log('Workout extraction results:', {
        hasWorkoutContent: !!workoutContent,
        workoutContentLength: workoutContent?.length || 0,
        username_extracted: username_extracted
      })

      // Always return success with full caption, regardless of workout detection
      const finalWorkoutContent = workoutContent || postData.caption || ''

      return NextResponse.json({
        success: true,
        workoutContent: finalWorkoutContent, // Use full caption if no workout detected
        caption: postData.caption || '',
        postId: postData.id || extractPostIdFromUrl(postUrl),
        postUrl: postUrl,
        username: username_extracted,
        suggestedTitle: `Post from @${username_extracted}`,
        extractedAt: new Date().toISOString(),
        method: 'apify_extraction',
        metadata: {
          likes: postData.likesCount || 0,
          comments: postData.commentsCount || 0,
          media_type: postData.type || 'unknown',
          taken_at: postData.timestamp ? new Date(postData.timestamp as string | number | Date).toISOString() : null,
          isWorkoutDetected: !!workoutContent
        },
        message: workoutContent ? 'Workout content extracted successfully!' : 'Post content extracted successfully!'
      })

    } catch (apiError: any) {
      console.error('Apify request failed:', apiError)
      
      // Handle specific Apify errors with detailed logging
      if (apiError.message?.includes('insufficient credit')) {
        return NextResponse.json({
          success: false,
          error: 'Service quota exceeded',
          message: 'Instagram extraction service has exceeded its quota. Please try again later.',
          fallback: {
            suggestion: 'Try copying the workout text manually from the Instagram post',
            manualEntry: true,
            postUrl: postUrl
          }
        }, { status: 429 })
      }
      
      // Handle input validation errors
      if (apiError.message?.includes('Input is not valid') || apiError.statusCode === 400) {
        console.error('Apify input validation error:', {
          message: apiError.message,
          statusCode: apiError.statusCode,
          type: apiError.type,
          inputUsed: input
        })
        return NextResponse.json({
          success: false,
          error: 'Invalid input configuration',
          message: 'There was an issue with the scraper configuration. This may be a temporary issue.',
          details: apiError.message,
          fallback: {
            suggestion: 'Try copying the workout text manually from the Instagram post',
            manualEntry: true,
            postUrl: postUrl
          }
        }, { status: 422 })
      }

      return NextResponse.json({
        success: false,
        error: 'Failed to fetch Instagram post',
        message: 'Unable to extract post content. The post may be private or the service may be temporarily unavailable.',
        fallback: {
          suggestion: 'Try copying the workout text manually from the Instagram post',
          manualEntry: true,
          postUrl: postUrl
        }
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Instagram extraction error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      message: 'An unexpected error occurred while processing your request'
    }, { status: 500 })
  }
}

function extractPostIdFromUrl(url: string): string | null {
  const match = url.match(/instagram\.com\/(?:p|reel)\/([A-Za-z0-9_-]+)/)
  return match ? match[1] : null
}

function extractUsernameFromUrl(url: string): string | null {
  // Handle both profile URLs and post URLs
  const profileMatch = url.match(/instagram\.com\/([A-Za-z0-9_.]+)\/?(?:\?|$)/)
  const postMatch = url.match(/instagram\.com\/([A-Za-z0-9_.]+)\/(?:p|reel)/)
  
  return postMatch ? postMatch[1] : (profileMatch ? profileMatch[1] : null)
}

function extractWorkoutFromPost(postData: any): string | null {
  const caption = postData.caption || ''
  
  if (!caption) return null

  const workoutKeywords = [
    'workout', 'exercise', 'reps', 'sets', 'lbs', 'kg', 'pounds', 'kilos',
    'push', 'pull', 'squat', 'deadlift', 'bench', 'press', 'curl', 'row',
    'cardio', 'hiit', 'training', 'gym', 'fitness', 'strength', 'muscle'
  ]

  const hasWorkoutKeywords = workoutKeywords.some(keyword => 
    caption.toLowerCase().includes(keyword.toLowerCase())
  )

  if (!hasWorkoutKeywords) {
    return null
  }

  const lines = caption.split('\n')
  const workoutLines = []
  let foundWorkout = false

  for (const line of lines) {
    const cleanLine = line.trim()
    if (!cleanLine) continue

    const hasExercisePattern = /\d+\s*x\s*\d+|\d+\s*(reps?|sets?|lbs?|kg)/.test(cleanLine)
    const hasWorkoutWord = workoutKeywords.some(keyword => 
      cleanLine.toLowerCase().includes(keyword.toLowerCase())
    )

    if (hasExercisePattern || hasWorkoutWord) {
      foundWorkout = true
      workoutLines.push(cleanLine)
    } else if (foundWorkout && cleanLine.length > 5 && !cleanLine.startsWith('#')) {
      workoutLines.push(cleanLine)
    }
  }

  return foundWorkout && workoutLines.length > 0 ? workoutLines.join('\n') : null
}