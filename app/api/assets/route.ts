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
  const folderId = searchParams.get('folderId');
  const type = searchParams.get('type');
  
  if (!userId) {
    return NextResponse.json({ error: 'userId is required' }, { status: 400 });
  }
  
  try {
    // Construct the URL with query parameters
    let url = `${API_URL}/api/assets?userId=${userId}`;
    
    if (folderId !== null) {
      url += `&folderId=${folderId === 'null' ? 'null' : folderId}`;
    }
    
    if (type) {
      url += `&type=${type}`;
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
        { error: errorData.message || 'Failed to fetch assets' }, 
        { status: response.status }
      );
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching assets:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

// Handling file uploads requires special handling with formdata
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }
  
  try {
    // Clone the request to access the formData
    const formData = await request.formData();
    
    // Make the request to the backend API
    const response = await fetch(`${API_URL}/api/assets/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`
        // Don't set Content-Type here, it will be set automatically with the boundary
      },
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.message || 'Failed to upload asset' }, 
        { status: response.status }
      );
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error uploading asset:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}