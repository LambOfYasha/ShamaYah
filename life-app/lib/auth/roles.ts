export type UserRole = 'guest' | 'member' | 'moderator' | 'admin' | 'teacher' | 'junior_teacher' | 'senior_teacher' | 'lead_teacher' | 'dev';

export interface UserWithRole {
  _id: string;
  username: string;
  imageURL: string;
  email: string;
  role: UserRole;
  joinedAt?: string;
  bio?: string;
  location?: string;
  website?: string;
}

export const ROLES = {
  GUEST: 'guest',
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
  guest: 0,
  member: 1,
  junior_teacher: 2,
  teacher: 3,
  moderator: 4,
  senior_teacher: 5,
  lead_teacher: 6,
  dev: 7,
  admin: 8,
};

export const ROLE_PERMISSIONS = {
  [ROLES.GUEST]: {
    canCreatePosts: false,
    canComment: true,
    canCreateCommunities: true,
    canModerate: false,
    canManageUsers: false,
    canManageTeachers: false,
    canAccessAdminPanel: false,
    canManageBlogs: false,
    canDeleteMembers: false,
    canGiveTeacherApprovals: false,
    canDeleteOtherContent: false,
    canEditOwnContent: false,
    canDeleteOwnContent: false,
  },
  [ROLES.MEMBER]: {
    canCreatePosts: false,
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
    canEditOwnContent: true,
    canDeleteOwnContent: true,
  },
  [ROLES.TEACHER]: {
    canCreatePosts: true,
    canComment: true,
    canCreateCommunities: true,
    canModerate: true,
    canManageUsers: false,
    canManageTeachers: false,
    canAccessAdminPanel: true,
    canManageBlogs: true,
    canDeleteMembers: false,
    canGiveTeacherApprovals: false,
    canDeleteOtherContent: true,
    canEditOwnContent: true,
    canDeleteOwnContent: true,
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
    canDeleteOtherContent: false,
    canEditOwnContent: true,
    canDeleteOwnContent: true,
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
    canGiveTeacherApprovals: false,
    canDeleteOtherContent: false,
    canEditOwnContent: true,
    canDeleteOwnContent: true,
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
    canDeleteOtherContent: true,
    canEditOwnContent: true,
    canDeleteOwnContent: true,
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
    canEditOwnContent: true,
    canDeleteOwnContent: true,
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
    canEditOwnContent: true,
    canDeleteOwnContent: true,
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
    canEditOwnContent: true,
    canDeleteOwnContent: true,
  },
} as const;

export function hasPermission(userRole: UserRole, permission: 'canCreatePosts' | 'canComment' | 'canCreateCommunities' | 'canModerate' | 'canManageUsers' | 'canManageTeachers' | 'canAccessAdminPanel' | 'canManageBlogs' | 'canDeleteMembers' | 'canGiveTeacherApprovals' | 'canDeleteOtherContent' | 'canEditOwnContent' | 'canDeleteOwnContent'): boolean {
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
  return ['moderator', 'teacher', 'senior_teacher', 'lead_teacher', 'dev', 'admin'].includes(userRole);
}

export function canEditOwnContent(userRole: UserRole): boolean {
  return hasPermission(userRole, 'canEditOwnContent');
}

export function canDeleteOwnContent(userRole: UserRole): boolean {
  return hasPermission(userRole, 'canDeleteOwnContent');
}

export function canEditContent(userRole: UserRole, isOwnContent: boolean = false): boolean {
  // Users can always edit their own content if they have the permission
  if (isOwnContent) {
    return canEditOwnContent(userRole);
  }
  
  // For editing others' content, check if they have moderation/admin privileges
  return ['admin', 'teacher', 'junior_teacher', 'senior_teacher', 'lead_teacher', 'moderator'].includes(userRole);
}

export function canDeleteContent(userRole: UserRole, isOwnContent: boolean = false): boolean {
  // Users can always delete their own content if they have the permission
  if (isOwnContent) {
    return canDeleteOwnContent(userRole);
  }
  
  // For deleting others' content, check if they have moderation/admin privileges
  return ['admin', 'teacher', 'junior_teacher', 'senior_teacher', 'lead_teacher', 'moderator'].includes(userRole);
} 