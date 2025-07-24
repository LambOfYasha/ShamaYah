# Guest Role Implementation

## Overview
This document outlines the implementation of a guest role that allows unauthenticated users to view content and interact with the platform without requiring authentication.

## Guest Role Features

### ✅ **What Guests Can Do:**
- **View Posts**: Browse blogs and community questions
- **Make Comments**: Add comments to posts using a guest name
- **Create Community Questions**: Ask questions in community sections
- **Search Content**: Use the search functionality
- **Report Content**: Report inappropriate content
- **View Tags**: Browse and filter by tags

### ❌ **What Guests Cannot Do:**
- **Create Community Responses**: Cannot add responses to community questions (reserved for teachers only)
- **Favorites**: Cannot save/favorite posts or comments (buttons are hidden)
- **Edit Content**: Cannot edit their own or others' content
- **Delete Content**: Cannot delete any content
- **Access Dashboard**: Cannot access user dashboard features
- **Access Admin Panel**: Cannot access administrative functions
- **Manage Users**: Cannot manage other users
- **Moderate Content**: Cannot moderate or approve content

## Technical Implementation

### 1. **Role System**
- **File**: `lib/auth/roles.ts`
- **Guest Role**: Added `'guest'` to `UserRole` type and `ROLES` constant
- **Permissions**: Defined `ROLE_PERMISSIONS.GUEST` with appropriate capabilities
- **Hierarchy**: Guest has lowest priority (0) in `ROLE_HIERARCHY`

### 2. **Database Schema**
- **File**: `sanity/schemaTypes/userType.tsx`
- **Update**: Added `'guest'` as valid role option in user schema
- **File**: `sanity.types.ts`
- **Update**: Added `'guest'` to User interface role union type

### 3. **Guest User Creation**
- **File**: `lib/user/addUser.ts`
- **Function**: `createGuestUser(guestName: string)` creates temporary user accounts
- **Features**: Generates unique guest IDs, stores in Sanity database

### 4. **API Endpoints for Guests**
- **File**: `app/api/user/guest/route.ts` - Create guest users
- **File**: `app/api/comments/guest/route.ts` - Guest comment submission
- **File**: `app/api/communities/guest/route.ts` - Guest community question creation

### 5. **Server Actions**
- **File**: `action/embeddedComments.ts` - Updated to accept `guestUser` parameter
- **File**: `action/embeddedCommentActions.ts` - Updated to pass guest user data
- **File**: `action/postActions.ts` - Updated to remove guest user support for responses

### 6. **UI Components**
- **File**: `components/comments/GuestCommentForm.tsx` - Guest comment form
- **File**: `components/community/GuestCreateCommunityButton.tsx` - Guest community creation
- **File**: `components/comments/EmbeddedCommentSectionWrapper.tsx` - Shows guest forms for unauthenticated users

### 7. **Authentication & Middleware**
- **File**: `middleware.ts` - Allows public access to guest API routes
- **File**: `lib/auth/middleware.ts` - Updated `getCurrentUser()` to handle unauthenticated users gracefully
- **Public Routes**: Guest-specific API endpoints bypass authentication

### 8. **Page Access**
- **File**: `app/(app)/blogs/[slug]/page.tsx` - Allows guest access to blog posts
- **File**: `app/(app)/community-questions/[slug]/page.tsx` - Allows guest access to community questions
- **Error Handling**: Graceful handling of unauthenticated users without redirects

### 9. **Sidebar Integration**
- **File**: `components/app-sidebar.tsx` - Shows guest community creation button for unauthenticated users
- **Conditional Rendering**: Different UI elements based on authentication status

### 10. **Favorite Button Handling**
- **Approach**: Hide favorite buttons completely for guests instead of handling errors
- **Updated Files**:
  - `app/(app)/blogs/[slug]/page.tsx` - Wrapped FavoriteButton with `{user && (...)}`
  - `app/(app)/community-questions/[slug]/page.tsx` - Wrapped FavoriteButton with `{user && (...)}`
  - `app/(app)/responses/[slug]/page.tsx` - Wrapped FavoriteButton with `{user && (...)}`
  - `components/community/CommunityResponses.tsx` - Wrapped FavoriteButton with `{isSignedIn && (...)}`
  - `components/comments/NestedComment.tsx` - Wrapped favorite button with `{user && (...)}`
- **Benefits**: Cleaner UX, no authentication errors, proper separation of concerns

## Usage Examples

### Guest Commenting
```typescript
// Guest fills out form with name
const guestName = "Anonymous Guest";
const comment = "Great post!";

// System creates guest user and comment
const guestUser = await createGuestUser(guestName);
await addEmbeddedComment(postId, postType, comment, undefined, guestUser);
```

### Guest Community Creation
```typescript
// Guest creates community question
const guestName = "Curious Guest";
const question = "How do I implement...";

// System creates guest user and community question
const guestUser = await createGuestUser(guestName);
await createCommunityQuestion(title, description, content, guestUser);
```

## Security Considerations

1. **Guest User Persistence**: Guest users are stored in database but marked with `role: 'guest'`
2. **Content Attribution**: All guest content is properly attributed to guest users
3. **Rate Limiting**: Consider implementing rate limiting for guest actions
4. **Moderation**: Guest content goes through same moderation as authenticated users
5. **No Privilege Escalation**: Guests cannot access authenticated-only features

## Testing

### Test Page
- **File**: `app/(app)/test-guest/page.tsx`
- **Features**: Comprehensive testing of all guest capabilities
- **Sections**: Viewing, commenting, searching, creating posts, limitations

### Manual Testing Checklist
- [ ] Guest can view blog posts
- [ ] Guest can view community questions
- [ ] Guest can add comments with name
- [ ] Guest can create community questions
- [ ] Guest cannot create community responses (shows sign-in prompt)
- [ ] Members cannot create community responses (shows permission error)
- [ ] Teachers can create community responses
- [ ] Guest can search content
- [ ] Guest cannot see favorite buttons
- [ ] Guest cannot access dashboard
- [ ] Guest can report content
- [ ] No authentication errors in console

## Future Enhancements

1. **Guest Session Management**: Track guest sessions for better UX
2. **Guest Content Cleanup**: Periodic cleanup of old guest content
3. **Guest Analytics**: Track guest engagement metrics
4. **Guest Conversion**: Encourage guest users to sign up
5. **Advanced Moderation**: Enhanced moderation for guest content 