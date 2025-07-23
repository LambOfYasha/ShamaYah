'use server';

import { auth } from '@clerk/nextjs/server';
import { getUser } from '@/lib/user/getUser';
import { assignRole } from '@/lib/auth/assignRole';
import { adminClient } from '@/sanity/lib/adminClient';

export interface TeacherData {
  _id: string;
  username: string;
  email: string;
  role: string;
  specializations: string[];
  joinedAt: string;
  isReported: boolean;
  isActive: boolean;
  lastActive: string;
  postCount: number;
  commentCount: number;
  reportCount: number;
  avatar?: string;
  bio?: string;
  qualifications?: string[];
  experience?: number;
  rating?: number;
  totalStudents?: number;
  coursesCreated?: number;
}

export interface TeacherFilters {
  search?: string;
  role?: string;
  specialization?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export async function getAllTeachers(filters: TeacherFilters = {}) {
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
    let query = `*[_type == "user" && (role == "teacher" || role == "junior_teacher" || role == "senior_teacher" || role == "lead_teacher") && isDeleted != true`;
    
    if (filters.search) {
      query += ` && (username match "*${filters.search}*" || email match "*${filters.search}*")`;
    }
    
    if (filters.role && filters.role !== 'all') {
      query += ` && teacherRole == "${filters.role}"`;
    }
    
    if (filters.specialization && filters.specialization !== 'all') {
      query += ` && "${filters.specialization}" in specializations[]`;
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
      specializations,
      joinedAt,
      isReported,
      isActive,
      lastActive,
      postCount,
      commentCount,
      reportCount,
      avatar,
      bio,
      qualifications,
      experience,
      rating,
      totalStudents,
      coursesCreated
    }`;

    const teachers = await adminClient.fetch(query);
    
    // Get total count for pagination
    let countQuery = `count(*[_type == "user" && (role == "teacher" || role == "junior_teacher" || role == "senior_teacher" || role == "lead_teacher") && isDeleted != true`;
    if (filters.search) {
      countQuery += ` && (username match "*${filters.search}*" || email match "*${filters.search}*")`;
    }
    if (filters.role && filters.role !== 'all') {
      countQuery += ` && teacherRole == "${filters.role}"`;
    }
    if (filters.specialization && filters.specialization !== 'all') {
      countQuery += ` && "${filters.specialization}" in specializations[]`;
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
      teachers,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    };
  } catch (error) {
    console.error('Error fetching teachers:', error);
    return { success: false, error: 'Failed to fetch teachers' };
  }
}

export async function getTeacherById(teacherId: string) {
  try {
    const { userId: currentUserId } = await auth();
    if (!currentUserId) {
      return { success: false, error: 'Unauthorized' };
    }

    const currentUser = await getUser();
    if ('error' in currentUser || currentUser.role !== 'admin') {
      return { success: false, error: 'Insufficient permissions' };
    }

    const teacher = await adminClient.fetch(`*[_type == "user" && _id == $teacherId && (role == "teacher" || role == "junior_teacher" || role == "senior_teacher" || role == "lead_teacher") && isDeleted != true][0] {
      _id,
      username,
      email,
      role,
      specializations,
      joinedAt,
      isReported,
      isActive,
      lastActive,
      postCount,
      commentCount,
      reportCount,
      avatar,
      bio,
      qualifications,
      experience,
      rating,
      totalStudents,
      coursesCreated,
      preferences
    }`, { teacherId });

    if (!teacher) {
      return { success: false, error: 'Teacher not found' };
    }

    return { success: true, teacher };
  } catch (error) {
    console.error('Error fetching teacher:', error);
    return { success: false, error: 'Failed to fetch teacher' };
  }
}

export async function updateTeacherRole(teacherId: string, newRole: 'teacher' | 'junior_teacher' | 'senior_teacher' | 'lead_teacher') {
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
      .patch(teacherId)
      .set({ teacherRole: newRole })
      .commit();

    return { success: true, message: 'Teacher role updated successfully' };
  } catch (error) {
    console.error('Error updating teacher role:', error);
    return { success: false, error: 'Failed to update teacher role' };
  }
}

export async function updateTeacherSpecializations(teacherId: string, specializations: string[]) {
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
      .patch(teacherId)
      .set({ specializations })
      .commit();

    return { success: true, message: 'Teacher specializations updated successfully' };
  } catch (error) {
    console.error('Error updating teacher specializations:', error);
    return { success: false, error: 'Failed to update teacher specializations' };
  }
}

export async function toggleTeacherStatus(teacherId: string, isActive: boolean) {
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
      .patch(teacherId)
      .set({ isActive })
      .commit();

    return { 
      success: true, 
      message: `Teacher ${isActive ? 'activated' : 'deactivated'} successfully` 
    };
  } catch (error) {
    console.error('Error updating teacher status:', error);
    return { success: false, error: 'Failed to update teacher status' };
  }
}

export async function deleteTeacher(teacherId: string) {
  try {
    const { userId: currentUserId } = await auth();
    if (!currentUserId) {
      return { success: false, error: 'Unauthorized' };
    }

    const currentUser = await getUser();
    if ('error' in currentUser || currentUser.role !== 'admin') {
      return { success: false, error: 'Insufficient permissions' };
    }

    // Check if user is trying to delete themselves
    if (currentUserId === teacherId) {
      return { success: false, error: 'Cannot delete your own account' };
    }

    // Soft delete - mark as deleted instead of actually deleting
    await adminClient
      .patch(teacherId)
      .set({ 
        isDeleted: true,
        deletedAt: new Date().toISOString(),
        deletedBy: currentUserId
      })
      .commit();

    return { success: true, message: 'Teacher deleted successfully' };
  } catch (error) {
    console.error('Error deleting teacher:', error);
    return { success: false, error: 'Failed to delete teacher' };
  }
}

export async function getTeacherStats() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    const currentUser = await getUser();
    if ('error' in currentUser || currentUser.role !== 'admin') {
      return { success: false, error: 'Insufficient permissions' };
    }

    const stats = await adminClient.fetch(`