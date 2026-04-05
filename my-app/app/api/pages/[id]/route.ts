import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/middleware';
import { canManagePages, normalizeSitePagePayload } from '@/lib/pages';
import { adminClient } from '@/sanity/lib/adminClient';

interface ExistingPageReference {
  _id: string;
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
      `*[_type == "page" && slug.current == $slug && _id != $id][0] { _id }`,
      { slug: payload.slug, id }
    );

    if (existingPage) {
      return NextResponse.json(
        { error: 'A page with this slug already exists' },
        { status: 409 }
      );
    }

    const updatedAt = new Date().toISOString();
    await adminClient
      .patch(id)
      .set({
        title: payload.title,
        slug: {
          _type: 'slug',
          current: payload.slug,
        },
        description: payload.description,
        content: payload.content,
        isPublished: payload.isPublished,
        updatedAt,
      })
      .commit();

    return NextResponse.json({
      page: {
        _id: id,
        ...payload,
        updatedAt,
      },
    });
  } catch (error) {
    console.error('Error updating page:', error);
    return NextResponse.json({ error: 'Failed to update page' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();

    if (!canManagePages(user?.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await adminClient.delete(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting page:', error);
    return NextResponse.json({ error: 'Failed to delete page' }, { status: 500 });
  }
}
