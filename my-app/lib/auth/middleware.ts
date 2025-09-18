import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getUser } from '../user/getUser';
import { hasRoleOrHigher, UserRole, hasPermission } from './roles';

export async function requireAuth() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      console.log('No user ID found in auth context');
      redirect('/sign-in');
    }
    
    return userId;
  } catch (error) {
    console.error('Auth error in requireAuth:', error);
    // During build time, don't redirect, just return null
    if (process.env.NODE_ENV === 'production' && process.env.VERCEL_ENV) {
      return null;
    }
    redirect('/sign-in');
  }
}

export async function requireRole(requiredRole: UserRole) {
  try {
    const userId = await requireAuth();
    
    if (!userId) {
      // During build time, return a mock user to prevent errors
      if (process.env.NODE_ENV === 'production' && process.env.VERCEL_ENV) {
        return {
          _id: 'build-user',
          username: 'build-user',
          email: 'build@example.com',
          role: 'member' as UserRole
        };
      }
      redirect('/sign-in');
    }
    
    const user = await getUser();
    
    if ('error' in user) {
      console.log('User not found in database:', user.error);
      redirect('/sign-in');
    }
    
    if (!hasRoleOrHigher(user.role, requiredRole)) {
      redirect('/unauthorized');
    }
    
    return user;
  } catch (error) {
    console.error('Auth error in requireRole:', error);
    redirect('/sign-in');
  }
}

export async function requirePermission(permission: 'canCreatePosts' | 'canComment' | 'canCreateCommunities' | 'canModerate' | 'canManageUsers' | 'canManageTeachers' | 'canAccessAdminPanel' | 'canManageBlogs' | 'canDeleteMembers' | 'canGiveTeacherApprovals' | 'canDeleteOtherContent') {
  try {
    const userId = await requireAuth();
    
    if (!userId) {
      // During build time, return a mock user to prevent errors
      if (process.env.NODE_ENV === 'production' && process.env.VERCEL_ENV) {
        return {
          _id: 'build-user',
          username: 'build-user',
          email: 'build@example.com',
          role: 'member' as UserRole
        };
      }
      redirect('/sign-in');
    }
    
    const user = await getUser();
    
    if ('error' in user) {
      console.log('User not found in database:', user.error);
      redirect('/sign-in');
    }
    
    if (!hasPermission(user.role, permission)) {
      redirect('/unauthorized');
    }
    
    return user;
  } catch (error) {
    console.error('Auth error in requirePermission:', error);
    redirect('/sign-in');
  }
}

export async function requireTeacher() {
  return requireRole('teacher');
}

export async function requireModerator() {
  return requireRole('moderator');
}

export async function requireAdmin() {
  return requireRole('admin');
}

export async function requireAdminOrTeacher() {
  try {
    const userId = await requireAuth();
    
    if (!userId) {
      // During build time, return a mock user to prevent errors
      if (process.env.NODE_ENV === 'production' && process.env.VERCEL_ENV) {
        return {
          _id: 'build-user',
          username: 'build-user',
          email: 'build@example.com',
          role: 'teacher' as UserRole
        };
      }
      redirect('/sign-in');
    }
    
    const user = await getUser();
    
    if ('error' in user) {
      console.log('User not found in database:', user.error);
      redirect('/sign-in');
    }
    
    // Check if user is admin or any teacher role
    if (!['admin', 'teacher', 'junior_teacher', 'senior_teacher', 'lead_teacher', 'dev'].includes(user.role)) {
      redirect('/unauthorized');
    }
    
    return user;
  } catch (error) {
    console.error('Auth error in requireAdminOrTeacher:', error);
    redirect('/sign-in');
  }
}

export async function requireAdminOrSeniorTeacher() {
  try {
    const userId = await requireAuth();
    
    if (!userId) {
      // During build time, return a mock user to prevent errors
      if (process.env.NODE_ENV === 'production' && process.env.VERCEL_ENV) {
        return {
          _id: 'build-user',
          username: 'build-user',
          email: 'build@example.com',
          role: 'senior_teacher' as UserRole
        };
      }
      redirect('/sign-in');
    }
    
    const user = await getUser();
    
    if ('error' in user) {
      console.log('User not found in database:', user.error);
      redirect('/sign-in');
    }
    
    // Check if user is admin, senior teacher and up, or dev
    if (!['admin', 'senior_teacher', 'lead_teacher', 'dev'].includes(user.role)) {
      redirect('/unauthorized');
    }
    
    return user;
  } catch (error) {
    console.error('Auth error in requireAdminOrSeniorTeacher:', error);
    redirect('/sign-in');
  }
}

export async function requireAdminOrLeadTeacher() {
  try {
    const userId = await requireAuth();
    
    if (!userId) {
      // During build time, return a mock user to prevent errors
      if (process.env.NODE_ENV === 'production' && process.env.VERCEL_ENV) {
        return {
          _id: 'build-user',
          username: 'build-user',
          email: 'build@example.com',
          role: 'lead_teacher' as UserRole
        };
      }
      redirect('/sign-in');
    }
    
    const user = await getUser();
    
    if ('error' in user) {
      console.log('User not found in database:', user.error);
      redirect('/sign-in');
    }
    
    // Check if user is admin, lead teacher, or dev
    if (!['admin', 'lead_teacher', 'dev'].includes(user.role)) {
      redirect('/unauthorized');
    }
    
    return user;
  } catch (error) {
    console.error('Auth error in requireAdminOrLeadTeacher:', error);
    redirect('/sign-in');
  }
}

export async function getCurrentUser() {
  try {
    // Handle authentication directly instead of using requireAuth
    const { userId } = await auth();
    
    if (!userId) {
      // During build time, return a mock user to prevent errors
      if (process.env.NODE_ENV === 'production' && process.env.VERCEL_ENV) {
        return {
          _id: 'build-user',
          username: 'build-user',
          email: 'build@example.com',
          role: 'member' as UserRole
        };
      }
      // Return null for unauthenticated users
      return null;
    }
    
    const user = await getUser();
    
    if ('error' in user) {
      console.log('User not found in database:', user.error);
      // Return null for unauthenticated users
      return null;
    }
    
    return user;
  } catch (error) {
    console.error('Auth error in getCurrentUser:', error);
    // Return null for unauthenticated users
    return null;
  }
} 