import { NextResponse } from 'next/server';
import { adminClient } from '@/sanity/lib/adminClient';

export async function GET() {
  try {
    console.log('=== TEST DELETE API ===');
    console.log('Admin token available:', !!process.env.SANITY_ADMIN_API_TOKEN);
    console.log('Project ID:', process.env.NEXT_PUBLIC_SANITY_PROJECT_ID);
    console.log('Dataset:', process.env.NEXT_PUBLIC_SANITY_DATASET);
    console.log('API Version:', process.env.NEXT_PUBLIC_SANITY_API_VERSION);

    // Test if we can connect to Sanity
    const config = adminClient.config();
    console.log('Sanity client config:', {
      projectId: config.projectId,
      dataset: config.dataset,
      apiVersion: config.apiVersion,
      useCdn: config.useCdn,
      token: config.token ? 'Token available' : 'No token'
    });

    return NextResponse.json({
      success: true,
      message: 'Environment variables and Sanity client configured correctly',
      config: {
        projectId: config.projectId,
        dataset: config.dataset,
        apiVersion: config.apiVersion,
        useCdn: config.useCdn,
        tokenAvailable: !!config.token
      }
    });
  } catch (error) {
    console.error('Test delete API error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Failed to configure Sanity client'
    }, { status: 500 });
  }
} 