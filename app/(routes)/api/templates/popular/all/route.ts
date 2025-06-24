import axios from 'axios';
import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

// Get the backend URL from environment variables
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

// Helper function to forward the authorization header
async function getAuthHeader() {
  const headersList = await headers();
  return headersList.get('authorization') || '';
}

// GET: Fetch popular templates
export async function GET(req: NextRequest) {
  try {
    const response = await axios.get(`${BACKEND_URL}/api/templates/popular/all`, {
      headers: {
        Authorization: await getAuthHeader(),
      },
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Error fetching popular templates:', error.response?.data || error.message);
    return NextResponse.json(
      { message: error.response?.data?.message || 'Failed to fetch popular templates' },
      { status: error.response?.status || 500 }
    );
  }
}
