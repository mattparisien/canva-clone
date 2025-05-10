import { NextRequest, NextResponse } from 'next/server';

// Environment variables
const API_URL = process.env.API_URL || 'http://localhost:5000';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    
    // Make the request to the backend API
    const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.message || 'Failed to process forgot password request' }, 
        { status: response.status }
      );
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error processing forgot password request:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}