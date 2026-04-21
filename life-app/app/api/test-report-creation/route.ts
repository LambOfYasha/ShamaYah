import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { adminClient } from '@/sanity/lib/adminClient';
import { getUser } from '@/lib/user/getUser';

export async function GET() {
  try {
    console.log('Test report creation: Starting test');
    
    // Get all reports to see what exists
    const allReports = await adminClient.fetch(`
      *[_type == "report"] {
        _id,
        _type,
        reason,
        description,
        status,
        contentType,
        createdAt,
        "reporter": reporter->{
          _id,
          username
        },
        "reportedContent": reportedContent->{
          _id,
          _type,
          title
        }
      }
    `);
    
    console.log('Test report creation: Found reports:', allReports.length);
    console.log('Test report creation: Reports:', allReports);
    
    return NextResponse.json({ 
      success: true, 
      reportCount: allReports.length,
      reports: allReports 
    });
    
  } catch (error) {
    console.error('Test report creation: Error:', error);
    return NextResponse.json({ 
      error: 'Failed to test report creation',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

export async function POST() {
  try {
    console.log('Test report creation: Creating test report');
    
    // Get a test user
    const testUser = await adminClient.fetch(`
      *[_type == "user"][0] {
        _id,
        username
      }
    `);
    
    if (!testUser) {
      return NextResponse.json({ error: 'No test user found' }, { status: 404 });
    }
    
    // Get a test post
    const testPost = await adminClient.fetch(`
      *[_type == "post"][0] {
        _id,
        title
      }
    `);
    
    if (!testPost) {
      return NextResponse.json({ error: 'No test post found' }, { status: 404 });
    }
    
    console.log('Test report creation: Using test user:', testUser);
    console.log('Test report creation: Using test post:', testPost);
    
    // Create a test report
    const testReport = await adminClient.create({
      _type: 'report',
      reporter: {
        _type: 'reference',
        _ref: testUser._id
      },
      reportedContent: {
        _type: 'reference',
        _ref: testPost._id
      },
      contentType: 'post',
      reason: 'inappropriate',
      description: 'Test report for debugging',
      status: 'pending',
      createdAt: new Date().toISOString(),
    });
    
    console.log('Test report creation: Created test report:', testReport._id);
    
    return NextResponse.json({ 
      success: true, 
      reportId: testReport._id,
      testUser,
      testPost
    });
    
  } catch (error) {
    console.error('Test report creation: Error creating test report:', error);
    return NextResponse.json({ 
      error: 'Failed to create test report',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 