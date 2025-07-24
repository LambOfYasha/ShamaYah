# Guest Role Implementation

## Overview

This implementation adds a 'guest' role to the system that allows unauthenticated users to view posts and make comments without requiring authentication. Guest users have limited permissions compared to registered users.

## Features Implemented

### 1. Guest Role System
- Added 'guest' role to the UserRole type
- Updated role hierarchy (guest: 0, member: 1, etc.)
- Added guest permissions (canComment: true, canCreatePosts: false, etc.)
- Updated Sanity schema to include guest role option

### 2. Guest User Creation
- Created `createGuestUser()` function in `lib/user/addUser.ts`
- Added `/api/user/guest` endpoint for creating guest users
- Guest users get a unique ID and temporary email
- Guest users are stored in the database with role 'guest'

### 3. Guest Comment System
- Created `GuestCommentForm` component for unauthenticated users
- Added `/api/comments/guest` endpoint for guest comments
- Updated `addEmbeddedComment()` to handle guest users
- Guest comments are associated with temporary guest user accounts

### 4. Public Access Updates
- Updated blog and community question pages to allow guest access
- Modified middleware to allow guest API routes
- Search functionality remains public
- Guest users can view all posts without authentication

### 5. UI Components
- `GuestCommentForm`: Form for guest users to provide name and comment
- Updated `EmbeddedCommentSectionWrapper` to show guest form for unauthenticated users
- Guest users see "Comment as Guest" button instead of regular comment form

## Guest User Permissions

### Allowed Actions:
- ✅ View all blog posts
- ✅ View all community questions
- ✅ Search content
- ✅ Make comments (with name)
- ✅ Create community responses (with name)
- ✅ Create community questions (with name) ✨ NEW
- ✅ View existing comments
- ✅ Report content

### Restricted Actions:
- ❌ Create blog posts
- ❌ Create community questions
- ❌ Edit content
- ❌ Delete content
- ❌ Favorite posts/responses
- ❌ Access dashboard
- ❌ Access admin panel
- ❌ Moderate content
- ❌ Manage users

## Technical Implementation

### Database Changes
1. **User Schema**: Added 'guest' role option
2. **Guest Users**: Stored with temporary IDs and emails
3. **Comments**: Can be authored by guest users

### API Routes
1. **POST /api/user/guest**: Creates guest user accounts
2. **POST /api/comments/guest**: Creates comments for guest users
3. **POST /api/posts/guest**: Creates community responses for guest users
4. **POST /api/communities/guest**: Creates community questions for guest users
5. **GET /api/search**: Public search (no changes needed)

### Authentication Flow
1. Unauthenticated user visits a post, community question, or the sidebar
2. User sees "Comment as Guest", "Add Response as Guest", or "Create Community as Guest" button
3. User provides name and content (comment, response, or community question)
4. System creates temporary guest user
5. Content is posted with guest user as author

### Middleware Updates
- Added public API routes for guest functionality
- Protected routes still require authentication
- Guest routes bypass authentication checks

## Usage Examples

### For Guest Users:
1. Visit any blog post, community question, or use the sidebar
2. Click "Comment as Guest", "Add Response as Guest", or "Create Community as Guest"
3. Enter your name and content
4. Submit to post comment, response, or community question

### For Developers:
```typescript
// Create a guest user
const guestUser = await createGuestUser("John Doe");

// Add comment as guest
const result = await addEmbeddedComment(
  postId, 
  postType, 
  content, 
  undefined, 
  guestUser
);
```

## Security Considerations

1. **Rate Limiting**: Consider implementing rate limiting for guest comments
2. **Content Moderation**: Guest comments should go through the same moderation as regular comments
3. **Spam Prevention**: Monitor for spam from guest users
4. **Data Retention**: Consider how long to keep guest user data

## Future Enhancements

1. **Guest User Management**: Admin panel to view/manage guest users
2. **Guest to Member Conversion**: Allow guests to convert to full accounts
3. **Enhanced Moderation**: Special moderation rules for guest comments
4. **Analytics**: Track guest user engagement
5. **Temporary Sessions**: Allow guests to maintain session across page visits

## Testing

Visit `/test-guest` to test the guest functionality:
- View posts without authentication
- Make comments as a guest
- Test search functionality
- Verify proper permissions

## Files Modified

### Core System Files:
- `lib/auth/roles.ts` - Added guest role and permissions
- `lib/user/addUser.ts` - Added guest user creation
- `action/embeddedComments.ts` - Updated to handle guest users
- `action/embeddedCommentActions.ts` - Updated action functions

### API Routes:
- `app/api/user/guest/route.ts` - Guest user creation
- `app/api/comments/guest/route.ts` - Guest comment creation
- `app/api/posts/guest/route.ts` - Guest post creation
- `app/api/communities/guest/route.ts` - Guest community creation

### Components:
- `components/comments/GuestCommentForm.tsx` - Guest comment form
- `components/community/GuestAddResponseForm.tsx` - Guest post creation form
- `components/community/GuestCreateCommunityButton.tsx` - Guest community creation form
- `components/comments/EmbeddedCommentSectionWrapper.tsx` - Updated for guest support
- `components/community/CommunityResponses.tsx` - Updated for guest support
- `components/app-sidebar.tsx` - Updated for guest community creation

### Pages:
- `app/(app)/blogs/[slug]/page.tsx` - Allow guest access
- `app/(app)/community-questions/[slug]/page.tsx` - Allow guest access
- `app/(app)/test-guest/page.tsx` - Test page

### Schema Files:
- `sanity/schemaTypes/userType.tsx` - Added guest role option
- `sanity.types.ts` - Updated User interface
- `schema.json` - Updated schema definition

### Configuration:
- `middleware.ts` - Updated to allow guest routes
- `sanity.config.ts` - No changes needed

## Conclusion

The guest role implementation provides a seamless experience for unauthenticated users while maintaining security and proper access controls. Guest users can participate in discussions without the friction of account creation, while registered users retain full access to all features. 