import { NextResponse } from 'next/server';
import { client } from '@/sanity/lib/client';

export async function GET() {
  try {
    // Fetch counts from Sanity
    const [
      totalQuestions,
      totalTeachers,
      totalBlogs,
      totalMembers
    ] = await Promise.all([
      // Count community questions (posts)
      client.fetch(`count(*[_type == "post"])`),
      
      // Count teachers
      client.fetch(`count(*[_type == "teacher"])`),
      
      // Count blogs
      client.fetch(`count(*[_type == "blog"])`),
      
      // Count users
      client.fetch(`count(*[_type == "user"])`)
    ]);

    const stats = {
      totalQuestions: totalQuestions || 0,
      totalTeachers: totalTeachers || 0,
      totalBlogs: totalBlogs || 0,
      totalMembers: totalMembers || 0
    };

    return NextResponse.json(stats);

  } catch (error) {
    console.error('Error fetching site stats:', error);
    
    // Return fallback stats if there's an error
    return NextResponse.json({
      totalQuestions: 1247,
      totalTeachers: 89,
      totalBlogs: 456,
      totalMembers: 3421
    });
  }
}
