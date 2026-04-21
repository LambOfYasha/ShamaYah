import { NextResponse } from 'next/server';
import { getBlogsServer } from '@/sanity/lib/blogs/getBlogsServer';

export async function GET() {
  try {
    const blogs = await getBlogsServer();
    return NextResponse.json(blogs);
  } catch (error) {
    console.error('Error fetching blogs:', error);
    return NextResponse.json([], { status: 500 });
  }
} 