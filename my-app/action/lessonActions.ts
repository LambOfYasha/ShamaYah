'use server';

import { auth } from '@clerk/nextjs/server';
import { getUser } from '@/lib/user/getUser';
import { adminClient } from '@/sanity/lib/adminClient';
import { client } from '@/sanity/lib/client';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface LessonCategoryData {
  _id: string;
  title: string;
  slug: { current: string };
  description?: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  lessonCount?: number;
}

export interface LessonData {
  _id: string;
  title: string;
  slug: { current: string };
  description?: string;
  videoId: string;
  category: { _id: string; title: string } | null;
  tags?: { _id: string; name: string }[];
  content?: string;
  sortOrder: number;
  isPublished: boolean;
  createdBy?: { _id: string; username: string };
  createdAt: string;
  updatedAt?: string;
  viewCount: number;
}

// ─── Auth helper ─────────────────────────────────────────────────────────────

const ALLOWED_ROLES = ['admin', 'teacher', 'junior_teacher', 'senior_teacher', 'lead_teacher', 'dev'];

async function requireLessonManager() {
  const { userId } = await auth();
  if (!userId) {
    return { error: 'Unauthorized' };
  }

  const currentUser = await getUser();
  if ('error' in currentUser) {
    return { error: currentUser.error };
  }

  if (!ALLOWED_ROLES.includes(currentUser.role)) {
    return { error: 'Insufficient permissions' };
  }

  return { user: currentUser };
}

// ─── Category CRUD ───────────────────────────────────────────────────────────

export async function getLessonCategories() {
  try {
    const categories: LessonCategoryData[] = await client.fetch(`
      *[_type == "lessonCategory"] | order(sortOrder asc, title asc) {
        _id,
        title,
        slug,
        description,
        sortOrder,
        isActive,
        createdAt,
        updatedAt,
        "lessonCount": count(*[_type == "lesson" && category._ref == ^._id])
      }
    `);

    return { success: true, categories };
  } catch (error) {
    console.error('Error fetching lesson categories:', error);
    return { success: false, error: 'Failed to fetch lesson categories' };
  }
}

export async function getActiveLessonCategories() {
  try {
    const categories: LessonCategoryData[] = await client.fetch(`
      *[_type == "lessonCategory" && isActive == true] | order(sortOrder asc, title asc) {
        _id,
        title,
        slug,
        description,
        sortOrder,
        isActive,
        createdAt,
        "lessonCount": count(*[_type == "lesson" && category._ref == ^._id && isPublished == true])
      }
    `);

    return { success: true, categories };
  } catch (error) {
    console.error('Error fetching active lesson categories:', error);
    return { success: false, error: 'Failed to fetch lesson categories' };
  }
}

export async function createLessonCategory(data: {
  title: string;
  description?: string;
  sortOrder?: number;
}) {
  try {
    const authResult = await requireLessonManager();
    if ('error' in authResult) {
      return { success: false, error: authResult.error };
    }

    if (!data.title || data.title.trim().length < 2) {
      return { success: false, error: 'Category title is required (min 2 characters)' };
    }

    // Check for duplicate title
    const existing = await adminClient.fetch(
      `*[_type == "lessonCategory" && lower(title) == lower($title)][0]{ _id }`,
      { title: data.title.trim() }
    );

    if (existing) {
      return { success: false, error: 'A category with this title already exists' };
    }

    const slug = data.title.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    const doc = {
      _type: 'lessonCategory' as const,
      title: data.title.trim(),
      slug: { _type: 'slug' as const, current: slug },
      description: data.description?.trim() || '',
      sortOrder: data.sortOrder ?? 0,
      isActive: true,
      createdBy: { _type: 'reference' as const, _ref: authResult.user._id },
      createdAt: new Date().toISOString(),
    };

    const created = await adminClient.create(doc);

    return { success: true, message: 'Category created successfully', categoryId: created._id };
  } catch (error) {
    console.error('Error creating lesson category:', error);
    return { success: false, error: 'Failed to create lesson category' };
  }
}

