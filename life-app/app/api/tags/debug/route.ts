import { NextResponse } from 'next/server';
import { client } from '@/sanity/lib/client';
import { defineQuery } from 'groq';

export async function GET() {
  try {
    const query = defineQuery(`
      *[_type == "tag"] {
        _id,
        name,
        "slug": slug.current,
        color,
        description,
        createdAt,
        _createdAt,
        _updatedAt
      }
    `);
    
    const tags = await client.fetch(query);
    
    return NextResponse.json({ 
      tags,
      total: tags.length,
      sample: tags[0] || null
    });
  } catch (error) {
    console.error('Error fetching tags for debug:', error);
    return NextResponse.json({ error: 'Failed to fetch tags' }, { status: 500 });
  }
} 