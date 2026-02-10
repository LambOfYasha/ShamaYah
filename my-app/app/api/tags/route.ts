import { NextRequest, NextResponse } from 'next/server';
import { getTags } from '@/sanity/lib/blogs/getTags';
import { adminClient } from '@/sanity/lib/adminClient';
import { getCurrentUser } from '@/lib/auth/middleware';
import { client } from '@/sanity/lib/client';
import { defineQuery } from 'groq';

export async function GET() {
  try {
    const tags = await getTags();
    
    // Also fetch with createdAt for admin pages
    const query = defineQuery(`
      *[_type == "tag"] | order(name asc) {
        _id,
        name,
        "slug": slug.current,
        color,
        description,
        createdAt,
        _createdAt
      }
    `);
    
    const tagsWithDates = await client.fetch(query);
    
    return NextResponse.json({ 
      tags: tagsWithDates,
      total: tagsWithDates.length
    });
  } catch (error) {
    console.error('Error fetching tags:', error);
    return NextResponse.json({ error: 'Failed to fetch tags' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    // Check if user is admin
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, description, color } = await request.json();

    if (!name || !color) {
      return NextResponse.json({ error: 'Name and color are required' }, { status: 400 });
    }

    // Generate slug from name
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');

    // Create the tag
    const newTag = await adminClient.create({
      _type: 'tag',
      name,
      slug: {
        current: slug,
        _type: 'slug',
      },
      description: description || '',
      color,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ tag: newTag }, { status: 201 });
  } catch (error) {
    console.error('Error creating tag:', error);
    return NextResponse.json({ error: 'Failed to create tag' }, { status: 500 });
  }
} 