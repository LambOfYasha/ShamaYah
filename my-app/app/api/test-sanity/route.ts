import { NextResponse } from 'next/server';
import { adminClient } from '@/sanity/lib/adminClient';

export async function GET() {
  try {
    console.log('Test Sanity: Starting test');
    
    // Test basic connection by fetching a simple query
    const testQuery = `*[_type == "user"][0...5] {
      _id,
      username,
      role
    }`;
    
    console.log('Test Sanity: Executing query:', testQuery);
    
    const users = await adminClient.fetch(testQuery);
    
    console.log('Test Sanity: Found users:', users.length);
    console.log('Test Sanity: First user:', users[0]);
    
    // Test reports query specifically
    const reportsQuery = `*[_type == "report"][0...5] {
      _id,
      reason,
      status,
      contentType
    }`;
    
    console.log('Test Sanity: Executing reports query:', reportsQuery);
    
    const reports = await adminClient.fetch(reportsQuery);
    
    console.log('Test Sanity: Found reports:', reports.length);
    console.log('Test Sanity: First report:', reports[0]);
    
    return NextResponse.json({ 
      success: true,
      users: {
        count: users.length,
        sample: users[0]
      },
      reports: {
        count: reports.length,
        sample: reports[0]
      }
    });
    
  } catch (error) {
    console.error('Test Sanity: Error:', error);
    return NextResponse.json({ 
      error: 'Failed to test Sanity connection',
      details: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
} 