
"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { MobileNav } from "@/components/layout/mobile-nav"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  ArrowLeft,
  Link2,
  Image,
  Edit3,
  CheckCircle
} from "lucide-react"
import Link from "next/link"

export default function AddWorkoutPage() {
  const { data: session, status } = useSession() || {}
  const router = useRouter()
  const [sourceUrl, setSourceUrl] = useState("")
  const [workoutTitle, setWorkoutTitle] = useState("")
  const [workoutContent, setWorkoutContent] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login")
    }
  }, [status, router])

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-border border-t-primary"></div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  const handleFetch = async () => {
    if (!sourceUrl) return
    setIsLoading(true)
    try {
      // Use HikerAPI to extract Instagram workout content
      const response = await fetch('/api/instagram-extract', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ postUrl: sourceUrl }),
      })
      
      const data = await response.json()
      
      if (data.success) {
        // Set suggested title and extracted content - use full caption instead of filtered workoutContent
        setWorkoutTitle(data.suggestedTitle || 'Extracted Workout')
        setWorkoutContent(data.caption || data.workoutContent || '')
        
        console.log('Content extracted successfully from Instagram:', {
          captionLength: data.caption?.length || 0,
          workoutContentLength: data.workoutContent?.length || 0,
          usingFullCaption: !!data.caption
        })
      } else {
        // Show error with fallback instructions
        setWorkoutContent(`❌ **Extraction Failed:** ${data.error}

**Details:** ${data.details || 'Unknown error'}

**${data.fallback?.suggestion || 'Please try copying the content manually.'}**

${data.fallback?.instructions ? data.fallback.instructions.map((instruction, i) => `${i + 1}. ${instruction}`).join('\n') : ''}

---
**Paste your workout content below:**
`)
      }
    } catch (error) {
      console.error("Fetch error:", error)
      setWorkoutContent("❌ Failed to extract content from URL. Please paste your workout content manually.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleParseWorkout = async () => {
    if (!workoutContent) return
    
    console.log('🚀 Parse workout clicked:', {
      workoutTitle: workoutTitle,
      workoutContentLength: workoutContent.length,
      sourceUrl: sourceUrl
    })
    
    setIsLoading(true)
    try {
      const response = await fetch('/api/parse-workout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          title: workoutTitle || 'Untitled Workout',
          caption: workoutContent,
          sourceUrl: sourceUrl || undefined
        }),
      })
      
      const data = await response.json()
      
      console.log('📊 Parse response received:', {
        success: data.success,
        hasWorkout: !!data.workout,
        error: data.error,
        stats: data.stats
      })
      
      if (data.success && data.workout) {
        console.log('✅ Parsing successful, navigating to review page')
        // Pass the parsed workout via URL parameters to review page
        const workoutDataParam = encodeURIComponent(JSON.stringify(data.workout))
        router.push(`/add/review?data=${workoutDataParam}`)
      } else {
        console.log('❌ Parsing failed:', data.error)
        // Show error with helpful suggestions
        const errorMessage = `❌ **Parsing Error:** ${data.error}\n\n**Details:** ${data.details || 'Unknown error'}\n\n**Suggestions:**\n${data.fallback?.manualParsingTips?.join('\n') || 'Try simplifying your workout format'}`
        setWorkoutContent(prev => `${prev}\n\n---\n\n${errorMessage}`)
      }
    } catch (error) {
      console.error("❌ Parse request failed:", error)
      setWorkoutContent(prev => `${prev}\n\n---\n\n❌ **Failed to parse workout.** Please check your formatting and try again.`)
    } finally {
      setIsLoading(false)
    }
  }


  return (
    <>
      <main className="min-h-screen pb-20 md:pb-8 bg-background">
        <div className="container-padding py-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <Link href="/" className="p-2">
              <ArrowLeft className="h-6 w-6 text-text-secondary" />
            </Link>
          </div>
          
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-text-primary mb-2">
              Import Workout
            </h1>
            <p className="text-text-secondary">
              Import from social media, upload images, or enter text manually
            </p>
          </div>

          {/* Import Tabs */}
          <Card className="bg-surface border-border mb-6">
            <CardContent className="p-6">
              <Tabs defaultValue="url-social" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-6 bg-surface-elevated">
                  <TabsTrigger value="url-social" className="flex items-center gap-2">
                    <Link2 className="h-4 w-4" />
                    URL/Social
                  </TabsTrigger>
                  <TabsTrigger value="image" className="flex items-center gap-2">
                    <Image className="h-4 w-4" />
                    Image
                  </TabsTrigger>
                  <TabsTrigger value="manual" className="flex items-center gap-2">
                    <Edit3 className="h-4 w-4" />
                    Manual
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="url-social" className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="source-url" className="text-sm font-medium text-text-primary">
                      Source URL
                    </label>
                    <div className="flex gap-2">
                      <Input
                        id="source-url"
                        placeholder="https://www.instagram.com/p/..."
                        value={sourceUrl}
                        onChange={(e) => setSourceUrl(e.target.value)}
                        className="flex-1"
                      />
                      <Button 
                        onClick={handleFetch}
                        disabled={!sourceUrl || isLoading}
                        variant="outline"
                      >
                        {isLoading ? "Fetching..." : "Fetch"}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="text-sm text-text-secondary">
                    Social media URL format: Paste URLs from Instagram, TikTok, or other platforms
                  </div>
                  
                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-green-400">
                        <strong>Instagram Import ready:</strong> Click "Fetch" after entering an Instagram URL to automatically extract the workout content.
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="image" className="space-y-4">
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                    <Image className="h-12 w-12 mx-auto mb-4 text-text-secondary" />
                    <p className="text-text-secondary mb-2">
                      Upload workout images
                    </p>
                    <Button variant="outline">
                      Choose Files
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="manual" className="space-y-4">
                  <div className="text-sm text-text-secondary">
                    Manually enter workout details
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Workout Form */}
          <Card className="bg-surface border-border mb-6">
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <label htmlFor="workout-title" className="text-sm font-medium text-text-primary">
                  Workout Title
                </label>
                <Input
                  id="workout-title"
                  placeholder="e.g., Upper Body Strength, AMRAP 20"
                  value={workoutTitle}
                  onChange={(e) => setWorkoutTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="workout-content" className="text-sm font-medium text-text-primary">
                  Workout Content
                </label>
                <Textarea
                  id="workout-content"
                  placeholder="Your workout content will appear here..."
                  value={workoutContent}
                  onChange={(e) => setWorkoutContent(e.target.value)}
                  rows={8}
                  className="resize-none"
                />
                <div className="text-xs text-text-secondary text-right">
                  {workoutContent.length}/500 characters
                </div>
              </div>

              <Button 
                onClick={handleParseWorkout}
                disabled={!workoutContent || isLoading}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white"
                size="lg"
              >
                {isLoading ? "Parsing..." : "Parse Workout"}
              </Button>
            </CardContent>
          </Card>

          {/* What We Can Parse Section */}
          <Card className="bg-surface border-border">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <h3 className="text-lg font-semibold text-text-primary">
                  What We Can Parse
                </h3>
              </div>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-medium text-text-primary mb-2">Exercise Formats</h4>
                  <ul className="text-sm text-text-secondary space-y-1">
                    <li>• Sets x Reps (3x10, 4 sets of 8)</li>
                    <li>• Time-based (30 sec, 1:30)</li>
                    <li>• Distances (400m, 1 mile)</li>
                    <li>• Rest periods (Rest 60s)</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium text-text-primary mb-2">Workout Types</h4>
                  <ul className="text-sm text-text-secondary space-y-1">
                    <li>• AMRAP, EMOM, Tabata</li>
                    <li>• For Time, Ladders</li>
                    <li>• Supersets, Circuits</li>
                    <li>• Equipment detection</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium text-text-primary mb-2">Import Sources</h4>
                  <ul className="text-sm text-text-secondary space-y-1">
                    <li>• Instagram posts & captions</li>
                    <li>• Image text (OCR)</li>
                    <li>• Manual text entry</li>
                    <li>• Social media URLs</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <MobileNav />
    </>
  )
}
