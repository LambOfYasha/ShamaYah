'use client';

import { type FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ExternalLink, FileText, Loader2, Pencil, Plus, Trash2 } from 'lucide-react';
import ClientRichEditor from '@/components/ui/client-rich-editor';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
  MANAGED_STATIC_PAGE_SLUGS,
  SitePage,
  SitePagePayload,
  getPagePath,
  normalizePageSlug,
  normalizeSitePagePayload,
} from '@/lib/pages';

const emptyFormState: SitePagePayload = {
  title: '',
  slug: '',
  description: '',
  content: '',
  isPublished: true,
};

function formatTimestamp(value?: string) {
  if (!value) {
    return 'Unknown';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Unknown';
  }

  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function stripHtmlPreview(value: string) {
  return value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

export default function PageManagement() {
  const [pages, setPages] = useState<SitePage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<SitePage | null>(null);
  const [formState, setFormState] = useState<SitePagePayload>(emptyFormState);
  const [slugTouched, setSlugTouched] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { toast } = useToast();

  const fetchPages = useCallback(async () => {
    try {
      const response = await fetch('/api/pages?includeUnpublished=true', {
        cache: 'no-store',
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch pages');
      }

      setPages(Array.isArray(data.pages) ? data.pages : []);
    } catch (error) {
      console.error('Failed to fetch pages:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to fetch pages',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchPages();
  }, [fetchPages]);

  const routePreview = useMemo(() => {
    const normalizedSlug = normalizePageSlug(formState.slug || formState.title);
    return normalizedSlug ? getPagePath(normalizedSlug) : '/your-page-slug';
  }, [formState.slug, formState.title]);

  function resetForm() {
    setEditingPage(null);
    setFormState(emptyFormState);
    setSlugTouched(false);
  }

  function openCreateDialog() {
    resetForm();
    setDialogOpen(true);
  }

  function openEditDialog(page: SitePage) {
    setEditingPage(page);
    setFormState({
      title: page.title,
      slug: page.slug,
      description: page.description || '',
      content: page.content || '',
      isPublished: page.isPublished,
    });
    setSlugTouched(true);
    setDialogOpen(true);
  }

  function handleTitleChange(value: string) {
    setFormState((current) => ({
      ...current,
      title: value,
      slug: slugTouched ? current.slug : normalizePageSlug(value),
    }));
  }

  function handleSlugChange(value: string) {
    setSlugTouched(true);
    setFormState((current) => ({
      ...current,
      slug: normalizePageSlug(value),
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const payload = normalizeSitePagePayload(formState);

    if (!payload.title) {
      toast({
        title: 'Error',
        description: 'Page title is required',
        variant: 'destructive',
      });
      return;
    }

    if (!payload.slug) {
      toast({
        title: 'Error',
        description: 'Page slug is required',
        variant: 'destructive',
      });
      return;
    }

    if (!payload.content) {
      toast({
        title: 'Error',
        description: 'Page content is required',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(editingPage ? `/api/pages/${editingPage._id}` : '/api/pages', {
        method: editingPage ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save page');
      }

      toast({
        title: 'Success',
        description: editingPage ? 'Page updated successfully' : 'Page created successfully',
      });

      setDialogOpen(false);
      resetForm();
      await fetchPages();
    } catch (error) {
      console.error('Failed to save page:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save page',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(page: SitePage) {
    if (!confirm(`Delete the page "${page.title}"? This cannot be undone.`)) {
      return;
    }

    setDeletingId(page._id);

    try {
      const response = await fetch(`/api/pages/${page._id}`, {
        method: 'DELETE',
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete page');
      }

      toast({
        title: 'Success',
        description: 'Page deleted successfully',
      });

      await fetchPages();
    } catch (error) {
      console.error('Failed to delete page:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete page',
        variant: 'destructive',
      });
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <CardTitle>Page management</CardTitle>
            </div>
            <CardDescription>
              Create, publish, edit, and remove Sanity-backed web pages. Use a matching slug to override
              the existing informational routes, or create a brand-new route that renders automatically.
            </CardDescription>
          </div>

          <Button onClick={openCreateDialog} className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            New page
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {MANAGED_STATIC_PAGE_SLUGS.map((slug) => (
              <Badge key={slug} variant="outline">
                /{slug}
              </Badge>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            Matching one of the routes above will replace that page with the Sanity-managed version after the
            app loads. Any new single-segment slug will render through the new dynamic page route.
          </p>
        </CardContent>
      </Card>

      <Separator />

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index}>
              <CardHeader>
                <Skeleton className="h-5 w-1/2" />
                <Skeleton className="h-4 w-3/4" />
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-9 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : pages.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />
            <h3 className="text-lg font-semibold">No managed pages yet</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Create your first page to manage an existing route like `/about` or launch a brand-new page.
            </p>
            <Button onClick={openCreateDialog} className="mt-4">
              <Plus className="mr-2 h-4 w-4" />
              Create first page
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {pages.map((page) => {
            const excerpt = stripHtmlPreview(page.content || '').slice(0, 180);
            const updatedAt = page.updatedAt || page._updatedAt || page.createdAt || page._createdAt;

            return (
              <Card key={page._id} className="flex h-full flex-col">
                <CardHeader className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <CardTitle className="text-xl">{page.title}</CardTitle>
                    <Badge variant={page.isPublished ? 'default' : 'secondary'}>
                      {page.isPublished ? 'Published' : 'Draft'}
                    </Badge>
                  </div>
                  <CardDescription className="break-all">{getPagePath(page.slug)}</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col gap-4">
                  <p className="text-sm text-muted-foreground">
                    {page.description || excerpt || 'No summary available for this page yet.'}
                  </p>

                  <div className="space-y-1 text-xs text-muted-foreground">
                    <p>
                      <span className="font-medium text-foreground">Updated:</span> {formatTimestamp(updatedAt)}
                    </p>
                    <p>
                      <span className="font-medium text-foreground">Created:</span>{' '}
                      {formatTimestamp(page.createdAt || page._createdAt)}
                    </p>
                  </div>

                  <div className="mt-auto flex flex-wrap gap-2 pt-2">
                    {page.isPublished ? (
                      <Button asChild variant="outline" size="sm">
                        <Link href={getPagePath(page.slug)} target="_blank">
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Open page
                        </Link>
                      </Button>
                    ) : null}

                    <Button variant="outline" size="sm" onClick={() => openEditDialog(page)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </Button>

                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(page)}
                      disabled={deletingId === page._id}
                    >
                      {deletingId === page._id ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="mr-2 h-4 w-4" />
                      )}
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          if (!open && !isSubmitting) {
            resetForm();
          }
          setDialogOpen(open);
        }}
      >
        <DialogContent className="sm:max-w-5xl">
          <DialogHeader>
            <DialogTitle>{editingPage ? 'Edit page' : 'Create page'}</DialogTitle>
            <DialogDescription>
              Manage the route slug, publication status, and rich content stored in Sanity.
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[72vh] pr-4">
            <form id="page-management-form" onSubmit={handleSubmit} className="space-y-6 pb-1">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="page-title">Title</Label>
                  <Input
                    id="page-title"
                    value={formState.title}
                    onChange={(event) => handleTitleChange(event.target.value)}
                    placeholder="About Shama Yah"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="page-slug">Slug</Label>
                  <Input
                    id="page-slug"
                    value={formState.slug}
                    onChange={(event) => handleSlugChange(event.target.value)}
                    placeholder="about"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-start">
                <div className="space-y-2">
                  <Label htmlFor="page-description">Description</Label>
                  <Textarea
                    id="page-description"
                    value={formState.description}
                    onChange={(event) =>
                      setFormState((current) => ({ ...current, description: event.target.value }))
                    }
                    placeholder="Optional short summary shown beneath the title"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-3 rounded-lg border p-4 md:min-w-[180px]">
                  <div className="space-y-1">
                    <Label htmlFor="page-published">Published</Label>
                    <p className="text-xs text-muted-foreground">
                      Draft pages stay available in admin but hidden from public routes.
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Switch
                      id="page-published"
                      checked={formState.isPublished}
                      onCheckedChange={(checked) =>
                        setFormState((current) => ({ ...current, isPublished: checked }))
                      }
                      disabled={isSubmitting}
                    />
                    <span className="text-sm font-medium">
                      {formState.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border bg-muted/30 p-4">
                <p className="text-sm font-medium">Route preview</p>
                <p className="mt-1 break-all text-sm text-muted-foreground">{routePreview}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Use `/about`, `/contact`, `/faq`, `/guidelines`, `/privacy`, or `/terms` to override the
                  current informational pages. Any new top-level slug will render automatically.
                </p>
              </div>

              <div className="space-y-2">
                <Label>Content</Label>
                <ClientRichEditor
                  content={formState.content}
                  onChange={(content) => setFormState((current) => ({ ...current, content }))}
                  placeholder="Write the page content here..."
                  maxHeight="500px"
                />
              </div>
            </form>
          </ScrollArea>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setDialogOpen(false);
                resetForm();
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" form="page-management-form" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {editingPage ? 'Save changes' : 'Create page'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
