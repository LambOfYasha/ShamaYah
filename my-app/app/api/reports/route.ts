import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { adminClient } from '@/sanity/lib/adminClient';
import { getUser } from '@/lib/user/getUser';

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      console.log('POST /api/reports: No userId found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('POST /api/reports: Processing report for user:', userId);

    const body = await request.json();
    const { contentId, contentType, reason, description } = body;

    console.log('POST /api/reports: Report data:', { contentId, contentType, reason, description });

    // Validate required fields
    if (!contentId || !contentType || !reason) {
      console.log('POST /api/reports: Missing required fields');
      return NextResponse.json({ 
        error: 'Missing required fields: contentId, contentType, reason' 
      }, { status: 400 });
    }

    // Get the current user
    const userResult = await getUser();
    if ('error' in userResult) {
      console.log('POST /api/reports: User not found:', userResult.error);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    console.log('POST /api/reports: User found:', { 
      userId: userResult._id, 
      username: userResult.username, 
      role: userResult.role,
      email: userResult.email 
    });

    // Check if user has already reported this content
    console.log('POST /api/reports: Checking for existing report');
    const existingReport = await adminClient.fetch(`
      *[_type == "report" && reporter._ref == $reporterId && reportedContent._ref == $contentId][0]
    `, {
      reporterId: userResult._id,
      contentId: contentId
    });

    if (existingReport) {
      console.log('POST /api/reports: User already reported this content');
      return NextResponse.json({ 
        error: 'You have already reported this content' 
      }, { status: 409 });
    }

    console.log('POST /api/reports: Creating new report');

    // Create the report
    const reportData = {
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
    };

    console.log('POST /api/reports: Report data to create:', reportData);

    const report = await adminClient.create(reportData);

    console.log('POST /api/reports: Report created successfully:', report._id);
    console.log('POST /api/reports: Full report object:', report);

    return NextResponse.json({ 
      success: true, 
      reportId: report._id 
    });

  } catch (error) {
    console.error('POST /api/reports: Error creating report:', error);
    console.error('POST /api/reports: Error details:', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    return NextResponse.json({ 
      error: 'Failed to create report',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      console.log('GET /api/reports: No userId found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('GET /api/reports: Processing request for user:', userId);

    // Get the current user
    const userResult = await getUser();
    if ('error' in userResult) {
      console.log('GET /api/reports: User not found:', userResult.error);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    console.log('GET /api/reports: User found:', { 
      userId: userResult._id, 
      username: userResult.username, 
      role: userResult.role,
      email: userResult.email 
    });

    // Allow admins, moderators, and teachers with moderation capabilities to view reports
    // This should match the permissions used in the admin page (requireAdminOrTeacher)
    const allowedRoles = ['admin', 'teacher', 'junior_teacher', 'senior_teacher', 'lead_teacher', 'dev'];
    console.log('GET /api/reports: Checking role permissions. User role:', userResult.role, 'Allowed roles:', allowedRoles);
    
    if (!allowedRoles.includes(userResult.role)) {
      console.log('GET /api/reports: User role not allowed:', userResult.role);
      console.log('GET /api/reports: User details for debugging:', {
        _id: userResult._id,
        username: userResult.username,
        role: userResult.role,
        email: userResult.email
      });
      return NextResponse.json({ 
        error: 'Forbidden - Insufficient permissions to view reports',
        userRole: userResult.role,
        allowedRoles: allowedRoles
      }, { status: 403 });
    }

    console.log('GET /api/reports: User role allowed, fetching reports');

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const contentType = searchParams.get('contentType');
    const limit = parseInt(searchParams.get('limit') || '50');

    console.log('GET /api/reports: Query parameters:', { status, contentType, limit });

    // Build the query
    let query = `*[_type == "report"]`;
    const params: any = { limit };

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

    console.log('GET /api/reports: Executing query with params:', params);
    console.log('GET /api/reports: Full query:', query);

    const reports = await adminClient.fetch(query, params);

    console.log('GET /api/reports: Found reports:', reports.length);
    console.log('GET /api/reports: First few reports:', reports.slice(0, 3));

    return NextResponse.json({ reports });

  } catch (error) {
    console.error('GET /api/reports: Error fetching reports:', error);
    console.error('GET /api/reports: Error details:', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : 'Unknown'
    });
    return NextResponse.json({ 
      error: 'Failed to fetch reports',
      details: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 