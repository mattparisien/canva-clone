import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

// Chat health check
export async function GET(req: NextRequest) {
  try {
    const backendUrl = `${BACKEND_URL}/api/chat/health`;
    
    console.log('Proxying chat health request to:', backendUrl);
    
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    
    return NextResponse.json(data, { 
      status: response.status 
    });
    
  } catch (error) {
    console.error('Chat health API error:', error);
    return NextResponse.json(
      { message: 'Internal server error' }, 
      { status: 500 }
    );
  }
}
