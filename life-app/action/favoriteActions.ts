'use server';

import { auth } from '@clerk/nextjs/server';
import { getUser } from '@/lib/user/getUser';
import { adminClient } from '@/sanity/lib/adminClient';

export async function deleteFavorite(favoriteId: string) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Please sign in to delete favorites' };
    }

    const userResult = await getUser();
    if ('error' in userResult) {
      return { success: false, error: 'User profile not found - please sign in again' };
    }

    // Verify the favorite belongs to the current user
    const favorite = await adminClient.fetch(`
      *[_type == "favorite" && _id == $favoriteId && user._ref == $userId][0] {
        _id,
        user->{_id},
        commentPath,
        post->{_id, _type}
      }
    `, { favoriteId, userId: userResult._id });

    if (!favorite) {
      return { success: false, error: 'Favorite not found or access denied' };
    }

    // Delete the favorite
    await adminClient.delete(favoriteId);

    return { success: true, message: 'Favorite removed successfully' };
  } catch (error: any) {
    console.error('Delete favorite error:', error);
    return { success: false, error: error.message || 'Failed to delete favorite' };
  }
}

export async function clearAllFavorites() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Please sign in to clear favorites' };
    }

    const userResult = await getUser();
    if ('error' in userResult) {
      return { success: false, error: 'User profile not found - please sign in again' };
    }

    // Get all favorites for the user
    const favorites = await adminClient.fetch(`
      *[_type == "favorite" && user._ref == $userId] {
        _id
      }
    `, { userId: userResult._id });

    if (favorites.length === 0) {
      return { success: true, message: 'No favorites to clear' };
    }

    // Delete all favorites
    const transaction = adminClient.transaction();
    favorites.forEach((favorite: any) => {
      transaction.delete(favorite._id);
    });
    await transaction.commit();

    return { success: true, message: `Cleared ${favorites.length} favorites` };
  } catch (error: any) {
    console.error('Clear all favorites error:', error);
    return { success: false, error: error.message || 'Failed to clear favorites' };
  }
} 