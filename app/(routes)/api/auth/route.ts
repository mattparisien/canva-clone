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

// Login endpoint
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const path = req.nextUrl.pathname.split('/').pop();

    // Determine the specific auth endpoint
    // Default to login if not specified in the path
    let endpoint = '/api/auth/login';

    if (path === 'register') {
      endpoint = '/api/auth/register';
    } else if (path === 'logout') {
      endpoint = '/api/auth/logout';
    } else if (path === 'forgot-password') {
      endpoint = '/api/auth/forgot-password';
    }

    const response = await axios.post(`${BACKEND_URL}${endpoint}`, body, {
      headers: {
        Authorization: await getAuthHeader(),
        'Content-Type': 'application/json',
      },
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Auth error:', error.response?.data || error.message);
    return NextResponse.json(
      { message: error.response?.data?.message || 'Authentication failed' },
      { status: error.response?.status || 500 }
    );
  }
}