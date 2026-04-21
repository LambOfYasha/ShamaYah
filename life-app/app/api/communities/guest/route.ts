import { NextRequest, NextResponse } from 'next/server';
import { adminClient } from '@/sanity/lib/adminClient';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, content, guestUser } = body;

    // Validate required fields
    if (!title || !description || !guestUser) {
      return NextResponse.json({ 
        error: 'Missing required fields: title, description, guestUser' 
      }, { status: 400 });
    }

    // Validate guest user structure
    if (!guestUser._id || !guestUser.username || !guestUser.role) {
      return NextResponse.json({ 
        error: 'Invalid guest user data' 
      }, { status: 400 });
    }

    // Validate that the guest user has the guest role
    if (guestUser.role !== 'guest') {
      return NextResponse.json({ 
        error: 'Invalid user role for guest community creation' 
      }, { status: 400 });
    }

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 96);

    // Create the community question document
    const communityDoc = {
      _type: 'communityQuestion',
      title: title.trim(),
      description: description.trim(),
      content: content.trim() || '',
      slug: {
        _type: 'slug',
        current: slug,
      },
      moderator: {
        _type: 'reference',
        _ref: guestUser._id,
      },
      isDeleted: false,
      isReported: false,
      createdAt: new Date().toISOString(),
    };

    const createdCommunity = await adminClient.create(communityDoc);

    return NextResponse.json({
      success: true,
      community: createdCommunity
    });

  } catch (error) {
    console.error('Error creating guest community:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
} 