export async function updateLessonCategory(categoryId: string, data: {
  title?: string;
  description?: string;
  sortOrder?: number;
  isActive?: boolean;
}) {
  try {
    const authResult = await requireLessonManager();
    if ('error' in authResult) {
      return { success: false, error: authResult.error };
    }

    const existing = await adminClient.fetch(
      `*[_type == "lessonCategory" && _id == $id][0]{ _id }`,
      { id: categoryId }
    );

    if (!existing) {
      return { success: false, error: 'Category not found' };
    }

    // Check for duplicate title if title is changing
    if (data.title) {
      const duplicate = await adminClient.fetch(
        `*[_type == "lessonCategory" && lower(title) == lower($title) && _id != $id][0]{ _id }`,
        { title: data.title.trim(), id: categoryId }
      );
      if (duplicate) {
        return { success: false, error: 'A category with this title already exists' };
      }
    }

    const updates: Record<string, unknown> = {
      updatedAt: new Date().toISOString(),
    };

    if (data.title !== undefined) {
      updates.title = data.title.trim();
      updates.slug = {
        _type: 'slug',
        current: data.title.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
      };
    }
    if (data.description !== undefined) updates.description = data.description.trim();
    if (data.sortOrder !== undefined) updates.sortOrder = data.sortOrder;
    if (data.isActive !== undefined) updates.isActive = data.isActive;

    await adminClient.patch(categoryId).set(updates).commit();

    return { success: true, message: 'Category updated successfully' };
  } catch (error) {
    console.error('Error updating lesson category:', error);
    return { success: false, error: 'Failed to update lesson category' };
  }
}

export async function deleteLessonCategory(categoryId: string) {
  try {
    const authResult = await requireLessonManager();
    if ('error' in authResult) {
      return { success: false, error: authResult.error };
    }

    // Check if category has lessons
    const lessonCount = await adminClient.fetch(
      `count(*[_type == "lesson" && category._ref == $id])`,
      { id: categoryId }
    );

    if (lessonCount > 0) {
      return { success: false, error: `Cannot delete category: it has ${lessonCount} lesson(s). Remove or reassign them first.` };
    }

    await adminClient.delete(categoryId);

    return { success: true, message: 'Category deleted successfully' };
  } catch (error) {
    console.error('Error deleting lesson category:', error);
    return { success: false, error: 'Failed to delete lesson category' };
  }
}

// ─── Lesson CRUD ─────────────────────────────────────────────────────────────

