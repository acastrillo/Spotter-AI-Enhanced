"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Share2, 
  Instagram, 
  Twitter, 
  Facebook,
  Copy,
  Download,
  CheckCircle,
  X
} from "lucide-react"

interface WorkoutSummary {
  title: string
  duration: string
  exercises: number
  totalReps?: number
  totalWeight?: number
  date: Date
}

interface SocialShareProps {
  workout: WorkoutSummary
  isOpen: boolean
  onClose: () => void
}

export function SocialShare({ workout, isOpen, onClose }: SocialShareProps) {
  const [copied, setCopied] = useState(false)

  if (!isOpen) return null

  const shareText = `💪 Just crushed "${workout.title}"!

⏱️ Duration: ${workout.duration}
🏋️ ${workout.exercises} exercises completed
${workout.totalReps ? `🔥 ${workout.totalReps} total reps` : ''}
${workout.totalWeight ? `⚖️ ${workout.totalWeight}lbs moved` : ''}

Another step closer to my fitness goals! 🎯

#Spotter #Fitness #WorkoutComplete #FitnessJourney`

  const shareUrl = typeof window !== 'undefined' ? window.location.origin : ''

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
    }
  }

  const handleInstagramShare = () => {
    // Instagram doesn't support direct URL sharing, so we copy the text
    handleCopyToClipboard()
    // Open Instagram in new tab for user to paste
    window.open('https://www.instagram.com/', '_blank')
  }

  const handleTwitterShare = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`
    window.open(twitterUrl, '_blank')
  }

  const handleFacebookShare = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`
    window.open(facebookUrl, '_blank')
  }

  const handleDownloadImage = () => {
    // This would generate a workout summary image
    // For now, we'll just trigger the copy functionality
    handleCopyToClipboard()
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="bg-surface border-border max-w-md w-full max-h-[90vh] overflow-y-auto">
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Share2 className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold text-text-primary">Share Your Achievement</h3>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-text-secondary hover:text-text-primary"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Workout Summary */}
          <div className="mb-6 p-4 bg-background/50 rounded-lg border border-border/50">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="font-medium text-green-400">Workout Completed!</span>
            </div>
            
            <h4 className="font-bold text-text-primary mb-2">{workout.title}</h4>
            
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="text-xs">
                ⏱️ {workout.duration}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                🏋️ {workout.exercises} exercises
              </Badge>
              {workout.totalReps && (
                <Badge variant="secondary" className="text-xs">
                  🔥 {workout.totalReps} reps
                </Badge>
              )}
              {workout.totalWeight && (
                <Badge variant="secondary" className="text-xs">
                  ⚖️ {workout.totalWeight}lbs
                </Badge>
              )}
            </div>
          </div>

          {/* Share Preview */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-text-primary mb-2">Share Message:</h4>
            <div className="p-3 bg-background/30 rounded-lg border border-border/50 text-sm text-text-secondary max-h-32 overflow-y-auto">
              <pre className="whitespace-pre-wrap font-sans">{shareText}</pre>
            </div>
          </div>

          {/* Share Buttons */}
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={handleInstagramShare}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
              >
                <Instagram className="h-4 w-4 mr-2" />
                Instagram
              </Button>
              
              <Button
                onClick={handleTwitterShare}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                <Twitter className="h-4 w-4 mr-2" />
                Twitter
              </Button>
            </div>
            
            <Button
              onClick={handleFacebookShare}
              variant="outline"
              className="w-full border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
            >
              <Facebook className="h-4 w-4 mr-2" />
              Facebook
            </Button>

            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={handleCopyToClipboard}
                variant="outline"
                className={copied ? "border-green-500/50 text-green-400" : ""}
              >
                {copied ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Text
                  </>
                )}
              </Button>
              
              <Button
                onClick={handleDownloadImage}
                variant="outline"
              >
                <Download className="h-4 w-4 mr-2" />
                Save Image
              </Button>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-border/50">
            <p className="text-xs text-text-secondary text-center">
              Share your fitness journey and inspire others! 🚀
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}