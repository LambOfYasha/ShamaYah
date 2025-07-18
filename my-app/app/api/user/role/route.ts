import { NextResponse } from 'next/server';
import { currentUser, auth } from '@clerk/nextjs/server';
import { getUser } from '@/lib/user/getUser';

export async function GET() {
  try {
    console.log('API: Starting role fetch');
    
    // Try currentUser first
    let user = await currentUser();
    console.log('API: User from currentUser:', user?.id);
    
    // If currentUser fails, try auth()
    if (!user) {
      console.log('API: Trying auth() as fallback');
      const { userId } = auth();
      console.log('API: User ID from auth:', userId);
      
      if (!userId) {
        console.log('API: No user found from either method');
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      
      // Create a mock user object for auth() case
      user = { id: userId } as any;
    }

    console.log('API: Getting user data');
    const userData = await getUser();
    console.log('API: User data result:', userData);
    
    if ("error" in userData) {
      console.log('API: User error:', userData.error);
      return NextResponse.json({ error: userData.error }, { status: 500 });
    }

    console.log('API: Returning role:', userData.role);
    return NextResponse.json({ 
      role: userData.role,
      userId: userData._id 
    });
    
  } catch (error) {
    console.error('API: Error fetching user role:', error);
    return NextResponse.json({ error: 'Failed to fetch user role' }, { status: 500 });
  }
} 