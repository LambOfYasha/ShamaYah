'use client';

import { Users, Shield } from 'lucide-react';
import { 
  getAllUsers, 
  updateUserRole, 
  toggleUserStatus, 
  deleteUser, 
  getUserStats,
  bulkUpdateUsers,
  type UserData,
  type UserFilters
} from '@/action/userActions';
import SharedManagement, { type ManagementConfig } from './shared-management';

interface UserManagementProps {
  initialUsers?: UserData[];
}

export default function UserManagement({ initialUsers = [] }: UserManagementProps) {
  const config: ManagementConfig = {
    title: 'Users',
    icon: Users,
    dataType: 'users',
    roles: [
      { value: 'member', label: 'Member' },
      { value: 'teacher', label: 'Teacher' },
      { value: 'admin', label: 'Admin' }
    ],
    getRoleBadgeVariant: (role: string) => {
      switch (role) {
        case 'admin':
          return 'destructive';
        case 'teacher':
          return 'default';
        case 'member':
          return 'secondary';
        default:
          return 'outline';
      }
    },
    getStatusBadgeVariant: (user: UserData) => {
      if (user.isReported) return 'destructive';
      if (!user.isActive) return 'secondary';
      return 'default';
    },
    loadData: getAllUsers,
    updateRole: updateUserRole,
    toggleStatus: toggleUserStatus,
    deleteItem: deleteUser,
    bulkUpdate: bulkUpdateUsers
  };

  return (
    <SharedManagement 
      config={config}
      initialData={initialUsers}
    />
  );
} 