import axios from 'axios';
import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

// Get the backend URL from environment variables
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

// Helper function to forward the authorization header
async function getAuthHeader() {
  const headersList = await headers();
  return headersList.get('authorization') || '';
}

// GET: Fetch all presentations
export async function GET(req: NextRequest) {
  try {
    const response = await axios.get(`${BACKEND_URL}/api/presentations`, {
      headers: {
        Authorization: await getAuthHeader(),
      },
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Error fetching presentations:', error.response?.data || error.message);
    return NextResponse.json(
      { message: error.response?.data?.message || 'Failed to fetch presentations' },
      { status: error.response?.status || 500 }
    );
  }
}

// POST: Create a new presentation
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const response = await axios.post(`${BACKEND_URL}/api/presentations`, body, {
      headers: {
        Authorization: await getAuthHeader(),
        'Content-Type': 'application/json',
      },
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Error creating presentation:', error.response?.data || error.message);
    return NextResponse.json(
      { message: error.response?.data?.message || 'Failed to create presentation' },
      { status: error.response?.status || 500 }
    );
  }
}