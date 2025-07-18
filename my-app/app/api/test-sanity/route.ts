import { NextResponse } from 'next/server';
import { adminClient } from '@/sanity/lib/adminClient';

export async function GET() {
  try {
    console.log('Testing Sanity admin client...');
    console.log('Admin token available:', !!process.env.SANITY_ADMIN_API_TOKEN);
    
    // Try to fetch a simple query
    const result = await adminClient.fetch('*[_type == "user"][0]{_id, username}');
    
    console.log('Sanity test result:', result);
    
    return NextResponse.json({ 
      success: true, 
      result,
      tokenAvailable: !!process.env.SANITY_ADMIN_API_TOKEN 
    });
  } catch (error) {
    console.error('Sanity test error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      tokenAvailable: !!process.env.SANITY_ADMIN_API_TOKEN 
    }, { status: 500 });
  }
} 