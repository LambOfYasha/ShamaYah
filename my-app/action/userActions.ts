'use server';

import { auth } from '@clerk/nextjs/server';
import { getUser } from '@/lib/user/getUser';
import { assignRole } from '@/lib/auth/assignRole';
import { adminClient } from '@/sanity/lib/adminClient';

export interface UserData {
  _id: string;
  username: string;
  email: string;
  role: string;
  joinedAt: string;
  isReported: boolean;
  isActive: boolean;
  lastActive: string;
  postCount: number;
  commentCount: number;
  reportCount: number;
  imageURL?: string;
  bio?: string;
  youtubeChannelId?: string;
}

export interface UserFilters {
  search?: string;
  role?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export async function getAllUsers(filters: UserFilters = {}) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    const currentUser = await getUser();
    if ('error' in currentUser || currentUser.role !== 'admin') {
      return { success: false, error: 'Insufficient permissions' };
    }

    // Build GROQ query with filters
    let query = `*[_type == "user" && isDeleted != true`;
    
    if (filters.search) {
      query += ` && (username match "*${filters.search}*" || email match "*${filters.search}*")`;
    }
    
    if (filters.role && filters.role !== 'all') {
      query += ` && role == "${filters.role}"`;
    }
    
    if (filters.status === 'reported') {
      query += ` && isReported == true`;
    } else if (filters.status === 'active') {
      query += ` && isReported == false && isActive == true`;
    } else if (filters.status === 'inactive') {
      query += ` && isActive == false`;
    }
    
    query += `]`;
    
    // Add sorting
    const sortField = filters.sortBy || 'joinedAt';
    const sortOrder = filters.sortOrder || 'desc';
    query += ` | order(${sortField} ${sortOrder})`;
    
    // Add pagination
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const start = (page - 1) * limit;
    query += ` [${start}...${start + limit}]`;
    
    // Add projection
    query += ` {
      _id,
      username,
      email,
      role,
      joinedAt,
      isReported,
      isActive,
      lastActive,
      postCount,
      commentCount,
      reportCount,
      imageURL,
      bio,
      youtubeChannelId
    }`;

    const users = await adminClient.fetch(query);
    
    // Get total count for pagination
    let countQuery = `count(*[_type == "user" && isDeleted != true`;
    if (filters.search) {
      countQuery += ` && (username match "*${filters.search}*" || email match "*${filters.search}*")`;
    }
    if (filters.role && filters.role !== 'all') {
      countQuery += ` && role == "${filters.role}"`;
    }
    if (filters.status === 'reported') {
      countQuery += ` && isReported == true`;
    } else if (filters.status === 'active') {
      countQuery += ` && isReported == false && isActive == true`;
    } else if (filters.status === 'inactive') {
      countQuery += ` && isActive == false`;
    }
    countQuery += `])`;
    
    const totalCount = await adminClient.fetch(countQuery);

    return {
      success: true,
      users,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    };
  } catch (error) {
    console.error('Error fetching users:', error);
    return { success: false, error: 'Failed to fetch users' };
  }
}

export async function getUserById(userId: string) {
  try {
    const { userId: currentUserId } = await auth();
    if (!currentUserId) {
      return { success: false, error: 'Unauthorized' };
    }

    const currentUser = await getUser();
    if ('error' in currentUser || currentUser.role !== 'admin') {
      return { success: false, error: 'Insufficient permissions' };
    }

    const user = await adminClient.fetch(`*[_type == "user" && _id == $userId][0] {
      _id,
      username,
      email,
      role,
      joinedAt,
      isReported,
      isActive,
      lastActive,
      postCount,
      commentCount,
      reportCount,
      imageURL,
      bio,
      preferences
    }`, { userId });

    if (!user) {
      return { success: false, error: 'User not found' };
    }

    return { success: true, user };
  } catch (error) {
    console.error('Error fetching user:', error);
    return { success: false, error: 'Failed to fetch user' };
  }
}

