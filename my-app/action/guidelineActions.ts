'use server';

import { auth } from '@clerk/nextjs/server';
import { getUser } from '@/lib/user/getUser';
import { CustomGuidelinesService } from '@/lib/ai/customGuidelines';

export async function createGuideline(guidelineData: any) {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error('Unauthorized');
    }

    const userResult = await getUser();
    if ('error' in userResult) {
      throw new Error('User not found');
    }

    if (userResult.role !== 'admin') {
      throw new Error('Admin access required');
    }

    // Initialize guidelines if not already done
    CustomGuidelinesService.initializeDefaultGuidelines();

    const guideline = await CustomGuidelinesService.addGuideline({
      ...guidelineData,
      createdBy: userResult._id
    });

    return { success: true, guideline };
  } catch (error: any) {
    console.error('Create guideline error:', error);
    return { success: false, error: error.message };
  }
}

export async function updateGuideline(guidelineId: string, updates: any) {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error('Unauthorized');
    }

    const userResult = await getUser();
    if ('error' in userResult) {
      throw new Error('User not found');
    }

    if (userResult.role !== 'admin') {
      throw new Error('Admin access required');
    }

    const guideline = await CustomGuidelinesService.updateGuideline(guidelineId, updates);
    if (!guideline) {
      throw new Error('Guideline not found');
    }

    return { success: true, guideline };
  } catch (error: any) {
    console.error('Update guideline error:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteGuideline(guidelineId: string) {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error('Unauthorized');
    }

    const userResult = await getUser();
    if ('error' in userResult) {
      throw new Error('User not found');
    }

    if (userResult.role !== 'admin') {
      throw new Error('Admin access required');
    }

    const success = await CustomGuidelinesService.deleteGuideline(guidelineId);
    if (!success) {
      throw new Error('Guideline not found');
    }

    return { success: true };
  } catch (error: any) {
    console.error('Delete guideline error:', error);
    return { success: false, error: error.message };
  }
}

export async function getGuidelines(category?: string) {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error('Unauthorized');
    }

    const userResult = await getUser();
    if ('error' in userResult) {
      throw new Error('User not found');
    }

    if (userResult.role !== 'admin' && userResult.role !== 'teacher' && userResult.role !== 'junior_teacher' && userResult.role !== 'senior_teacher' && userResult.role !== 'lead_teacher') {
      throw new Error('Insufficient permissions');
    }

    // Initialize guidelines if not already done
    CustomGuidelinesService.initializeDefaultGuidelines();

    let guidelines;
    if (category) {
      guidelines = CustomGuidelinesService.getGuidelinesByCategory(category);
    } else {
      guidelines = CustomGuidelinesService.getActiveGuidelines();
    }

    const stats = CustomGuidelinesService.getGuidelineStats();

    return { success: true, guidelines, stats };
  } catch (error: any) {
    console.error('Get guidelines error:', error);
    return { success: false, error: error.message };
  }
}

export async function getGuidelineStats() {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error('Unauthorized');
    }

    const userResult = await getUser();
    if ('error' in userResult) {
      throw new Error('User not found');
    }

    if (userResult.role !== 'admin' && userResult.role !== 'teacher' && userResult.role !== 'junior_teacher' && userResult.role !== 'senior_teacher' && userResult.role !== 'lead_teacher') {
      throw new Error('Insufficient permissions');
    }

    const stats = CustomGuidelinesService.getGuidelineStats();
    return { success: true, stats };
  } catch (error: any) {
    console.error('Get guideline stats error:', error);
    return { success: false, error: error.message };
  }
} 