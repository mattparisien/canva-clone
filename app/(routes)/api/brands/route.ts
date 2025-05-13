import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000/api';

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

// Get all brands
export async function GET(req: NextRequest) {
  try {
    const headers = getHeadersWithAuth(req);
    
    const response = await axios.get(`${BACKEND_URL}/api/brands`, { headers });
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Error fetching brands:', error.response?.data || error.message);
    return NextResponse.json(
      { error: error.response?.data?.message || 'Failed to fetch brands' },
      { status: error.response?.status || 500 }
    );
  }
}

// Create a new brand
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const headers = getHeadersWithAuth(req);
    
    const response = await axios.post(`${BACKEND_URL}/api/brands`, body, { headers });
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Error creating brand:', error.response?.data || error.message);
    return NextResponse.json(
      { error: error.response?.data?.message || 'Failed to create brand' },
      { status: error.response?.status || 500 }
    );
  }
}