export async function getLessons(filters?: {
  categoryId?: string;
  search?: string;
  isPublished?: boolean;
  page?: number;
  limit?: number;
}) {
  try {
    let query = `*[_type == "lesson"`;
    const params: Record<string, unknown> = {};

    if (filters?.categoryId) {
      query += ` && category._ref == $categoryId`;
      params.categoryId = filters.categoryId;
    }

    if (filters?.search) {
      query += ` && (title match $search || description match $search)`;
      params.search = `*${filters.search}*`;
    }

    if (filters?.isPublished !== undefined) {
      query += ` && isPublished == $isPublished`;
      params.isPublished = filters.isPublished;
    }

    query += `]`;
    query += ` | order(sortOrder asc, createdAt desc)`;

    const page = filters?.page || 1;
    const limit = filters?.limit || 50;
    const start = (page - 1) * limit;
    query += ` [${start}...${start + limit}]`;

    query += ` {
      _id,
      title,
      slug,
      description,
      videoId,
      category->{ _id, title },
      tags[]->{ _id, name },
      content,
      sortOrder,
      isPublished,
      createdBy->{ _id, username },
      createdAt,
      updatedAt,
      viewCount
    }`;

    const lessons: LessonData[] = await adminClient.fetch(query, params);

    // Get total count
    let countQuery = `count(*[_type == "lesson"`;
    if (filters?.categoryId) countQuery += ` && category._ref == $categoryId`;
    if (filters?.search) countQuery += ` && (title match $search || description match $search)`;
    if (filters?.isPublished !== undefined) countQuery += ` && isPublished == $isPublished`;
    countQuery += `])`;

    const total = await adminClient.fetch(countQuery, params);

    return {
      success: true,
      lessons,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  } catch (error) {
    console.error('Error fetching lessons:', error);
    return { success: false, error: 'Failed to fetch lessons' };
  }
}

export async function getPublishedLessons() {
  try {
    const lessons = await client.fetch(`
      *[_type == "lesson" && isPublished == true] | order(sortOrder asc, createdAt desc) {
        _id,
        title,
        slug,
        description,
        videoId,
        category->{ _id, title },
        tags[]->{ _id, name },
        content,
        sortOrder,
        isPublished,
        createdAt,
        viewCount
      }
    `);

    return { success: true, lessons };
  } catch (error) {
    console.error('Error fetching published lessons:', error);
    return { success: false, error: 'Failed to fetch lessons' };
  }
}

export async function getLessonById(lessonId: string) {
  try {
    const lesson = await adminClient.fetch(
      `*[_type == "lesson" && _id == $id][0] {
        _id,
        title,
        slug,
        description,
        videoId,
        category->{ _id, title },
        tags[]->{ _id, name },
        content,
        sortOrder,
        isPublished,
        createdBy->{ _id, username },
        createdAt,
        updatedAt,
        viewCount
      }`,
      { id: lessonId }
    );

    if (!lesson) {
      return { success: false, error: 'Lesson not found' };
    }

    return { success: true, lesson };
  } catch (error) {
    console.error('Error fetching lesson:', error);
    return { success: false, error: 'Failed to fetch lesson' };
  }
}

export async function createLesson(data: {
  title: string;
  description?: string;
  videoId: string;
  categoryId: string;
  tagIds?: string[];
  content?: string;
  sortOrder?: number;
  isPublished?: boolean;
}) {
  try {
    const authResult = await requireLessonManager();
    if ('error' in authResult) {
      return { success: false, error: authResult.error };
    }

    if (!data.title || data.title.trim().length < 3) {
      return { success: false, error: 'Lesson title is required (min 3 characters)' };
    }
    if (!data.videoId || data.videoId.trim().length === 0) {
      return { success: false, error: 'YouTube video ID is required' };
    }
    if (!data.categoryId) {
      return { success: false, error: 'Category is required' };
    }

    // Verify category exists
    const categoryExists = await adminClient.fetch(
      `*[_type == "lessonCategory" && _id == $id][0]{ _id }`,
      { id: data.categoryId }
    );
    if (!categoryExists) {
      return { success: false, error: 'Selected category does not exist' };
    }

    const slug = data.title.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    const doc = {
      _type: 'lesson' as const,
      title: data.title.trim(),
      slug: { _type: 'slug' as const, current: slug },
      description: data.description?.trim() || '',
      videoId: data.videoId.trim(),
      category: { _type: 'reference' as const, _ref: data.categoryId },
      content: data.content?.trim() || '',
      sortOrder: data.sortOrder ?? 0,
      isPublished: data.isPublished ?? true,
      createdBy: { _type: 'reference' as const, _ref: authResult.user._id },
      createdAt: new Date().toISOString(),
      viewCount: 0,
      ...(data.tagIds && data.tagIds.length > 0 ? {
        tags: data.tagIds.map(id => ({
          _type: 'reference' as const,
          _ref: id,
          _key: id,
        })),
      } : {}),
    };

    const created = await adminClient.create(doc);

    return { success: true, message: 'Lesson created successfully', lessonId: created._id };
  } catch (error) {
    console.error('Error creating lesson:', error);
    return { success: false, error: 'Failed to create lesson' };
  }
}

export async function updateLesson(lessonId: string, data: {
  title?: string;
  description?: string;
  videoId?: string;
  categoryId?: string;
  tagIds?: string[];
  content?: string;
  sortOrder?: number;
  isPublished?: boolean;
}) {
  try {
    const authResult = await requireLessonManager();
    if ('error' in authResult) {
      return { success: false, error: authResult.error };
    }

    const existing = await adminClient.fetch(
      `*[_type == "lesson" && _id == $id][0]{ _id }`,
      { id: lessonId }
    );
    if (!existing) {
      return { success: false, error: 'Lesson not found' };
    }

    const updates: Record<string, unknown> = {
      updatedAt: new Date().toISOString(),
    };

    if (data.title !== undefined) {
      updates.title = data.title.trim();
      updates.slug = {
        _type: 'slug',
        current: data.title.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
      };
    }
    if (data.description !== undefined) updates.description = data.description.trim();
    if (data.videoId !== undefined) updates.videoId = data.videoId.trim();
    if (data.categoryId !== undefined) {
      updates.category = { _type: 'reference', _ref: data.categoryId };
    }
    if (data.content !== undefined) updates.content = data.content.trim();
    if (data.sortOrder !== undefined) updates.sortOrder = data.sortOrder;
    if (data.isPublished !== undefined) updates.isPublished = data.isPublished;

    if (data.tagIds !== undefined) {
      updates.tags = data.tagIds.map(id => ({
        _type: 'reference',
        _ref: id,
        _key: id,
      }));
    }

    await adminClient.patch(lessonId).set(updates).commit();

    return { success: true, message: 'Lesson updated successfully' };
  } catch (error) {
    console.error('Error updating lesson:', error);
    return { success: false, error: 'Failed to update lesson' };
  }
}

export async function deleteLesson(lessonId: string) {
  try {
    const authResult = await requireLessonManager();
    if ('error' in authResult) {
      return { success: false, error: authResult.error };
    }

    const existing = await adminClient.fetch(
      `*[_type == "lesson" && _id == $id][0]{ _id }`,
      { id: lessonId }
    );
    if (!existing) {
      return { success: false, error: 'Lesson not found' };
    }

    await adminClient.delete(lessonId);

    return { success: true, message: 'Lesson deleted successfully' };
  } catch (error) {
    console.error('Error deleting lesson:', error);
    return { success: false, error: 'Failed to delete lesson' };
  }
}

// ─── Stats ───────────────────────────────────────────────────────────────────

export async function getLessonStats() {
  try {
    const stats = await client.fetch(`{
      "totalLessons": count(*[_type == "lesson"]),
      "publishedLessons": count(*[_type == "lesson" && isPublished == true]),
      "draftLessons": count(*[_type == "lesson" && isPublished != true]),
      "totalCategories": count(*[_type == "lessonCategory"]),
      "activeCategories": count(*[_type == "lessonCategory" && isActive == true]),
      "totalViews": math::sum(*[_type == "lesson"].viewCount)
    }`);

    return { success: true, stats };
  } catch (error) {
    console.error('Error fetching lesson stats:', error);
    return { success: false, error: 'Failed to fetch lesson stats' };
  }
}

// ─── Tags helper ─────────────────────────────────────────────────────────────

export async function getAvailableTags() {
  try {
    const tags = await client.fetch(`
      *[_type == "tag"] | order(name asc) {
        _id,
        name,
        slug,
        color
      }
    `);

    return { success: true, tags };
  } catch (error) {
    console.error('Error fetching tags:', error);
    return { success: false, error: 'Failed to fetch tags' };
  }
}

// ─── Seed from hardcoded data ────────────────────────────────────────────────

export async function seedLessonsFromHardcoded() {
  try {
    const authResult = await requireLessonManager();
    if ('error' in authResult) {
      return { success: false, error: authResult.error };
    }

    // Only allow admin/dev to seed
    if (!['admin', 'dev'].includes(authResult.user.role)) {
      return { success: false, error: 'Only admin/dev can seed data' };
    }

    // Check if already seeded
    const existingCount = await adminClient.fetch(`count(*[_type == "lessonCategory"])`);
    if (existingCount > 0) {
      return { success: false, error: 'Data already seeded. Delete existing categories first.' };
    }

    const hardcodedCategories = [
      {
        title: 'Fundamentals',
        sortOrder: 0,
        lessons: [
          { title: 'The Bible Saves Us', videoId: '2EpSJExshAw', description: 'Understanding how the Bible serves as our guide to salvation' },
          { title: 'Belief, Grace, Justification, Sanctification and Salvation', videoId: 'oCG6kb1wUoQ', description: 'Exploring the core doctrines of Christian faith and salvation' },
          { title: 'The Trinity is not a true doctrine', videoId: 'UfJ0DPcYGgc', description: 'Examining the biblical perspective on the Trinity doctrine' },
          { title: 'State of the dead', videoId: 'vtCVosyhmtc', description: 'Understanding what the Bible teaches about death and the afterlife' },
          { title: 'Hebrew Study', videoId: '1S6X6YoW0jE', description: 'Learning Hebrew to better understand biblical texts' },
          { title: 'The Name Study', videoId: 'XhRqU9ubme4', description: 'Exploring the significance of divine names in scripture' },
        ],
      },
      {
        title: 'Law',
        sortOrder: 1,
        lessons: [
          { title: 'You need the law to be saved', videoId: 'bcFr6K4v4Aw', description: "Understanding the role of God's law in salvation" },
          { title: 'The unforgiveable sin', videoId: 'E8Uc3400yJ4', description: 'Examining what the Bible says about the unpardonable sin' },
          { title: 'Shabbat', videoId: 'cAlZ8xCtYX4', description: 'The biblical significance and observance of the Sabbath' },
        ],
      },
      {
        title: 'Righteous Living',
        sortOrder: 2,
        lessons: [
          { title: 'How to stop sinning', videoId: 'yREFz0wN1jw', description: 'Practical guidance for overcoming sin in daily life' },
          { title: 'The Sanctuary', videoId: '-UlkpOfBs4k', description: 'Understanding the sanctuary service and its meaning' },
          { title: 'Obedience', videoId: 'KL2Hg8pX3h8', description: "The importance of obedience to God's will" },
        ],
      },
      {
        title: 'Prophecy',
        sortOrder: 3,
        lessons: [
          { title: 'Do you need prophecy to be saved?', videoId: 'KthU3KGiFMU', description: 'The role of prophecy in Christian faith and salvation' },
          { title: '144,000', videoId: 'bwy6SnPyMZk', description: 'Understanding the biblical reference to the 144,000' },
          { title: 'Mark of the Beast', videoId: 'hk4LCnqFvCQ', description: 'Exploring the biblical prophecy about the mark of the beast' },
        ],
      },
    ];

    let totalLessons = 0;

    for (const cat of hardcodedCategories) {
      const slug = cat.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

      const createdCat = await adminClient.create({
        _type: 'lessonCategory' as const,
        title: cat.title,
        slug: { _type: 'slug' as const, current: slug },
        description: '',
        sortOrder: cat.sortOrder,
        isActive: true,
        createdBy: { _type: 'reference' as const, _ref: authResult.user._id },
        createdAt: new Date().toISOString(),
      });

      for (let i = 0; i < cat.lessons.length; i++) {
        const lesson = cat.lessons[i];
        const lessonSlug = lesson.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

        await adminClient.create({
          _type: 'lesson' as const,
          title: lesson.title,
          slug: { _type: 'slug' as const, current: lessonSlug },
          description: lesson.description,
          videoId: lesson.videoId,
          category: { _type: 'reference' as const, _ref: createdCat._id },
          content: '',
          sortOrder: i,
          isPublished: true,
          createdBy: { _type: 'reference' as const, _ref: authResult.user._id },
          createdAt: new Date().toISOString(),
          viewCount: 0,
        });

        totalLessons++;
      }
    }

    return {
      success: true,
      message: `Seeded ${hardcodedCategories.length} categories and ${totalLessons} lessons successfully`,
    };
  } catch (error) {
    console.error('Error seeding lessons:', error);
    return { success: false, error: 'Failed to seed lessons' };
  }
}
