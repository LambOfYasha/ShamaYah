export type UserRole = 'member' | 'moderator' | 'admin' | 'teacher' | 'junior_teacher' | 'senior_teacher' | 'lead_teacher' | 'dev';

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
  JUNIOR_TEACHER: 'junior_teacher',
  SENIOR_TEACHER: 'senior_teacher',
  LEAD_TEACHER: 'lead_teacher',
  DEV: 'dev',
} as const;

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  member: 1,
  teacher: 2,
  junior_teacher: 3,
  moderator: 4,
  senior_teacher: 5,
  lead_teacher: 6,
  dev: 7,
  admin: 8,
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
    canDeleteMembers: false,
    canGiveTeacherApprovals: false,
    canDeleteOtherContent: false,
  },
  [ROLES.TEACHER]: {
    canCreatePosts: true,
    canComment: true,
    canCreateCommunities: true,
    canModerate: false,
    canManageUsers: false,
    canManageTeachers: false,
    canAccessAdminPanel: true,
    canManageBlogs: true,
    canDeleteMembers: false,
    canGiveTeacherApprovals: true,
    canDeleteOtherContent: false,
  },
  [ROLES.JUNIOR_TEACHER]: {
    canCreatePosts: true,
    canComment: true,
    canCreateCommunities: true,
    canModerate: false,
    canManageUsers: false,
    canManageTeachers: false,
    canAccessAdminPanel: true,
    canManageBlogs: true,
    canDeleteMembers: false,
    canGiveTeacherApprovals: false,
    canDeleteOtherContent: true,
  },
  [ROLES.MODERATOR]: {
    canCreatePosts: true,
    canComment: true,
    canCreateCommunities: true,
    canModerate: true,
    canManageUsers: false,
    canManageTeachers: false,
    canAccessAdminPanel: true,
    canManageBlogs: false,
    canDeleteMembers: false,
    canGiveTeacherApprovals: true,
    canDeleteOtherContent: false,
  },
  [ROLES.SENIOR_TEACHER]: {
    canCreatePosts: true,
    canComment: true,
    canCreateCommunities: true,
    canModerate: true,
    canManageUsers: false,
    canManageTeachers: true,
    canAccessAdminPanel: true,
    canManageBlogs: true,
    canDeleteMembers: true,
    canGiveTeacherApprovals: true,
    canDeleteOtherContent: false,
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
    canDeleteMembers: true,
    canGiveTeacherApprovals: true,
    canDeleteOtherContent: true,
  },
  [ROLES.DEV]: {
    canCreatePosts: true,
    canComment: true,
    canCreateCommunities: true,
    canModerate: true,
    canManageUsers: true,
    canManageTeachers: true,
    canAccessAdminPanel: true,
    canManageBlogs: true,
    canDeleteMembers: true,
    canGiveTeacherApprovals: false,
    canDeleteOtherContent: true,
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
    canDeleteMembers: true,
    canGiveTeacherApprovals: true,
    canDeleteOtherContent: true,
  },
} as const;

export function hasPermission(userRole: UserRole, permission: 'canCreatePosts' | 'canComment' | 'canCreateCommunities' | 'canModerate' | 'canManageUsers' | 'canManageTeachers' | 'canAccessAdminPanel' | 'canManageBlogs' | 'canDeleteMembers' | 'canGiveTeacherApprovals' | 'canDeleteOtherContent'): boolean {
  return ROLE_PERMISSIONS[userRole]?.[permission] || false;
}

export function hasRoleOrHigher(userRole: UserRole, requiredRole: UserRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

export function isTeacher(userRole: UserRole): boolean {
  return ['teacher', 'junior_teacher', 'senior_teacher', 'lead_teacher'].includes(userRole);
}

export function isAdmin(userRole: UserRole): boolean {
  return userRole === 'admin';
}

export function isModerator(userRole: UserRole): boolean {
  return ['moderator', 'senior_teacher', 'lead_teacher', 'dev', 'admin'].includes(userRole);
} 