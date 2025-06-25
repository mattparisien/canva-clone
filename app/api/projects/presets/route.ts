import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Forward the request to the backend API
    const backendUrl = 'http://localhost:3001/api/projects/presets';
    
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`);
    }

    const data = await response.json();
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching project presets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project presets' },
      { status: 500 }
    );
  }
}
