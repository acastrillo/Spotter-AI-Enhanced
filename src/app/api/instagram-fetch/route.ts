import { NextRequest, NextResponse } from 'next/server'

interface ApifyInstagramResult {
  url: string
  caption: string
  displayUrl: string
  timestamp: string
  likesCount: number
  commentsCount: number
  ownerUsername: string
  ownerFullName: string
}

interface InstagramFetchRequest {
  url: string
}

export async function POST(request: NextRequest) {
  try {
    const { url }: InstagramFetchRequest = await request.json()

    if (!url) {
      return NextResponse.json(
        { error: 'Instagram URL is required' },
        { status: 400 }
      )
    }

    // Validate Instagram URL format
    const instagramUrlPattern = /^https?:\/\/(www\.)?(instagram\.com|instagr\.am)\/(p|reel)\/[\w-]+\/?/
    if (!instagramUrlPattern.test(url)) {
      return NextResponse.json(
        { error: 'Invalid Instagram URL format' },
        { status: 400 }
      )
    }

    const apifyApiToken = process.env.APIFY_API_TOKEN
    if (!apifyApiToken) {
      console.error('APIFY_API_TOKEN is not configured')
      return NextResponse.json(
        { error: 'API configuration error' },
        { status: 500 }
      )
    }

    // Call Apify Instagram scraper
    const apifyResponse = await fetch('https://api.apify.com/v2/acts/shu8hvrXbJbY3Eb9W/run-sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apifyApiToken}`,
      },
      body: JSON.stringify({
        startUrls: [{ url }],
        resultsLimit: 1,
        addParentData: false,
      }),
    })

    if (!apifyResponse.ok) {
      const errorText = await apifyResponse.text()
      console.error('Apify API error:', apifyResponse.status, errorText)
      return NextResponse.json(
        { error: 'Failed to fetch Instagram data' },
        { status: apifyResponse.status }
      )
    }

    const apifyData = await apifyResponse.json()
    
    if (!apifyData.defaultDatasetId) {
      return NextResponse.json(
        { error: 'No data returned from Instagram' },
        { status: 404 }
      )
    }

    // Get the dataset results
    const datasetResponse = await fetch(
      `https://api.apify.com/v2/datasets/${apifyData.defaultDatasetId}/items`,
      {
        headers: {
          'Authorization': `Bearer ${apifyApiToken}`,
        },
      }
    )

    const results: ApifyInstagramResult[] = await datasetResponse.json()

    if (!results || results.length === 0) {
      return NextResponse.json(
        { error: 'No Instagram post found' },
        { status: 404 }
      )
    }

    const post = results[0]

    // Extract workout content from caption
    const workoutData = {
      url: post.url,
      title: `Instagram Workout - ${new Date(post.timestamp).toLocaleDateString()}`,
      content: post.caption || '',
      author: {
        username: post.ownerUsername,
        fullName: post.ownerFullName,
      },
      stats: {
        likes: post.likesCount,
        comments: post.commentsCount,
      },
      image: post.displayUrl,
      timestamp: post.timestamp,
      // Parse workout from caption
      parsedWorkout: parseWorkoutFromCaption(post.caption || ''),
    }

    return NextResponse.json(workoutData)

  } catch (error) {
    console.error('Instagram fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function parseWorkoutFromCaption(caption: string) {
  // Basic workout parsing logic
  const lines = caption.split('\n').filter(line => line.trim())
  const exercises: Array<{ name: string; sets?: string; reps?: string; weight?: string; time?: string }> = []
  
  // Look for common workout patterns
  lines.forEach(line => {
    // Pattern: "Exercise: 3x10" or "Exercise - 3 sets x 10 reps"
    const setRepMatch = line.match(/(.+?)[-:]?\s*(\d+)\s*x\s*(\d+)/i)
    if (setRepMatch) {
      exercises.push({
        name: setRepMatch[1].trim().replace(/^\d+\.\s*/, ''), // Remove number prefix
        sets: setRepMatch[2],
        reps: setRepMatch[3],
      })
      return
    }

    // Pattern: "Exercise: 30 seconds" or "Exercise - 2 minutes"
    const timeMatch = line.match(/(.+?)[-:]?\s*(\d+)\s*(sec|second|min|minute)s?/i)
    if (timeMatch) {
      exercises.push({
        name: timeMatch[1].trim().replace(/^\d+\.\s*/, ''),
        time: `${timeMatch[2]} ${timeMatch[3]}`,
      })
      return
    }

    // Pattern: "Exercise with weight: 50lbs" or "Exercise @ 25kg"
    const weightMatch = line.match(/(.+?)[@-:]?\s*(\d+)\s*(lbs?|kg|pounds?)/i)
    if (weightMatch) {
      exercises.push({
        name: weightMatch[1].trim().replace(/^\d+\.\s*/, ''),
        weight: `${weightMatch[2]}${weightMatch[3]}`,
      })
      return
    }

    // Simple exercise name (if it looks like an exercise)
    if (line.match(/^\d+\.\s*/) || 
        line.toLowerCase().includes('squat') ||
        line.toLowerCase().includes('push') ||
        line.toLowerCase().includes('pull') ||
        line.toLowerCase().includes('press') ||
        line.toLowerCase().includes('curl') ||
        line.toLowerCase().includes('row')) {
      exercises.push({
        name: line.trim().replace(/^\d+\.\s*/, ''),
      })
    }
  })

  return {
    exercises,
    rawText: caption,
    totalExercises: exercises.length,
  }
}