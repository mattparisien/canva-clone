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

// POST: Logout user
export async function POST(req: NextRequest) {
  try {
    await axios.post(`${BACKEND_URL}/api/auth/logout`, {}, {
      headers: {
        Authorization: await getAuthHeader(),
      },
    });

    return NextResponse.json({ message: 'Logout successful' });
  } catch (error: any) {
    console.error('Logout error:', error.response?.data || error.message);
    return NextResponse.json(
      { message: error.response?.data?.message || 'Logout failed' },
      { status: error.response?.status || 500 }
    );
  }
}