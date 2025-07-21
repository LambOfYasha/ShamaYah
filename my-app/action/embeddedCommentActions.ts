'use server';

import { addEmbeddedComment, editEmbeddedComment, deleteEmbeddedComment, addFavorite, removeFavorite, checkFavorite, addPostFavorite, removePostFavorite, checkPostFavorite, getUserFavorites, cleanupFavoritesForDeletedPost, cleanupFavoritesForDeletedComment, updateCommentPathFavorites, deleteIndividualFavorite, clearAllFavorites } from './embeddedComments';

// Comment action functions
export async function addCommentAction(postId: string, postType: 'blog' | 'community', content: string, parentCommentId?: string) {
    const result = await addEmbeddedComment(postId, postType, content, parentCommentId);
    if ("error" in result) {
        throw new Error(result.error);
    }
    return result;
}

export async function editCommentAction(postId: string, postType: 'blog' | 'community', commentPath: string, content: string) {
    const result = await editEmbeddedComment(postId, postType, commentPath, content);
    if ("error" in result) {
        throw new Error(result.error);
    }
    return result;
}

export async function deleteCommentAction(postId: string, postType: 'blog' | 'community', commentPath: string) {
    const result = await deleteEmbeddedComment(postId, postType, commentPath);
    if ("error" in result) {
        throw new Error(result.error);
    }
    return result;
}

// Comment-level favorite functions
export async function addCommentFavoriteAction(postId: string, postType: 'blog' | 'community', commentPath: string) {
    try {
        const result = await addFavorite(postId, postType, commentPath);
        if ("error" in result) {
            console.error(`Error adding favorite for comment path "${commentPath}":`, result.error);
            throw new Error(result.error);
        }
        return result;
    } catch (error) {
        console.error(`Failed to add favorite for comment path "${commentPath}":`, error);
        throw error;
    }
}

export async function removeCommentFavoriteAction(postId: string, postType: 'blog' | 'community', commentPath: string) {
    try {
        const result = await removeFavorite(postId, postType, commentPath);
        if ("error" in result) {
            console.error(`Error removing favorite for comment path "${commentPath}":`, result.error);
            throw new Error(result.error);
        }
        return result;
    } catch (error) {
        console.error(`Failed to remove favorite for comment path "${commentPath}":`, error);
        throw error;
    }
}

export async function checkCommentFavoriteAction(postId: string, postType: 'blog' | 'community', commentPath: string) {
    try {
        const result = await checkFavorite(postId, postType, commentPath);
        if ("error" in result) {
            console.error(`Error checking favorite for comment path "${commentPath}":`, result.error);
            throw new Error(result.error);
        }
        return result;
    } catch (error) {
        console.error(`Failed to check favorite for comment path "${commentPath}":`, error);
        throw error;
    }
}

// Post-level favorite functions
export async function addPostFavoriteAction(postId: string, postType: 'blog' | 'community' | 'response') {
    const result = await addPostFavorite(postId, postType);
    if ("error" in result) {
        throw new Error(result.error);
    }
    return result;
}

export async function removePostFavoriteAction(postId: string, postType: 'blog' | 'community' | 'response') {
    const result = await removePostFavorite(postId, postType);
    if ("error" in result) {
        throw new Error(result.error);
    }
    return result;
}

export async function checkPostFavoriteAction(postId: string, postType: 'blog' | 'community' | 'response') {
    const result = await checkPostFavorite(postId, postType);
    if ("error" in result) {
        throw new Error(result.error);
    }
    return result;
}

// Legacy function names for backward compatibility
export async function addFavoriteAction(postId: string, postType: 'blog' | 'community', commentPath: string) {
    return addCommentFavoriteAction(postId, postType, commentPath);
}

export async function removeFavoriteAction(postId: string, postType: 'blog' | 'community', commentPath: string) {
    return removeCommentFavoriteAction(postId, postType, commentPath);
}

export async function checkFavoriteAction(postId: string, postType: 'blog' | 'community', commentPath: string) {
    return checkCommentFavoriteAction(postId, postType, commentPath);
}

export async function getUserFavoritesAction() {
    const result = await getUserFavorites();
    if ("error" in result) {
        throw new Error(result.error);
    }
    return result;
}

export async function deleteIndividualFavoriteAction(favoriteId: string) {
    const result = await deleteIndividualFavorite(favoriteId);
    if ("error" in result) {
        throw new Error(result.error);
    }
    return result;
}

export async function clearAllFavoritesAction() {
    const result = await clearAllFavorites();
    if ("error" in result) {
        throw new Error(result.error);
    }
    return result;
} 