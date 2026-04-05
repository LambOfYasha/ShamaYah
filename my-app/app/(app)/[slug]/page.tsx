import type { Metadata } from 'next';
import { notFound, permanentRedirect, redirect } from 'next/navigation';
import ManagedPageContent from '@/components/pages/managed-page-content';
import { getPageBySlug } from '@/sanity/lib/pages';

export const dynamic = 'force-dynamic';

interface ManagedPageRouteProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: ManagedPageRouteProps): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPageBySlug(slug);

  if (!page) {
    return {
      title: 'Page Not Found',
    };
  }

  return {
    title: page.title,
    description: page.description || undefined,
  };
}

export default async function ManagedPageRoute({ params }: ManagedPageRouteProps) {
  const { slug } = await params;
  const page = await getPageBySlug(slug);

  if (!page) {
    notFound();
  }

  if (page.routeBehavior === 'redirect' && page.redirectTo) {
    if (page.redirectType === 'permanent') {
      permanentRedirect(page.redirectTo);
    }

    redirect(page.redirectTo);
  }

  return <ManagedPageContent page={page} />;
}
