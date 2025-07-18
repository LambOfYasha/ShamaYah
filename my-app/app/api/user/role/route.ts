import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getUser } from '@/lib/user/getUser';

export async function GET() {
  try {
    console.log('API: Starting role fetch');
    const { userId } = auth();
    console.log('API: User ID from auth:', userId);
    
    if (!userId) {
      console.log('API: No user ID found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('API: Getting user data');
    const user = await getUser();
    console.log('API: User data result:', user);
    
    if ("error" in user) {
      console.log('API: User error:', user.error);
      return NextResponse.json({ error: user.error }, { status: 500 });
    }

    console.log('API: Returning role:', user.role);
    return NextResponse.json({ 
      role: user.role,
      userId: user._id 
    });
    
  } catch (error) {
    console.error('API: Error fetching user role:', error);
    return NextResponse.json({ error: 'Failed to fetch user role' }, { status: 500 });
  }
} 