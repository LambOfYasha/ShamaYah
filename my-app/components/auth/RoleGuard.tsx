'use client';

import { ReactNode } from 'react';
import { hasPermission, UserRole } from '@/lib/auth/roles';
import { useRole } from '@/hooks/useRole';

interface RoleGuardProps {
  children: ReactNode;
  requiredRole?: UserRole;
  permission?: keyof ReturnType<typeof hasPermission>;
  fallback?: ReactNode;
}

export function RoleGuard({ 
  children, 
  requiredRole, 
  permission, 
  fallback = null 
}: RoleGuardProps) {
  const { user, loading, hasPermission: hasRolePermission, hasRoleOrHigher, isAuthenticated } = useRole();

  if (loading) {
    return null; // or a loading spinner
  }

  if (!isAuthenticated) {
    return fallback;
  }

  if (requiredRole && !hasRoleOrHigher(requiredRole)) {
    return fallback;
  }

  if (permission && !hasRolePermission(permission)) {
    return fallback;
  }

  return <>{children}</>;
}

interface PermissionGuardProps {
  children: ReactNode;
  permission: keyof ReturnType<typeof hasPermission>;
  fallback?: ReactNode;
}

export function PermissionGuard({ children, permission, fallback = null }: PermissionGuardProps) {
  return (
    <RoleGuard permission={permission} fallback={fallback}>
      {children}
    </RoleGuard>
  );
} 