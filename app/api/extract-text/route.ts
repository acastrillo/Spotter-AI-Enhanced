

import { NextRequest, NextResponse } from 'next/server'

// Simplified API - OCR functionality removed for now
export async function POST(request: NextRequest) {
  console.log('🔍 Text extraction API called (functionality disabled)')
  
  try {
    const formData = await request.formData()
    const file = formData.get('image') as File

    if (!file) {
      return NextResponse.json({ error: 'No image file provided' }, { status: 400 })
    }

    console.log(`📁 File received: ${file.name} (${file.type}, ${(file.size / 1024).toFixed(1)}KB)`)

    // For now, just return a message that OCR is disabled
    return NextResponse.json({
      error: 'Image text extraction is temporarily disabled',
      details: 'OCR functionality has been removed to focus on core app features',
      file_received: file.name,
      file_size_kb: Math.round(file.size / 1024),
      suggestion: 'Please use manual entry or Instagram import for now'
    }, { status: 501 }) // Not Implemented

  } catch (error) {
    console.error('❌ API error:', error)
    return NextResponse.json({ 
      error: 'Failed to process request',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

