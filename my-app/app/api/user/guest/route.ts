import { NextRequest, NextResponse } from 'next/server';
import { createGuestUser } from '@/lib/user/addUser';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { guestName } = body;

    if (!guestName || guestName.trim().length === 0) {
      return NextResponse.json({ 
        error: 'Guest name is required' 
      }, { status: 400 });
    }

    if (guestName.length < 2 || guestName.length > 50) {
      return NextResponse.json({ 
        error: 'Guest name must be between 2 and 50 characters' 
      }, { status: 400 });
    }

    const guestUser = await createGuestUser(guestName.trim());

    if ('error' in guestUser) {
      return NextResponse.json({ 
        error: guestUser.error 
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      user: guestUser
    });

  } catch (error) {
    console.error('Error creating guest user:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
} 