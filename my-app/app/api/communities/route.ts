import { NextResponse } from 'next/server';
import { getCommunitiesServer } from '@/sanity/lib/communties/getCommunitiesServer';

export async function GET() {
  try {
    const communities = await getCommunitiesServer();
    return NextResponse.json(communities);
  } catch (error) {
    console.error('Error fetching communities:', error);
    return NextResponse.json([], { status: 500 });
  }
} 