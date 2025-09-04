
import { NextRequest, NextResponse } from 'next/server'

// This endpoint has been disabled for production
export async function POST(request: NextRequest) {
  return NextResponse.json({ 
    error: 'Demo endpoint disabled for production',
    details: 'This endpoint was used for testing and is no longer available. Use /api/extract-text instead.'
  }, { status: 410 })
}
