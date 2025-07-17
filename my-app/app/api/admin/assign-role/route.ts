import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { assignRole } from '@/lib/auth/assignRole';
import { requireAdmin } from '@/lib/auth/middleware';

export async function POST(request: NextRequest) {
  try {
    // Check if the current user is admin
    await requireAdmin();
    
    const { userId, role } = await request.json();
    
    if (!userId || !role) {
      return NextResponse.json(
        { error: 'User ID and role are required' }, 
        { status: 400 }
      );
    }

    const updatedUser = await assignRole(userId, role);
    
    return NextResponse.json({ 
      success: true, 
      user: updatedUser 
    });
  } catch (error) {
    console.error('Error assigning role:', error);
    return NextResponse.json(
      { error: 'Failed to assign role' }, 
      { status: 500 }
    );
  }
} 