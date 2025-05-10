import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@lib/auth';

// Environment variables
const API_URL = process.env.API_URL || 'http://localhost:5000';

export async function GET(request: NextRequest) {
  // Get session to verify authentication
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }
  
  try {
    // Make the request to the backend API
    const response = await fetch(`${API_URL}/api/auth/me`, {
      headers: {
        'Authorization': `Bearer ${session.accessToken}`
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.message || 'Failed to verify token' }, 
        { status: response.status }
      );
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error verifying token:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}