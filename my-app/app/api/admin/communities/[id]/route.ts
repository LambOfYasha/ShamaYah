import { NextRequest, NextResponse } from 'next/server';
import { defineQuery } from 'groq';
import { adminClient } from '@/sanity/lib/adminClient';
import { getUser } from '@/lib/user/getUser';
import { isAdmin, isModerator } from '@/lib/auth/roles';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUser();
    
    // Check for authentication error
    if ("error" in user) {
      console.error("Authentication error:", user.error);
      return NextResponse.json({ error: user.error }, { status: 401 });
    }

    // Check if user exists
    if (!user || !user._id) {
      console.error("User not found or missing ID");
      return NextResponse.json({ error: 'User authentication failed' }, { status: 401 });
    }

    // Check if user has admin or moderator role
    if (!isAdmin(user.role) && !isModerator(user.role)) {
      console.error("User does not have admin or moderator role:", user.role);
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const communityId = params.id;

    const communityQuery = defineQuery(`
      *[_type == "communityQuestion" && _id == $communityId && (isDeleted == false || isDeleted == null)][0] {
        _id,
        title,
        slug,
        description,
        image,
        status,
        isActive,
        isDeleted,
        isPrivate,
        requireApproval,
        allowGuestPosts,
        maxPostsPerDay,
        maxMembers,
        autoModeration,
        contentGuidelines,
        createdAt,
        lastActivity,
        "moderator": moderator->{
          _id,
          username,
          imageURL,
          role
        },
        "memberCount": count(*[_type == "favorite" && post._ref == ^._id && isActive == true]),
        "postCount": count(*[_type == "post" && communityQuestion._ref == ^._id && (isDeleted == false || isDeleted == null)]),
        "recentPosts": *[_type == "post" && communityQuestion._ref == ^._id && (isDeleted == false || isDeleted == null)] | order(createdAt desc) [0...5] {
          _id,
          title,
          createdAt,
          "author": author->{username, imageURL}
        },
        "recentMembers": *[_type == "favorite" && post._ref == ^._id && isActive == true] | order(createdAt desc) [0...5] {
          _id,
          createdAt,
          "user": user->{username, imageURL}
        }
      }
    `);

    const community = await adminClient.fetch(communityQuery, { communityId });

    if (!community) {
      return NextResponse.json({ error: 'Community not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      community
    });

  } catch (error) {
    console.error('Error fetching community:', error);
    return NextResponse.json(
      { error: 'Failed to fetch community' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUser();
    
    // Check for authentication error
    if ("error" in user) {
      console.error("Authentication error:", user.error);
      return NextResponse.json({ error: user.error }, { status: 401 });
    }

    // Check if user exists
    if (!user || !user._id) {
      console.error("User not found or missing ID");
      return NextResponse.json({ error: 'User authentication failed' }, { status: 401 });
    }

    // Check if user has admin role
    if (!isAdmin(user.role)) {
      console.error("User does not have admin role:", user.role);
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const communityId = params.id;
    const body = await request.json();
    const { updates } = body;

    if (!updates) {
      return NextResponse.json({ error: 'Missing updates' }, { status: 400 });
    }

    // Update the community
    const updatedCommunity = await adminClient
      .patch(communityId)
      .set(updates)
      .commit();

    return NextResponse.json({
      success: true,
      community: updatedCommunity
    });

  } catch (error) {
    console.error('Error updating community:', error);
    return NextResponse.json(
      { error: 'Failed to update community' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUser();
    
    // Check for authentication error
    if ("error" in user) {
      console.error("Authentication error:", user.error);
      return NextResponse.json({ error: user.error }, { status: 401 });
    }

    // Check if user exists
    if (!user || !user._id) {
      console.error("User not found or missing ID");
      return NextResponse.json({ error: 'User authentication failed' }, { status: 401 });
    }

    // Check if user has admin role
    if (!isAdmin(user.role)) {
      console.error("User does not have admin role:", user.role);
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const communityId = params.id;

    // Soft delete the community
    const deletedCommunity = await adminClient
      .patch(communityId)
      .set({
        isDeleted: true,
        deletedAt: new Date().toISOString(),
        deletedBy: user._id
      })
      .commit();

    return NextResponse.json({
      success: true,
      message: 'Community deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting community:', error);
    return NextResponse.json(
      { error: 'Failed to delete community' },
      { status: 500 }
    );
  }
} 