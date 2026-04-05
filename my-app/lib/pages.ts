export interface SitePage {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  content: string;
  isPublished: boolean;
  createdAt?: string;
  updatedAt?: string;
  _createdAt?: string;
  _updatedAt?: string;
}

export interface SitePagePayload {
  title: string;
  slug: string;
  description: string;
  content: string;
  isPublished: boolean;
}

export const MANAGED_STATIC_PAGE_SLUGS = ['about', 'contact', 'faq', 'guidelines', 'privacy', 'terms'] as const;

export function normalizePageSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/^\/+|\/+$/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function normalizeSitePagePayload(input: Partial<SitePagePayload>): SitePagePayload {
  const title = typeof input.title === 'string' ? input.title.trim() : '';
  const description = typeof input.description === 'string' ? input.description.trim() : '';
  const content = typeof input.content === 'string' ? input.content.trim() : '';
  const slugSource = typeof input.slug === 'string' && input.slug.trim() ? input.slug : title;

  return {
    title,
    slug: normalizePageSlug(slugSource),
    description,
    content,
    isPublished: typeof input.isPublished === 'boolean' ? input.isPublished : true,
  };
}

export function canManagePages(role?: string | null): boolean {
  return role === 'admin' || role === 'dev';
}

export function getPagePath(slug: string): string {
  return `/${normalizePageSlug(slug)}`;
}
