import { NextRequest, NextResponse } from 'next/server';

// Environment variables
const API_URL = process.env.API_URL || 'http://localhost:3001';

export async function GET(request: NextRequest) {
  // Extract query parameters
  const searchParams = request.nextUrl.searchParams;
  const userId = searchParams.get('userId');
  const parentId = searchParams.get('parentId');
  
  try {
    // Construct the URL with query parameters
    let url = `${API_URL}/api/folders`;
    if (userId) {
      url += `?userId=${userId}`;
      if (parentId !== null) {
        url += `&parentId=${parentId === 'null' ? 'null' : parentId}`;
      }
    } else if (parentId !== null) {
      url += `?parentId=${parentId === 'null' ? 'null' : parentId}`;
    }
    
    // Make the request to the backend API
    const response = await fetch(url);
    
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
  try {
    const folderData = await request.json();
    
    // Make the request to the backend API
    const response = await fetch(`${API_URL}/api/folders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
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