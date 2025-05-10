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
  
  // Extract query parameters
  const searchParams = request.nextUrl.searchParams;
  const userId = searchParams.get('userId');
  const parentId = searchParams.get('parentId');
  
  if (!userId) {
    return NextResponse.json({ error: 'userId is required' }, { status: 400 });
  }
  
  try {
    // Construct the URL with query parameters
    let url = `${API_URL}/api/folders?userId=${userId}`;
    if (parentId !== null) {
      url += `&parentId=${parentId === 'null' ? 'null' : parentId}`;
    }
    
    // Make the request to the backend API
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${session.accessToken}`
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.message || 'Failed to fetch folders' }, 
        { status: response.status }
      );
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching folders:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }
  
  try {
    const folderData = await request.json();
    
    // Make the request to the backend API
    const response = await fetch(`${API_URL}/api/folders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.accessToken}`
      },
      body: JSON.stringify(folderData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.message || 'Failed to create folder' }, 
        { status: response.status }
      );
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creating folder:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}