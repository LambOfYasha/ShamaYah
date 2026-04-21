import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getUser } from '@/lib/user/getUser';

export async function GET() {
  try {
    console.log('Test user role: Starting test');
    
    const { userId } = await auth();
    
    if (!userId) {
      console.log('Test user role: No userId found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Test user role: User ID:', userId);

    // Get the current user
    const userResult = await getUser();
    if ('error' in userResult) {
      console.log('Test user role: User not found:', userResult.error);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    console.log('Test user role: User found:', { 
      userId: userResult._id, 
      username: userResult.username, 
      role: userResult.role,
      email: userResult.email 
    });

    // Check if user has moderation permissions
    const allowedRoles = ['admin', 'moderator', 'senior_teacher', 'lead_teacher', 'dev'];
    const hasPermission = allowedRoles.includes(userResult.role);

    return NextResponse.json({ 
      success: true,
      user: {
        _id: userResult._id,
        username: userResult.username,
        role: userResult.role,
        email: userResult.email
      },
      permissions: {
        allowedRoles,
        hasPermission,
        canViewReports: hasPermission
      }
    });
    
  } catch (error) {
    console.error('Test user role: Error:', error);
    return NextResponse.json({ 
      error: 'Failed to test user role',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 