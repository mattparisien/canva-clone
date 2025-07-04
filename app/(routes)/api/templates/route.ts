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

// GET: Fetch all templates with optional category and type filters
export async function GET(req: NextRequest) {
  try {
    // Get query parameters
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const type = searchParams.get('type');

    // Prepare query parameters for backend request
    const queryParams = new URLSearchParams();
    if (category) queryParams.append('category', category);
    if (type) queryParams.append('type', type);

    // Add query parameters to the URL if they exist
    const queryString = queryParams.toString();
    const endpoint = queryString
      ? `/api/templates?${queryString}`
      : '/api/templates';

    // Make request to backend
    const response = await axios.get(`${BACKEND_URL}${endpoint}`, {
      headers: {
        Authorization: await getAuthHeader(),
      },
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Error fetching templates:', error.response?.data || error.message);
    return NextResponse.json(
      { message: error.response?.data?.message || 'Failed to fetch templates' },
      { status: error.response?.status || 500 }
    );
  }
}

// POST: Create a new template
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('Frontend template creation data:', JSON.stringify(body, null, 2));

    // Make request to backend
    const response = await axios.post(`${BACKEND_URL}/api/templates`, body, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: await getAuthHeader(),
      },
    });

    return NextResponse.json(response.data, { status: 201 });
  } catch (error: any) {
    console.error('Error creating template:', error.response?.data || error.message);
    return NextResponse.json(
      { message: error.response?.data?.message || 'Failed to create template' },
      { status: error.response?.status || 500 }
    );
  }
}