import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

// Helper function to forward headers from the incoming request
const getHeadersWithAuth = (req: NextRequest) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Forward the authorization header if present
  const authHeader = req.headers.get('authorization');
  if (authHeader) {
    headers['Authorization'] = authHeader;
  }

  return headers;
};

// Vector search assets by semantic similarity
export async function GET(req: NextRequest) {
  try {
    const headers = getHeadersWithAuth(req);
    
    // Extract query parameters from the URL
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('query');
    const userId = searchParams.get('userId');
    const limit = searchParams.get('limit') || '10';
    const threshold = searchParams.get('threshold') || '0.7';
    
    if (!query) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      );
    }

    // Build the backend URL with query parameters
    const backendUrl = new URL(`${BACKEND_URL}/api/assets/search/vector`);
    backendUrl.searchParams.set('query', query);
    if (userId) backendUrl.searchParams.set('userId', userId);
    backendUrl.searchParams.set('limit', limit);
    backendUrl.searchParams.set('threshold', threshold);
    
    console.log('Proxying vector search request to:', backendUrl.toString());
    
    const response = await axios.get(backendUrl.toString(), { headers });
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Error in vector search:', error.response?.data || error.message);
    return NextResponse.json(
      { error: error.response?.data?.message || 'Vector search failed' },
      { status: error.response?.status || 500 }
    );
  }
}
