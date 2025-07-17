import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getUser } from '../user/getUser';
import { hasRoleOrHigher, UserRole } from './roles';

export async function requireAuth() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect('/sign-in');
  }
  
  return userId;
}

export async function requireRole(requiredRole: UserRole) {
  const userId = await requireAuth();
  
  const user = await getUser();
  
  if ('error' in user) {
    redirect('/sign-in');
  }
  
  if (!hasRoleOrHigher(user.role, requiredRole)) {
    redirect('/unauthorized');
  }
  
  return user;
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
  const userId = await requireAuth();
  const user = await getUser();
  
  if ('error' in user) {
    redirect('/sign-in');
  }
  
  return user;
} 