export async function updateUserRole(userId: string, newRole: 'member' | 'moderator' | 'admin' | 'teacher' | 'junior_teacher' | 'senior_teacher' | 'lead_teacher' | 'dev') {
  try {
    const { userId: currentUserId } = await auth();
    if (!currentUserId) {
      return { success: false, error: 'Unauthorized' };
    }

    const currentUser = await getUser();
    if ('error' in currentUser || currentUser.role !== 'admin') {
      return { success: false, error: 'Insufficient permissions' };
    }

    // Update in Sanity
    await adminClient
      .patch(userId)
      .set({ role: newRole })
      .commit();

    // Update in Clerk (if needed)
    await assignRole(userId, newRole);

    return { success: true, message: 'User role updated successfully' };
  } catch (error) {
    console.error('Error updating user role:', error);
    return { success: false, error: 'Failed to update user role' };
  }
}

export async function toggleUserStatus(userId: string, isActive: boolean) {
  try {
    const { userId: currentUserId } = await auth();
    if (!currentUserId) {
      return { success: false, error: 'Unauthorized' };
    }

    const currentUser = await getUser();
    if ('error' in currentUser || currentUser.role !== 'admin') {
      return { success: false, error: 'Insufficient permissions' };
    }

    await adminClient
      .patch(userId)
      .set({ isActive })
      .commit();

    return { 
      success: true, 
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully` 
    };
  } catch (error) {
    console.error('Error updating user status:', error);
    return { success: false, error: 'Failed to update user status' };
  }
}

export async function deleteUser(userId: string) {
  try {
    const { userId: currentUserId } = await auth();
    if (!currentUserId) {
      return { success: false, error: 'Unauthorized' };
    }

    const currentUser = await getUser();
    if ('error' in currentUser) {
      return { success: false, error: 'User not found' };
    }

    // Check if user has permission to delete users
    if (!['admin', 'lead_teacher', 'senior_teacher'].includes(currentUser.role)) {
      return { success: false, error: 'Insufficient permissions' };
    }

    // Get the user to be deleted
    const userToDelete = await adminClient.fetch(`*[_type == "user" && _id == $userId][0]`, { userId });
    
    if (!userToDelete) {
      return { success: false, error: 'User not found' };
    }

    // Senior teachers can only delete members, not moderators and up
    if (currentUser.role === 'senior_teacher' && userToDelete.role && ['moderator', 'teacher', 'junior_teacher', 'senior_teacher', 'lead_teacher', 'dev', 'admin'].includes(userToDelete.role)) {
      return { success: false, error: 'Senior teachers can only delete members' };
    }

    // Check if user is trying to delete themselves
    if (currentUserId === userId) {
      return { success: false, error: 'Cannot delete your own account' };
    }

    // Soft delete the user
    await adminClient
      .patch(userId)
      .set({ 
        isDeleted: true, 
        deletedAt: new Date().toISOString(),
        deletedBy: currentUser._id
      })
      .commit();

    return { success: true, message: 'User deleted successfully' };
  } catch (error) {
    console.error('Error deleting user:', error);
    return { success: false, error: 'Failed to delete user' };
  }
}

export async function getUserStats() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    const currentUser = await getUser();
    if ('error' in currentUser || currentUser.role !== 'admin') {
      return { success: false, error: 'Insufficient permissions' };
    }

    const stats = await adminClient.fetch(`{
      "totalUsers": count(*[_type == "user" && isDeleted != true]),
      "activeUsers": count(*[_type == "user" && isDeleted != true && isActive == true]),
      "reportedUsers": count(*[_type == "user" && isDeleted != true && isReported == true]),
      "newUsersThisMonth": count(*[_type == "user" && isDeleted != true && _createdAt >= $startOfMonth]),
      "roleBreakdown": {
        "admins": count(*[_type == "user" && isDeleted != true && role == "admin"]),
        "teachers": count(*[_type == "user" && isDeleted != true && role == "teacher"]),
        "members": count(*[_type == "user" && isDeleted != true && role == "member"])
      }
    }`, {
      startOfMonth: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()
    });

    return { success: true, stats };
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return { success: false, error: 'Failed to fetch user stats' };
  }
}

export interface CreateUserData {
  username: string;
  email: string;
  role: string;
  bio?: string;
  imageURL?: string;
  youtubeChannelId?: string;
}

export async function createUser(data: CreateUserData | Record<string, any>) {
  try {
    const { userId: currentUserId } = await auth();
    if (!currentUserId) {
      return { success: false, error: 'Unauthorized' };
    }

    const currentUser = await getUser();
    if ('error' in currentUser || currentUser.role !== 'admin') {
      return { success: false, error: 'Insufficient permissions' };
    }

    if (!data.username || !data.email || !data.role) {
      return { success: false, error: 'Username, email, and role are required' };
    }

    // Check if a user with this email already exists
    const existing = await adminClient.fetch(
      `*[_type == "user" && email == $email && isDeleted != true][0]{ _id }`,
      { email: data.email }
    );

    if (existing) {
      return { success: false, error: 'A user with this email already exists' };
    }

    const doc = {
      _type: 'user' as const,
      username: data.username,
      email: data.email,
      role: data.role,
      joinedAt: new Date().toISOString(),
      isActive: true,
      isReported: false,
      isDeleted: false,
      postCount: 0,
      commentCount: 0,
      reportCount: 0,
      ...(data.bio && { bio: data.bio }),
      ...(data.imageURL && { imageURL: data.imageURL }),
      ...(data.youtubeChannelId && { youtubeChannelId: data.youtubeChannelId }),
    };

    const created = await adminClient.create(doc);

    return { success: true, message: 'User created successfully', userId: created._id };
  } catch (error) {
    console.error('Error creating user:', error);
    return { success: false, error: 'Failed to create user' };
  }
}

export interface UserProfileUpdate {
  bio?: string;
  youtubeChannelId?: string;
}

export async function updateUserProfile(userId: string, profileData: UserProfileUpdate) {
  try {
    const { userId: currentUserId } = await auth();
    if (!currentUserId) {
      return { success: false, error: 'Unauthorized' };
    }

    const currentUser = await getUser();
    if ('error' in currentUser || currentUser.role !== 'admin') {
      return { success: false, error: 'Insufficient permissions' };
    }

    // Validate the user exists
    const targetUser = await adminClient.fetch(
      `*[_type == "user" && _id == $userId && isDeleted != true][0]{ _id, role }`,
      { userId }
    );

    if (!targetUser) {
      return { success: false, error: 'User not found' };
    }

    // Build the update object with only allowed fields
    const allowedUpdates: Record<string, unknown> = {};
    if (profileData.bio !== undefined) allowedUpdates.bio = profileData.bio;
    // Only allow youtubeChannelId for teacher roles
    if (profileData.youtubeChannelId !== undefined && 
        ['teacher', 'junior_teacher', 'senior_teacher', 'lead_teacher'].includes(targetUser.role)) {
      allowedUpdates.youtubeChannelId = profileData.youtubeChannelId;
    }

    if (Object.keys(allowedUpdates).length === 0) {
      return { success: false, error: 'No valid fields to update' };
    }

    await adminClient
      .patch(userId)
      .set(allowedUpdates)
      .commit();

    return { success: true, message: 'User profile updated successfully' };
  } catch (error) {
    console.error('Error updating user profile:', error);
    return { success: false, error: 'Failed to update user profile' };
  }
}

export async function bulkUpdateUsers(userIds: string[], updates: Partial<UserData>) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    const currentUser = await getUser();
    if ('error' in currentUser || currentUser.role !== 'admin') {
      return { success: false, error: 'Insufficient permissions' };
    }

    const transaction = adminClient.transaction();
    
    userIds.forEach(userId => {
      transaction.patch(userId, {
        set: {
          ...updates,
          updatedAt: new Date().toISOString(),
          updatedBy: currentUser._id
        }
      });
    });

    await transaction.commit();

    return { 
      success: true, 
      message: `Updated ${userIds.length} users successfully` 
    };
  } catch (error) {
    console.error('Error bulk updating users:', error);
    return { success: false, error: 'Failed to bulk update users' };
  }
} 