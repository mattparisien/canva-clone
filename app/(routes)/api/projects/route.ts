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

// GET: Fetch all projects
export async function GET(req: NextRequest) {
  try {
    
    // Check if the request is for templates
    const { searchParams } = new URL(req.url);
    const isTemplates = req.nextUrl.pathname.includes('templates');

    // Get query parameters
    const category = searchParams.get('category');
    const type = searchParams.get('type');
    const page = searchParams.get('page');
    const limit = searchParams.get('limit');

    // Determine the endpoint
    let endpoint = '/api/projects';

    // Handle different types of requests
    if (isTemplates) {
      endpoint = '/api/projects/templates';
    } else if (page && limit) {
      endpoint = '/api/projects/paginated';
    }

    // Prepare query parameters
    const queryParams = new URLSearchParams();
    if (category) queryParams.append('category', category);
    if (type) queryParams.append('type', type);
    if (page) queryParams.append('page', page);
    if (limit) queryParams.append('limit', limit);

    // Add query parameters to the URL if they exist
    const queryString = queryParams.toString();
    if (queryString) {
      endpoint = `${endpoint}?${queryString}`;
    }

    // Make request to backend
    const response = await axios.get(`${BACKEND_URL}${endpoint}`, {
      headers: {
        Authorization: await getAuthHeader(),
      },
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Error fetching projects:', error.response?.data || error.message);
    return NextResponse.json(
      { message: error.response?.data?.message || 'Failed to fetch projects' },
      { status: error.response?.status || 500 }
    );
  }
}

// POST: Create a new project
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const response = await axios.post(`${BACKEND_URL}/api/projects`, body, {
      headers: {
        Authorization: await getAuthHeader(),
        'Content-Type': 'application/json',
      },
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Error creating project:', error.response?.data || error.message);
    return NextResponse.json(
      { message: error.response?.data?.message || 'Failed to create project' },
      { status: error.response?.status || 500 }
    );
  }
}