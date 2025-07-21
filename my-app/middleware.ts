import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

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

const middleware = clerkMiddleware({
  beforeAuth: (req) => {
    // Allow public routes to pass through
    if (!isProtectedRoute(req)) {
      return;
    }
  },
  afterAuth: (auth, req) => {
    // Handle protected routes
    if (isProtectedRoute(req) && !auth.userId) {
      const signInUrl = new URL('/sign-in', req.url);
      signInUrl.searchParams.set('redirect_url', req.url);
      return Response.redirect(signInUrl);
    }
  },
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