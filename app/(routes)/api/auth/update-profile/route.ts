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

// PUT: Update user profile
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();

    const response = await axios.put(`${BACKEND_URL}/api/auth/update-profile`, body, {
      headers: {
        Authorization: await getAuthHeader(),
        'Content-Type': 'application/json',
      },
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Profile update error:', error.response?.data || error.message);
    return NextResponse.json(
      { message: error.response?.data?.message || 'Failed to update profile' },
      { status: error.response?.status || 500 }
    );
  }
}