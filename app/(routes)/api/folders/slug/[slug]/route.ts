import { NextRequest, NextResponse } from 'next/server';

// Environment variables
const API_URL = process.env.API_URL || 'http://localhost:3001';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const { slug } = params;
  
  // Extract userId from query parameters
  const searchParams = request.nextUrl.searchParams;
  const userId = searchParams.get('userId');
  
  try {
    // Make the request to the backend API
    let url = `${API_URL}/api/folders/slug/${slug}`;
    if (userId) {
      url += `?userId=${userId}`;
    }
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.message || 'Failed to fetch folder' }, 
        { status: response.status }
      );
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error(`Error fetching folder by slug ${slug}:`, error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}