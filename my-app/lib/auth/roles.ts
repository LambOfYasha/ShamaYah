export type UserRole = 'member' | 'moderator' | 'admin' | 'teacher' | 'senior_teacher' | 'lead_teacher';

export interface UserWithRole {
  _id: string;
  username: string;
  imageURL: string;
  email: string;
  role: UserRole;
}

export const ROLES = {
  MEMBER: 'member',
  MODERATOR: 'moderator',
  ADMIN: 'admin',
  TEACHER: 'teacher',
  SENIOR_TEACHER: 'senior_teacher',
  LEAD_TEACHER: 'lead_teacher',
} as const;

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  member: 1,
  teacher: 2,
  moderator: 3,
  senior_teacher: 4,
  lead_teacher: 5,
  admin: 6,
};

export const ROLE_PERMISSIONS = {
  [ROLES.MEMBER]: {
    canCreatePosts: true,
    canComment: true,
    canCreateCommunities: false,
    canModerate: false,
    canManageUsers: false,
    canManageTeachers: false,
    canAccessAdminPanel: false,
    canManageBlogs: false,
  },
  [ROLES.TEACHER]: {
    canCreatePosts: true,
    canComment: true,
    canCreateCommunities: true,
    canModerate: false,
    canManageUsers: false,
    canManageTeachers: false,
    canAccessAdminPanel: false,
    canManageBlogs: true,
  },
  [ROLES.MODERATOR]: {
    canCreatePosts: true,
    canComment: true,
    canCreateCommunities: true,
    canModerate: true,
    canManageUsers: false,
    canManageTeachers: false,
    canAccessAdminPanel: false,
    canManageBlogs: false,
  },
  [ROLES.SENIOR_TEACHER]: {
    canCreatePosts: true,
    canComment: true,
    canCreateCommunities: true,
    canModerate: true,
    canManageUsers: false,
    canManageTeachers: true,
    canAccessAdminPanel: false,
    canManageBlogs: true,
  },
  [ROLES.LEAD_TEACHER]: {
    canCreatePosts: true,
    canComment: true,
    canCreateCommunities: true,
    canModerate: true,
    canManageUsers: true,
    canManageTeachers: true,
    canAccessAdminPanel: true,
    canManageBlogs: true,
  },
  [ROLES.ADMIN]: {
    canCreatePosts: true,
    canComment: true,
    canCreateCommunities: true,
    canModerate: true,
    canManageUsers: true,
    canManageTeachers: true,
    canAccessAdminPanel: true,
    canManageBlogs: true,
  },
} as const;

export function hasPermission(userRole: UserRole, permission: 'canCreatePosts' | 'canComment' | 'canCreateCommunities' | 'canModerate' | 'canManageUsers' | 'canManageTeachers' | 'canAccessAdminPanel' | 'canManageBlogs'): boolean {
  return ROLE_PERMISSIONS[userRole]?.[permission] || false;
}

export function hasRoleOrHigher(userRole: UserRole, requiredRole: UserRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

export function isTeacher(userRole: UserRole): boolean {
  return ['teacher', 'senior_teacher', 'lead_teacher'].includes(userRole);
}

export function isAdmin(userRole: UserRole): boolean {
  return userRole === 'admin';
}

export function isModerator(userRole: UserRole): boolean {
  return ['moderator', 'senior_teacher', 'lead_teacher', 'admin'].includes(userRole);
} 