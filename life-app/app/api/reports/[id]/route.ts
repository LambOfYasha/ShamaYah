import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { adminClient } from '@/sanity/lib/adminClient';
import { getUser } from '@/lib/user/getUser';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the current user
    const userResult = await getUser();
    if ('error' in userResult) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Allow admins, moderators, and teachers with moderation capabilities to update reports
    // This should match the permissions used in the admin page (requireAdminOrTeacher)
    const allowedRoles = ['admin', 'teacher', 'junior_teacher', 'senior_teacher', 'lead_teacher', 'dev'];
    if (!allowedRoles.includes(userResult.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { status, reviewNotes, actionTaken } = body;

    if (!status) {
      return NextResponse.json({ 
        error: 'Status is required' 
      }, { status: 400 });
    }

    // Update the report
    const updatedReport = await adminClient
      .patch(resolvedParams.id)
      .set({
        status,
        reviewNotes: reviewNotes || '',
        actionTaken: actionTaken || 'none',
        reviewedBy: {
          _type: 'reference',
          _ref: userResult._id
        },
        reviewedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .commit();

    return NextResponse.json({ 
      success: true, 
      report: updatedReport 
    });

  } catch (error) {
    console.error('Error updating report:', error);
    return NextResponse.json({ 
      error: 'Failed to update report' 
    }, { status: 500 });
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the current user
    const userResult = await getUser();
    if ('error' in userResult) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Allow admins, moderators, and teachers with moderation capabilities to view individual reports
    // This should match the permissions used in the admin page (requireAdminOrTeacher)
    const allowedRoles = ['admin', 'teacher', 'junior_teacher', 'senior_teacher', 'lead_teacher', 'dev'];
    if (!allowedRoles.includes(userResult.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const report = await adminClient.fetch(`
      *[_type == "report" && _id == $reportId][0] {
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
      }
    `, {
      reportId: resolvedParams.id
    });

    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    return NextResponse.json({ report });

  } catch (error) {
    console.error('Error fetching report:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch report' 
    }, { status: 500 });
  }
} 