import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { canBypassMaintenanceMode } from '@/lib/admin-settings';
import { isReservedSystemPageSlug, type SitePageRedirectType, normalizePageSlug } from '@/lib/pages';
import { client } from '@/sanity/lib/client';

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/admin(.*)',
  '/api/admin(.*)',
  '/api/blogs(.*)',
  '/api/communities(.*)',
  '/api/reports(.*)',
  '/api/search(.*)',
  '/api/user(.*)',
  '/api/webhooks(.*)',
]);

// Public API routes for guest functionality
const isPublicApiRoute = createRouteMatcher([
  '/api/user/guest(.*)',
  '/api/comments/guest(.*)',
  '/api/communities/guest(.*)',
  '/api/moderation(.*)',
]);

const isMaintenanceBypassRoute = createRouteMatcher([
  '/maintenance(.*)',
  '/sign-in(.*)',
  '/sign-up(.*)',
]);

interface ManagedPageRedirectLookup {
  redirectTo?: string;
  redirectType?: SitePageRedirectType;
}

interface MaintenanceModeLookup {
  maintenanceMode?: boolean;
}

interface AuthenticatedUserRoleLookup {
  role?: string;
}

const managedPageRedirectLookupQuery = `*[_type == "page" && slug.current == $slug && isPublished == true && coalesce(routeBehavior, "render") == "redirect" && defined(redirectTo)][0] {
  redirectTo,
  "redirectType": coalesce(redirectType, "temporary")
}`;

const maintenanceModeLookupQuery = `*[_type == "adminSettings"][0] {
  maintenanceMode
}`;

const authenticatedUserRoleLookupQuery = `*[_type in ["user", "teacher"] && id == $id][0] {
  role
}`;

function isPageRequest(req: NextRequest) {
  if (!['GET', 'HEAD'].includes(req.method)) {
    return false;
  }

  const { pathname } = req.nextUrl;

  return Boolean(pathname && !pathname.startsWith('/api') && !pathname.startsWith('/trpc') && !pathname.startsWith('/_next'));
}

function isTopLevelPageRequest(req: NextRequest) {
  if (!['GET', 'HEAD'].includes(req.method)) {
    return false;
  }

  const { pathname } = req.nextUrl;

  if (!pathname || pathname === '/' || pathname.startsWith('/api') || pathname.startsWith('/trpc') || pathname.startsWith('/_next')) {
    return false;
  }

  return pathname.split('/').filter(Boolean).length === 1;
}

async function getManagedPageRedirectResponse(req: NextRequest) {
  if (!isTopLevelPageRequest(req)) {
    return null;
  }

  const slug = normalizePageSlug(req.nextUrl.pathname);

  if (!slug || isReservedSystemPageSlug(slug)) {
    return null;
  }

  try {
    const redirectRule = await client.fetch<ManagedPageRedirectLookup | null>(
      managedPageRedirectLookupQuery,
      { slug }
    );

    if (!redirectRule?.redirectTo) {
      return null;
    }

    const destination = new URL(redirectRule.redirectTo, req.url);

    if (destination.origin === req.nextUrl.origin && destination.pathname === req.nextUrl.pathname) {
      return null;
    }

    return NextResponse.redirect(
      destination,
      redirectRule.redirectType === 'permanent' ? 308 : 307
    );
  } catch (error) {
    console.error('Failed to resolve managed page redirect:', error);
    return null;
  }
}

async function isMaintenanceModeEnabled() {
  try {
    const settings = await client.fetch<MaintenanceModeLookup | null>(maintenanceModeLookupQuery);

    return Boolean(settings?.maintenanceMode);
  } catch (error) {
    console.error('Failed to read maintenance mode settings:', error);
    return false;
  }
}

async function getAuthenticatedUserRole(userId: string) {
  try {
    const userRecord = await client.fetch<AuthenticatedUserRoleLookup | null>(
      authenticatedUserRoleLookupQuery,
      { id: userId }
    );

    return userRecord?.role || null;
  } catch (error) {
    console.error('Failed to read authenticated user role for maintenance mode:', error);
    return null;
  }
}

async function getMaintenanceModeResponse(userId: string | null | undefined, req: NextRequest) {
  if (!isPageRequest(req) || isMaintenanceBypassRoute(req)) {
    return null;
  }

  const maintenanceModeEnabled = await isMaintenanceModeEnabled();

  if (!maintenanceModeEnabled) {
    return null;
  }

  if (userId) {
    const role = await getAuthenticatedUserRole(userId);

    if (canBypassMaintenanceMode(role)) {
      return null;
    }
  }

  const maintenanceUrl = new URL('/maintenance', req.url);
  const currentPath = `${req.nextUrl.pathname}${req.nextUrl.search}`;

  if (currentPath && currentPath !== '/maintenance') {
    maintenanceUrl.searchParams.set('from', currentPath);
  }

  return NextResponse.redirect(maintenanceUrl);
}

const middleware = clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();

  if (isProtectedRoute(req) && !userId) {
    if (isPublicApiRoute(req)) {
      return;
    }

    const signInUrl = new URL('/sign-in', req.url);
    signInUrl.searchParams.set('redirect_url', req.url);
    return NextResponse.redirect(signInUrl);
  }

  const maintenanceModeResponse = await getMaintenanceModeResponse(userId, req);

  if (maintenanceModeResponse) {
    return maintenanceModeResponse;
  }

  const managedRedirectResponse = await getManagedPageRedirectResponse(req);

  if (managedRedirectResponse) {
    return managedRedirectResponse;
  }
});

export default middleware;

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};