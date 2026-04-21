'use client';

import { useUser } from '@clerk/nextjs';
import { useState, useEffect } from 'react';
import { UserWithRole, hasPermission, UserRole } from '@/lib/auth/roles';

export function useRole() {
  const { user, isLoaded } = useUser();
  const [userWithRole, setUserWithRole] = useState<UserWithRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUserRole() {
      if (!user || !isLoaded) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/user/me');
        if (response.ok) {
          const userData = await response.json();
          setUserWithRole(userData);
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchUserRole();
  }, [user, isLoaded]);

  const hasRolePermission = (permission: 'canCreatePosts' | 'canComment' | 'canCreateCommunities' | 'canModerate' | 'canManageUsers' | 'canManageTeachers' | 'canAccessAdminPanel' | 'canManageBlogs' | 'canDeleteMembers' | 'canGiveTeacherApprovals' | 'canDeleteOtherContent') => {
    if (!userWithRole) return false;
    return hasPermission(userWithRole.role, permission);
  };

  const hasRoleOrHigher = (requiredRole: UserRole) => {
    if (!userWithRole) return false;
    return userWithRole.role === requiredRole || 
           (userWithRole.role === 'admin') ||
           (userWithRole.role === 'lead_teacher' && ['teacher', 'junior_teacher', 'senior_teacher', 'moderator'].includes(requiredRole)) ||
           (userWithRole.role === 'dev' && ['teacher', 'junior_teacher', 'senior_teacher', 'moderator'].includes(requiredRole)) ||
           (userWithRole.role === 'senior_teacher' && ['teacher', 'junior_teacher', 'moderator'].includes(requiredRole)) ||
           (userWithRole.role === 'moderator' && ['teacher', 'junior_teacher'].includes(requiredRole));
  };

  return {
    user: userWithRole,
    loading,
    hasPermission: hasRolePermission,
    hasRoleOrHigher,
    isAuthenticated: !!user,
  };
} 