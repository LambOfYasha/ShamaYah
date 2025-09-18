# Vercel Deployment Checklist

## Pre-Deployment Setup

### 1. Environment Variables
Set these environment variables in your Vercel project settings:

#### Sanity CMS
- `NEXT_PUBLIC_SANITY_PROJECT_ID` - Your Sanity project ID
- `NEXT_PUBLIC_SANITY_DATASET` - Your dataset name (usually "production")
- `NEXT_PUBLIC_SANITY_API_VERSION` - API version (e.g., "2025-07-05")
- `SANITY_ADMIN_API_TOKEN` - Sanity admin token for write operations

#### Clerk Authentication
- `CLERK_SECRET_KEY` - Your Clerk secret key
- `CLERK_WEBHOOK_SECRET` - Clerk webhook secret for user management

#### OpenAI
- `OPENAI_API_KEY` - Your OpenAI API key for AI moderation

#### Base URL
- `NEXT_PUBLIC_BASE_URL` - Your production URL (e.g., https://your-app.vercel.app)

### 2. Sanity Studio Configuration
Ensure your Sanity Studio is properly configured:
- Verify `sanity.config.ts` has correct `basePath: '/studio'`
- Check that all schema types are properly exported
- Ensure Sanity project is set up and accessible

### 3. Clerk Configuration
- Set up Clerk webhook endpoint at `/api/webhooks/clerk`
- Configure allowed origins in Clerk dashboard
- Set up proper redirect URLs for authentication

### 4. Database and Content
- Ensure all content is published in Sanity Studio
- Verify all required images are uploaded to Sanity
- Test all API endpoints locally

## Deployment Steps

### 1. Connect to Vercel
```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Login to Vercel
vercel login

# Deploy to Vercel
vercel --prod
```

### 2. Environment Variables Setup
1. Go to your Vercel project dashboard
2. Navigate to Settings > Environment Variables
3. Add all required environment variables listed above
4. Ensure all variables are set for Production, Preview, and Development environments

### 3. Domain Configuration
1. Set up custom domain if needed
2. Configure DNS settings
3. Update `NEXT_PUBLIC_BASE_URL` with your final domain

### 4. Post-Deployment Verification

#### Test Authentication
- [ ] Sign up flow works
- [ ] Sign in flow works
- [ ] Protected routes redirect properly
- [ ] User roles work correctly

#### Test Content Management
- [ ] Blog creation works
- [ ] Community questions work
- [ ] Image uploads work
- [ ] Comments system works

#### Test AI Features
- [ ] Content moderation works
- [ ] AI responses are generated
- [ ] Moderation feedback is displayed

#### Test Admin Features
- [ ] Admin dashboard is accessible
- [ ] User management works
- [ ] Content moderation tools work
- [ ] Analytics are displayed

### 5. Performance Optimization
- [ ] Images are optimized
- [ ] Static pages are generated where possible
- [ ] API routes respond within time limits
- [ ] Bundle size is reasonable

### 6. Security Checks
- [ ] Environment variables are not exposed
- [ ] API routes are properly protected
- [ ] CORS is configured correctly
- [ ] Rate limiting is in place

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check TypeScript errors
   - Verify all imports are correct
   - Ensure all dependencies are installed

2. **Environment Variable Issues**
   - Verify all required variables are set in Vercel
   - Check variable names match exactly
   - Ensure no typos in variable names

3. **Authentication Issues**
   - Verify Clerk configuration
   - Check webhook endpoints
   - Ensure redirect URLs are correct

4. **Content Loading Issues**
   - Verify Sanity project ID and dataset
   - Check API token permissions
   - Ensure content is published

### Monitoring
- Set up Vercel Analytics
- Monitor error logs
- Track performance metrics
- Set up alerts for critical issues

## Rollback Plan
1. Keep previous deployment as backup
2. Test new deployment thoroughly before switching
3. Have rollback procedure documented
4. Monitor closely after deployment

## Maintenance
- Regular dependency updates
- Security patches
- Performance monitoring
- Content backup procedures 