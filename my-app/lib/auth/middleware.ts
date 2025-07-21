import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getUser } from '../user/getUser';
import { hasRoleOrHigher, UserRole } from './roles';

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
    redirect('/sign-in');
  }
}

export async function requireRole(requiredRole: UserRole) {
  try {
    const userId = await requireAuth();
    
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

export async function requireTeacher() {
  return requireRole('teacher');
}

export async function requireModerator() {
  return requireRole('moderator');
}

export async function requireAdmin() {
  return requireRole('admin');
}

export async function getCurrentUser() {
  try {
    const userId = await requireAuth();
    const user = await getUser();
    
    if ('error' in user) {
      console.log('User not found in database:', user.error);
      redirect('/sign-in');
    }
    
    return user;
  } catch (error) {
    console.error('Auth error in getCurrentUser:', error);
    redirect('/sign-in');
  }
} 