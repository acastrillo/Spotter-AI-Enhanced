

"use client"

import { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import { Upload, Image as ImageIcon, X, Loader2 } from "lucide-react"
import { Button } from "./button"
import { Card, CardContent } from "./card"
import { Alert, AlertDescription } from "./alert"

interface FileUploadProps {
  onTextExtracted: (text: string, confidence: number) => void
  onError: (error: string) => void
  disabled?: boolean
}

export function FileUpload({ onTextExtracted, onError, disabled }: FileUploadProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)

  const processImage = async (file: File) => {
    setIsProcessing(true)
    
    try {
      console.log(`📤 Uploading ${file.name} for text extraction...`)
      
      const formData = new FormData()
      formData.append('image', file)

      const response = await fetch('/api/extract-text', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      console.log(`📊 OCR response:`, result)

      // Handle the simplified API response
      if (response.status === 501) {
        // Feature is disabled
        onError('Image text extraction is currently disabled. Please use manual entry instead.')
      } else if (!response.ok) {
        onError(result.error || result.details || 'Failed to extract text')
      } else {
        // This shouldn't happen with the simplified API, but handle it gracefully
        onError('Text extraction is temporarily unavailable')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to process image'
      console.error('❌ Image processing error:', errorMessage)
      onError(errorMessage)
    } finally {
      setIsProcessing(false)
    }
  }

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      setUploadedFile(file)
      
      // Create preview
      const reader = new FileReader()
      reader.onload = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)

      // Process the image
      processImage(file)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpeg', '.jpg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
      'image/gif': ['.gif']
    },
    multiple: false,
    maxSize: 10 * 1024 * 1024, // 10MB
    disabled: disabled || isProcessing
  })

  const clearUpload = () => {
    setPreview(null)
    setUploadedFile(null)
    setIsProcessing(false)
  }

  if (preview) {
    return (
      <Card className="w-full">
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <div className="relative">
              <img 
                src={preview} 
                alt="Uploaded workout" 
                className="w-24 h-24 object-cover rounded-lg border border-border"
              />
              {isProcessing && (
                <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                  <Loader2 className="h-6 w-6 text-white animate-spin" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-text-primary truncate">
                    {uploadedFile?.name}
                  </p>
                  <p className="text-sm text-text-secondary">
                    {uploadedFile && `${(uploadedFile.size / 1024 / 1024).toFixed(1)} MB`}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearUpload}
                  disabled={isProcessing}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              {isProcessing && (
                <div className="mt-2">
                  <p className="text-sm text-text-secondary">
                    Extracting text from image...
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div
      {...getRootProps()}
      className={`
        border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
        ${isDragActive 
          ? 'border-primary bg-primary/10' 
          : 'border-border hover:border-border-hover bg-surface/50'
        }
        ${(disabled || isProcessing) ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      <input {...getInputProps()} />
      <div className="space-y-4">
        <div className="mx-auto w-12 h-12 rounded-full bg-surface flex items-center justify-center">
          {isProcessing ? (
            <Loader2 className="h-6 w-6 text-primary animate-spin" />
          ) : (
            <ImageIcon className="h-6 w-6 text-text-secondary" />
          )}
        </div>
        <div className="space-y-2">
          <p className="text-text-primary font-medium">
            {isDragActive 
              ? "Drop your workout image here" 
              : "Upload a workout image"
            }
          </p>
          <p className="text-sm text-text-secondary">
            Drag & drop or click to browse
          </p>
          <p className="text-xs text-text-secondary">
            Supports JPEG, PNG, WebP, GIF (max 10MB)
          </p>
        </div>
      </div>
    </div>
  )
}

