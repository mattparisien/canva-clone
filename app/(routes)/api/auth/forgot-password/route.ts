import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';

// Get the backend URL from environment variables
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

// POST: Request password reset
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const response = await axios.post(`${BACKEND_URL}/api/auth/forgot-password`, body, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Forgot password error:', error.response?.data || error.message);
    return NextResponse.json(
      { message: error.response?.data?.message || 'Failed to process forgot password request' },
      { status: error.response?.status || 500 }
    );
  }
}