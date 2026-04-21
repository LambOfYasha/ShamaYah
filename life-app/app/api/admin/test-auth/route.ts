import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/user/getUser';
import { isAdmin, isModerator, hasRoleOrHigher } from '@/lib/auth/roles';

export async function GET(request: NextRequest) {
  try {
    console.log("=== TEST AUTH API CALLED ===");
    
    const user = await getUser();
    
    console.log("User result:", user);
    
    // Check for authentication error
    if ("error" in user) {
      console.error("Authentication error:", user.error);
      return NextResponse.json({ 
        error: user.error,
        type: 'authentication_error'
      }, { status: 401 });
    }

    // Check if user exists
    if (!user || !user._id) {
      console.error("User not found or missing ID");
      return NextResponse.json({ 
        error: 'User authentication failed',
        type: 'user_not_found'
      }, { status: 401 });
    }

    // Check role permissions
    const isUserAdmin = isAdmin(user.role);
    const isUserModerator = isModerator(user.role);
    const hasAdminAccess = hasRoleOrHigher(user.role, 'admin');
    const hasModeratorAccess = hasRoleOrHigher(user.role, 'moderator');

    console.log("Role checks:", {
      role: user.role,
      isAdmin: isUserAdmin,
      isModerator: isUserModerator,
      hasAdminAccess,
      hasModeratorAccess
    });

    // Check if user has admin or moderator role
    if (!isUserAdmin && !isUserModerator) {
      console.error("User does not have admin or moderator role:", user.role);
      return NextResponse.json({ 
        error: 'Insufficient permissions',
        type: 'insufficient_permissions',
        userRole: user.role,
        requiredRoles: ['admin', 'moderator', 'senior_teacher', 'lead_teacher', 'dev']
      }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      user: {
        _id: user._id,
        username: user.username,
        role: user.role,
        email: user.email
      },
      permissions: {
        isAdmin: isUserAdmin,
        isModerator: isUserModerator,
        hasAdminAccess,
        hasModeratorAccess
      }
    });

  } catch (error) {
    console.error("Test auth error:", error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 