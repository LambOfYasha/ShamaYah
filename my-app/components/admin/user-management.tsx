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
import { useRole } from '@/hooks/useRole';

interface UserManagementProps {
  initialUsers?: UserData[];
}

export default function UserManagement({ initialUsers = [] }: UserManagementProps) {
  const { user: currentUser } = useRole();
  
  const config: ManagementConfig = {
    title: 'Users',
    icon: Users,
    dataType: 'users',
    roles: [
      { value: 'member', label: 'Member' },
      { value: 'teacher', label: 'Teacher' },
      { value: 'junior_teacher', label: 'Junior Teacher' },
      { value: 'senior_teacher', label: 'Senior Teacher' },
      { value: 'lead_teacher', label: 'Lead Teacher' },
      { value: 'dev', label: 'Dev' },
      { value: 'admin', label: 'Admin' }
    ],
    getRoleBadgeVariant: (role: string) => {
      switch (role) {
        case 'admin':
          return 'destructive';
        case 'lead_teacher':
          return 'default';
        case 'dev':
          return 'secondary';
        case 'senior_teacher':
          return 'outline';
        case 'junior_teacher':
          return 'outline';
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
    deleteItem: async (userId: string) => {
      // Check if current user is senior teacher and target user is not a member
      if (currentUser?.role === 'senior_teacher') {
        // Get the user data to check their role
        const userData = await getAllUsers({ limit: 1000 });
        if (userData.success) {
          const targetUser = userData.users.find((u: UserData) => u._id === userId);
          if (targetUser && targetUser.role !== 'member') {
            return { success: false, error: 'Senior teachers can only delete members' };
          }
        }
      }
      
      return deleteUser(userId);
    },
    bulkUpdate: bulkUpdateUsers
  };

  return (
    <SharedManagement 
      config={config}
      initialData={initialUsers}
    />
  );
} 