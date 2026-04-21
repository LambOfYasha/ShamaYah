'use client';

import { useEffect, useState } from 'react';
import { SitePage, normalizePageSlug } from '@/lib/pages';

export function useManagedPage(slug: string) {
  const [page, setPage] = useState<SitePage | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isActive = true;
    const normalizedSlug = normalizePageSlug(slug);

    async function loadPage() {
      if (!normalizedSlug) {
        if (isActive) {
          setPage(null);
          setIsLoading(false);
        }
        return;
      }

      try {
        const response = await fetch(`/api/pages?slug=${encodeURIComponent(normalizedSlug)}`, {
          cache: 'no-store',
        });

        if (!response.ok) {
          if (isActive) {
            setPage(null);
          }
          return;
        }

        const data = await response.json();

        if (isActive) {
          setPage(data.page ?? null);
        }
      } catch (error) {
        console.error(`Failed to fetch managed page for slug "${normalizedSlug}":`, error);
        if (isActive) {
          setPage(null);
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    setIsLoading(true);
    loadPage();

    return () => {
      isActive = false;
    };
  }, [slug]);

  return { page, isLoading };
}
