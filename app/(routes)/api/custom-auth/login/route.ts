import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';

// Get the backend URL from environment variables
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

// POST: Login user
export async function POST(req: NextRequest) {
  try {
    console.log('Login request received');
    const body = await req.json();

    const response = await axios.post(`${BACKEND_URL}/api/auth/login`, body, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Login error:', error.response?.data || error.message);
    return NextResponse.json(
      { message: error.response?.data?.message || 'Login failed' },
      { status: error.response?.status || 500 }
    );
  }
}