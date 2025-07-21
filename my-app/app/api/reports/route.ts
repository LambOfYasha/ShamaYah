import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { adminClient } from '@/sanity/lib/adminClient';
import { getUser } from '@/lib/user/getUser';

export async function POST(request: Request) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { contentId, contentType, reason, description } = body;

    // Validate required fields
    if (!contentId || !contentType || !reason) {
      return NextResponse.json({ 
        error: 'Missing required fields: contentId, contentType, reason' 
      }, { status: 400 });
    }

    // Get the current user
    const userResult = await getUser();
    if ('error' in userResult) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user has already reported this content
    const existingReport = await adminClient.fetch(`
      *[_type == "report" && reporter._ref == $reporterId && reportedContent._ref == $contentId][0]
    `, {
      reporterId: userResult._id,
      contentId: contentId
    });

    if (existingReport) {
      return NextResponse.json({ 
        error: 'You have already reported this content' 
      }, { status: 409 });
    }

    // Create the report
    const report = await adminClient.create({
      _type: 'report',
      reporter: {
        _type: 'reference',
        _ref: userResult._id
      },
      reportedContent: {
        _type: 'reference',
        _ref: contentId
      },
      contentType: contentType,
      reason: reason,
      description: description || '',
      status: 'pending',
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ 
      success: true, 
      reportId: report._id 
    });

  } catch (error) {
    console.error('Error creating report:', error);
    return NextResponse.json({ 
      error: 'Failed to create report' 
    }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the current user
    const userResult = await getUser();
    if ('error' in userResult) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Only admins and moderators can view reports
    if (userResult.role !== 'admin' && userResult.role !== 'moderator') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const contentType = searchParams.get('contentType');
    const limit = parseInt(searchParams.get('limit') || '50');

    // Build the query
    let query = `*[_type == "report"]`;
    const params: any = {};

    if (status) {
      query += ` && status == $status`;
      params.status = status;
    }

    if (contentType) {
      query += ` && contentType == $contentType`;
      params.contentType = contentType;
    }

    query += ` | order(createdAt desc) [0...$limit] {
      _id,
      _type,
      reason,
      description,
      status,
      contentType,
      createdAt,
      updatedAt,
      "reporter": reporter->{
        _id,
        username,
        imageURL
      },
      "reportedContent": reportedContent->{
        _id,
        _type,
        title,
        content,
        "slug": slug.current
      },
      "reviewedBy": reviewedBy->{
        _id,
        username
      },
      reviewedAt,
      reviewNotes,
      actionTaken
    }`;

    const reports = await adminClient.fetch(query, params);

    return NextResponse.json({ reports });

  } catch (error) {
    console.error('Error fetching reports:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch reports' 
    }, { status: 500 });
  }
} 