

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { 
  Save,
  FileText,
  Loader2,
  CheckCircle,
  AlertTriangle,
  Edit3
} from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface ManualEditorProps {
  initialTitle?: string
  initialCaption?: string
  initialSourceUrl?: string
  source: 'manual' | 'instagram' | 'image'
  onSavePartial?: (workoutId: string) => void
  onParseWorkout?: (title: string, caption: string, sourceUrl?: string) => void
  disabled?: boolean
}

export function ManualEditor({ 
  initialTitle = '', 
  initialCaption = '', 
  initialSourceUrl = '',
  source,
  onSavePartial,
  onParseWorkout,
  disabled = false
}: ManualEditorProps) {
  const [title, setTitle] = useState(initialTitle)
  const [caption, setCaption] = useState(initialCaption)
  const [sourceUrl, setSourceUrl] = useState(initialSourceUrl)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleSavePartial = async () => {
    if (!title.trim() || !caption.trim()) {
      setError('Both title and workout content are required')
      return
    }

    setIsSaving(true)
    setError(null)

    try {
      const response = await fetch('/api/save-partial-workout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim(),
          caption: caption.trim(),
          sourceUrl: sourceUrl.trim() || null,
          source,
          notes: `Saved as draft from ${source} import`
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save partial workout')
      }

      setSuccess('Workout saved as draft! You can edit and complete it later in your library.')
      toast({
        title: "Saved as Draft",
        description: "Workout saved to your library. You can complete the parsing later.",
      })

      if (onSavePartial) {
        onSavePartial(result.workoutId)
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save partial workout'
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleParseWorkout = async () => {
    if (!title.trim() || !caption.trim()) {
      setError('Both title and workout content are required')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      if (onParseWorkout) {
        await onParseWorkout(title.trim(), caption.trim(), sourceUrl.trim() || undefined)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to parse workout'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const canSave = title.trim() && caption.trim() && !disabled
  const sourceLabels = {
    manual: 'Manual Entry',
    instagram: 'Instagram Import',
    image: 'Image Upload'
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Edit3 className="h-5 w-5 text-primary" />
              Edit Workout
            </CardTitle>
            <CardDescription>
              Review and edit your workout before parsing or saving as draft
            </CardDescription>
          </div>
          <Badge variant="secondary" className="text-xs">
            {sourceLabels[source]}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Title Field */}
        <div className="space-y-2">
          <Label htmlFor="edit-title">Workout Title</Label>
          <Input
            id="edit-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Upper Body Strength, AMRAP 20"
            className="bg-surface border-border"
            disabled={disabled}
          />
        </div>

        {/* Source URL Field (if applicable) */}
        {source === 'instagram' && (
          <div className="space-y-2">
            <Label htmlFor="edit-source">Source URL</Label>
            <Input
              id="edit-source"
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              placeholder="https://www.instagram.com/p/ABC123xyz/"
              className="bg-surface border-border"
              disabled={disabled}
            />
          </div>
        )}

        {/* Caption Field */}
        <div className="space-y-2">
          <Label htmlFor="edit-caption">Workout Content</Label>
          <Textarea
            id="edit-caption"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Enter your workout details here..."
            className="bg-surface border-border min-h-[200px] resize-none"
            rows={10}
            disabled={disabled}
          />
          <p className="text-xs text-text-secondary">
            {caption.length}/5000 characters
          </p>
        </div>

        {/* Status Messages */}
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-green-500/20 bg-green-500/10">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <AlertDescription className="text-green-700 dark:text-green-400">
              {success}
            </AlertDescription>
          </Alert>
        )}

        <Separator />

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={handleSavePartial}
            disabled={!canSave || isSaving}
            variant="outline"
            className="flex-1 sm:flex-initial"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Saving Draft...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save as Draft
              </>
            )}
          </Button>
          
          <Button
            onClick={handleParseWorkout}
            disabled={!canSave || isLoading}
            className="flex-1"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Parsing...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4 mr-2" />
                Parse Workout
              </>
            )}
          </Button>
        </div>

        {/* Help Text */}
        <div className="text-sm text-text-secondary bg-surface/50 rounded-lg p-4">
          <h4 className="font-medium text-text-primary mb-2">What happens next?</h4>
          <ul className="space-y-1">
            <li><strong>Save as Draft:</strong> Saves the workout to your library for editing later</li>
            <li><strong>Parse Workout:</strong> Analyzes the text and creates structured workout steps</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}

