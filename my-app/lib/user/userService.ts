import { adminClient } from '@/sanity/lib/adminClient';
import { client } from '@/sanity/lib/client';

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  reportedUsers: number;
  newUsersThisMonth: number;
  roleBreakdown: {
    admins: number;
    teachers: number;
    members: number;
  };
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

export class UserService {
  static async getAllUsers(filters: UserFilters = {}) {
    try {
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
        bio
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

  static async getUserById(userId: string) {
    try {
      const user = await adminClient.fetch(`*[_type == "user" && _id == $userId && isDeleted != true][0] {
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

  static async getUserStats(): Promise<{ success: boolean; stats?: UserStats; error?: string }> {
    try {
      const stats = await adminClient.fetch(`{
        "totalUsers": count(*[_type == "user" && isDeleted != true]),
        "activeUsers": count(*[_type == "user" && isDeleted != true && isActive == true]),
        "reportedUsers": count(*[_type == "user" && isDeleted != true && isReported == true]),
        "newUsersThisMonth": count(*[_type == "user" && isDeleted != true && _createdAt >= $startOfMonth]),
        "roleBreakdown": {
          "admins": count(*[_type == "user" && isDeleted != true && role == "admin"]),
          "teachers": count(*[_type == "user" && isDeleted != true && (role == "teacher" || role == "junior_teacher" || role == "senior_teacher" || role == "lead_teacher")]),
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

  static async updateUserRole(userId: string, newRole: 'member' | 'moderator' | 'admin' | 'teacher' | 'junior_teacher' | 'senior_teacher' | 'lead_teacher' | 'dev') {
    try {
      await adminClient
        .patch(userId)
        .set({ role: newRole })
        .commit();

      return { success: true, message: 'User role updated successfully' };
    } catch (error) {
      console.error('Error updating user role:', error);
      return { success: false, error: 'Failed to update user role' };
    }
  }

  static async toggleUserStatus(userId: string, isActive: boolean) {
    try {
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

  static async deleteUser(userId: string, deletedBy: string) {
    try {
      // Soft delete - mark as deleted instead of actually deleting
      await adminClient
        .patch(userId)
        .set({ 
          isDeleted: true,
          deletedAt: new Date().toISOString(),
          deletedBy
        })
        .commit();

      return { success: true, message: 'User deleted successfully' };
    } catch (error) {
      console.error('Error deleting user:', error);
      return { success: false, error: 'Failed to delete user' };
    }
  }

  static async bulkUpdateUsers(userIds: string[], updates: any) {
    try {
      const transaction = adminClient.transaction();
      
      userIds.forEach(userId => {
        transaction.patch(userId, {
          set: {
            ...updates,
            updatedAt: new Date().toISOString()
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

  static async updateUserActivity(userId: string) {
    try {
      await adminClient
        .patch(userId)
        .set({ 
          lastActive: new Date().toISOString()
        })
        .commit();
    } catch (error) {
      console.error('Error updating user activity:', error);
    }
  }

  static async incrementUserCounts(userId: string, type: 'post' | 'comment' | 'report') {
    try {
      const field = `${type}Count`;
      await adminClient
        .patch(userId)
        .inc({ [field]: 1 })
        .commit();
    } catch (error) {
      console.error(`Error incrementing user ${type} count:`, error);
    }
  }

  static async decrementUserCounts(userId: string, type: 'post' | 'comment' | 'report') {
    try {
      const field = `${type}Count`;
      await adminClient
        .patch(userId)
        .dec({ [field]: 1 })
        .commit();
    } catch (error) {
      console.error(`Error decrementing user ${type} count:`, error);
    }
  }

  static async searchUsers(query: string, limit: number = 10) {
    try {
      const users = await client.fetch(`*[_type == "user" && isDeleted != true && (username match "*${query}*" || email match "*${query}*")] | order(username asc) [0...${limit}] {
        _id,
        username,
        email,
        role,
        imageURL
      }`);

      return { success: true, users };
    } catch (error) {
      console.error('Error searching users:', error);
      return { success: false, error: 'Failed to search users' };
    }
  }
} 