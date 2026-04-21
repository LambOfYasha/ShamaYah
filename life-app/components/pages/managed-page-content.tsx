'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import RichContentRenderer from '@/components/ui/rich-content-renderer';
import { getPagePath, SitePage } from '@/lib/pages';

interface ManagedPageContentProps {
  page: SitePage;
  backHref?: string;
  backLabel?: string;
}

function formatPageDate(value?: string) {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

export default function ManagedPageContent({
  page,
  backHref = '/',
  backLabel = 'Back to Home',
}: ManagedPageContentProps) {
  const pagePath = getPagePath(page.slug);
  const updatedLabel = formatPageDate(page.updatedAt ?? page._updatedAt);

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
          <div>
            <Button asChild variant="ghost" className="px-0">
              <Link href={backHref}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                {backLabel}
              </Link>
            </Button>
          </div>

          <div className="text-center">
            <Image
              src="/assets/logo_light.png"
              alt="Light Is For Everyone Logo"
              width={150}
              height={60}
              className="mx-auto mb-4 h-12 w-auto dark:hidden sm:h-16"
            />
            <Image
              src="/assets/logo_dark.png"
              alt="Light Is For Everyone Logo Dark"
              width={150}
              height={60}
              className="mx-auto mb-4 hidden h-12 w-auto dark:inline-block sm:h-16"
            />

            <div className="mb-4 flex flex-wrap items-center justify-center gap-2">
              <Badge variant="outline" className="gap-1">
                <FileText className="h-3 w-3" />
                {pagePath}
              </Badge>
              {updatedLabel ? <Badge variant="secondary">Updated {updatedLabel}</Badge> : null}
            </div>

            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{page.title}</h1>
            {page.description ? (
              <p className="mx-auto mt-3 max-w-3xl text-base text-muted-foreground sm:text-lg">
                {page.description}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      <section className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl rounded-2xl border bg-card p-6 shadow-sm sm:p-8">
          <RichContentRenderer
            content={page.content || ''}
            className="prose-headings:scroll-mt-24 prose-img:mx-auto"
            stripThemeConflictingInlineStyles
          />
        </div>
      </section>
    </div>
  );
}
