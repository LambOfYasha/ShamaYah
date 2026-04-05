import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/middleware';
import { canManagePages, normalizeSitePagePayload } from '@/lib/pages';
import { adminClient } from '@/sanity/lib/adminClient';
import { getPageBySlug, getPages } from '@/sanity/lib/pages';

interface ExistingPageReference {
  _id: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    const includeUnpublished = searchParams.get('includeUnpublished') === 'true';
    const user = await getCurrentUser();
    const allowDraftAccess = canManagePages(user?.role) && includeUnpublished;

    if (slug) {
      const page = await getPageBySlug(slug, { includeUnpublished: allowDraftAccess });
      return NextResponse.json({ page });
    }

    const pages = await getPages({ includeUnpublished: allowDraftAccess });
    return NextResponse.json({ pages, total: pages.length });
  } catch (error) {
    console.error('Error fetching pages:', error);
    return NextResponse.json({ error: 'Failed to fetch pages' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!canManagePages(user?.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = normalizeSitePagePayload(await request.json());

    if (!payload.title || !payload.slug || !payload.content) {
      return NextResponse.json(
        { error: 'Title, slug, and content are required' },
        { status: 400 }
      );
    }

    const existingPage = await adminClient.fetch<ExistingPageReference | null>(
      `*[_type == "page" && slug.current == $slug][0] { _id }`,
      { slug: payload.slug }
    );

    if (existingPage) {
      return NextResponse.json(
        { error: 'A page with this slug already exists' },
        { status: 409 }
      );
    }

    const timestamp = new Date().toISOString();
    const createdPage = await adminClient.create({
      _type: 'page',
      title: payload.title,
      slug: {
        _type: 'slug',
        current: payload.slug,
      },
      description: payload.description,
      content: payload.content,
      isPublished: payload.isPublished,
      createdAt: timestamp,
      updatedAt: timestamp,
    });

    return NextResponse.json(
      {
        page: {
          _id: createdPage._id,
          ...payload,
          createdAt: timestamp,
          updatedAt: timestamp,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating page:', error);
    return NextResponse.json({ error: 'Failed to create page' }, { status: 500 });
  }
}
