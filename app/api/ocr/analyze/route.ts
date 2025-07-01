import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Forward the request to the backend Express server
    const response = await fetch(`${BACKEND_URL}/api/ocr/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Backend OCR analysis failed: ${response.statusText}`);
    }

    const data = await response.json();
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('OCR analyze proxy error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      },
      { status: 500 }
    );
  }
}
