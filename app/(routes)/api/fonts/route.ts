import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

// GET handler for fetching user fonts
export async function GET(req: NextRequest) {
  try {
    // Get auth header
    const authHeader = req.headers.get('authorization');
    const headers: Record<string, string> = {};
    
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    // Get query parameters
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    // Build query string
    const params = new URLSearchParams();
    if (userId) {
      params.append('userId', userId);
    }

    // Forward the request to the backend
    const response = await axios.get(`${BACKEND_URL}/api/fonts?${params.toString()}`, {
      headers
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Error fetching fonts:', error.response?.data || error.message);
    return NextResponse.json(
      { error: error.response?.data?.message || 'Failed to fetch fonts' },
      { status: error.response?.status || 500 }
    );
  }
}
