import { defineQuery } from 'groq';
import { SitePage, normalizePageSlug } from '@/lib/pages';
import { client } from './client';
import { adminClient } from './adminClient';

const pageProjection = `{
  _id,
  title,
  "slug": slug.current,
  description,
  content,
  isPublished,
  "routeBehavior": coalesce(routeBehavior, "render"),
  redirectTo,
  "redirectType": coalesce(redirectType, "temporary"),
  createdAt,
  updatedAt,
  _createdAt,
  _updatedAt
}`;

const publicPagesQuery = defineQuery(`
  *[_type == "page" && isPublished == true] | order(title asc) ${pageProjection}
`);

const adminPagesQuery = defineQuery(`
  *[_type == "page"] | order(title asc) ${pageProjection}
`);

const publicPageBySlugQuery = defineQuery(`
  *[_type == "page" && slug.current == $slug && isPublished == true][0] ${pageProjection}
`);

const adminPageBySlugQuery = defineQuery(`
  *[_type == "page" && slug.current == $slug][0] ${pageProjection}
`);

export async function getPages(options?: { includeUnpublished?: boolean }): Promise<SitePage[]> {
  if (options?.includeUnpublished) {
    return adminClient.fetch<SitePage[]>(adminPagesQuery);
  }

  return client.fetch<SitePage[]>(publicPagesQuery);
}

export async function getPageBySlug(
  slug: string,
  options?: { includeUnpublished?: boolean }
): Promise<SitePage | null> {
  const normalizedSlug = normalizePageSlug(slug);

  if (!normalizedSlug) {
    return null;
  }

  if (options?.includeUnpublished) {
    return adminClient.fetch<SitePage | null>(adminPageBySlugQuery, { slug: normalizedSlug });
  }

  return client.fetch<SitePage | null>(publicPageBySlugQuery, { slug: normalizedSlug });
}
