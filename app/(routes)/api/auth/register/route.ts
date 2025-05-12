import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';

// Get the backend URL from environment variables
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

// POST: Register a new user
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const response = await axios.post(`${BACKEND_URL}/api/auth/register`, body, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Registration error:', error.response?.data || error.message);
    return NextResponse.json(
      { message: error.response?.data?.message || 'Registration failed' },
      { status: error.response?.status || 500 }
    );
  }
}