"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store"
import { Login } from "@/components/auth/login"
import { Header } from "@/components/layout/header"
import { MobileNav } from "@/components/layout/mobile-nav"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { 
  Link2, 
  Image, 
  FileText, 
  Upload, 
  CheckCircle,
  Clock,
  Dumbbell,
  Target
} from "lucide-react"

export default function ImportWorkoutPage() {
  const { isAuthenticated } = useAuthStore()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("url")
  const [url, setUrl] = useState("")
  const [workoutTitle, setWorkoutTitle] = useState("")
  const [workoutContent, setWorkoutContent] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [fetchedData, setFetchedData] = useState<any>(null)

  if (!isAuthenticated) {
    return <Login />
  }

  const handleFetch = async () => {
    if (!url.trim()) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/instagram-fetch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: url.trim() }),
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: `HTTP ${response.status}: ${response.statusText}` }))
        console.error('API Error:', error)
        throw new Error(error.error || `Failed to fetch workout (${response.status})`)
      }

      const data = await response.json()
      setFetchedData(data)
      setWorkoutTitle(data.title)
      setWorkoutContent(data.content)
      
    } catch (error) {
      console.error('Fetch error:', error)
      alert(error instanceof Error ? error.message : 'Failed to fetch workout')
    } finally {
      setIsLoading(false)
    }
  }

  const handleParseWorkout = async () => {
    if (!workoutTitle || !workoutContent) return

    try {
      // Save the workout to localStorage (or eventually to a database)
      const workout = {
        id: Date.now().toString(),
        title: workoutTitle,
        content: workoutContent,
        parsedData: fetchedData?.parsedWorkout || null,
        author: fetchedData?.author || null,
        createdAt: new Date().toISOString(),
        source: fetchedData?.url || 'manual',
        type: activeTab === 'url' ? 'social' : activeTab
      }

      // Get existing workouts
      const existingWorkouts = JSON.parse(localStorage.getItem('workouts') || '[]')
      existingWorkouts.push(workout)
      localStorage.setItem('workouts', JSON.stringify(existingWorkouts))

      // Redirect to library page
      router.push('/library')
      
    } catch (error) {
      console.error('Save error:', error)
      alert('Failed to save workout')
    }
  }

  return (
    <>
      <Header />
      <main className="min-h-screen pb-20 md:pb-8 flex justify-center">
        <div className="w-full max-w-4xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-text-primary mb-2">
              Import Workout
            </h1>
            <p className="text-text-secondary">
              Import from social media, upload images, or enter text manually
            </p>
          </div>

          {/* Main Import Card */}
          <Card className="mb-8">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-2 text-text-primary">
                <Upload className="h-5 w-5" />
                <span className="font-semibold">Import Workout</span>
              </div>
              <p className="text-sm text-text-secondary">
                Choose how you'd like to import your workout
              </p>
            </CardHeader>
            <CardContent className="pt-0">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3 mb-6">
                  <TabsTrigger value="url" className="flex items-center space-x-2">
                    <Link2 className="h-4 w-4" />
                    <span>URL/Social</span>
                  </TabsTrigger>
                  <TabsTrigger value="image" className="flex items-center space-x-2">
                    <Image className="h-4 w-4" />
                    <span>Image</span>
                  </TabsTrigger>
                  <TabsTrigger value="manual" className="flex items-center space-x-2">
                    <FileText className="h-4 w-4" />
                    <span>Manual</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="url">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">
                        Source URL
                      </label>
                      <div className="flex space-x-2">
                        <Input
                          placeholder="https://www.instagram.com/p/..."
                          value={url}
                          onChange={(e) => setUrl(e.target.value)}
                          className="flex-1"
                        />
                        <Button 
                          onClick={handleFetch}
                          disabled={isLoading || !url.trim()}
                        >
                          {isLoading ? "Fetching..." : "Fetch"}
                        </Button>
                      </div>
                      <p className="text-sm text-text-secondary mt-2">
                        Social media URL format: Paste URLs from Instagram, TikTok, or other platforms
                      </p>
                      
                      {fetchedData ? (
                        <div className="mt-4 p-4 bg-primary/10 border border-primary/20 rounded-lg">
                          <div className="flex items-start space-x-2 mb-3">
                            <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                            <div className="text-sm">
                              <span className="text-primary font-medium">Workout fetched successfully!</span>
                              <span className="text-text-secondary"> From @{fetchedData.author.username}</span>
                            </div>
                          </div>
                          <div className="mt-3 p-3 bg-surface rounded-lg">
                            <h4 className="text-sm font-medium text-text-primary mb-2">
                              Full Caption Content:
                            </h4>
                            <div className="text-xs text-text-secondary whitespace-pre-wrap max-h-32 overflow-y-auto">
                              {fetchedData.content}
                            </div>
                            {fetchedData.parsedWorkout.exercises.length > 0 && (
                              <div className="mt-3 pt-3 border-t border-border">
                                <h4 className="text-sm font-medium text-text-primary mb-2">
                                  Detected {fetchedData.parsedWorkout.exercises.length} exercises:
                                </h4>
                                <div className="space-y-1 max-h-24 overflow-y-auto">
                                  {fetchedData.parsedWorkout.exercises.map((exercise: any, idx: number) => (
                                    <div key={idx} className="text-xs text-text-secondary">
                                      {exercise.name}
                                      {exercise.sets && exercise.reps && ` - ${exercise.sets}x${exercise.reps}`}
                                      {exercise.time && ` - ${exercise.time}`}
                                      {exercise.weight && ` - ${exercise.weight}`}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="mt-3 p-3 bg-primary/10 border border-primary/20 rounded-lg">
                          <div className="flex items-start space-x-2">
                            <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                            <div className="text-sm">
                              <span className="text-primary font-medium">Instagram import ready:</span>
                              <span className="text-text-secondary"> Click "Fetch" after entering an Instagram URL to automatically extract the workout content.</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="image">
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
                      <Image className="h-12 w-12 text-text-secondary mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-text-primary mb-2">Upload Workout Image</h3>
                      <p className="text-text-secondary mb-4">
                        Drag and drop an image or click to browse
                      </p>
                      <Button variant="outline">
                        Choose File
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="manual">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">
                        Workout Title
                      </label>
                      <Input
                        placeholder="e.g., Upper Body Strength, AMRAP 20"
                        value={workoutTitle}
                        onChange={(e) => setWorkoutTitle(e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">
                        Workout Content
                      </label>
                      <Textarea
                        placeholder="Your workout content will appear here..."
                        value={workoutContent}
                        onChange={(e) => setWorkoutContent(e.target.value)}
                        className="min-h-[200px]"
                      />
                      <p className="text-sm text-text-secondary mt-2">
                        {workoutContent.length}/5000 characters
                      </p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex justify-center mt-8">
                <Button 
                  size="lg" 
                  className="px-8"
                  onClick={handleParseWorkout}
                  disabled={!workoutTitle || !workoutContent}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Parse Workout
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* What We Can Parse Section */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-2 text-primary">
                <CheckCircle className="h-5 w-5" />
                <CardTitle className="text-lg">What We Can Parse</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-semibold text-text-primary mb-3">Exercise Formats</h4>
                  <ul className="text-sm text-text-secondary space-y-2">
                    <li>• Sets x Reps (3x10, 4 sets of 8)</li>
                    <li>• Time-based (30 sec, 1:30)</li>
                    <li>• Distances (400m, 1 mile)</li>
                    <li>• Rest periods (Rest 60s)</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-text-primary mb-3">Workout Types</h4>
                  <ul className="text-sm text-text-secondary space-y-2">
                    <li>• AMRAP, EMOM, Tabata</li>
                    <li>• For Time, Ladders</li>
                    <li>• Supersets, Circuits</li>
                    <li>• Equipment detection</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-text-primary mb-3">Import Sources</h4>
                  <ul className="text-sm text-text-secondary space-y-2">
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