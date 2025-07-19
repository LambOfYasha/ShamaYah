'use server';

import { addEmbeddedComment, editEmbeddedComment, deleteEmbeddedComment, likeEmbeddedComment } from './embeddedComments';

export async function addCommentAction(postId: string, postType: 'blog' | 'community', content: string, parentCommentId?: string) {
    const result = await addEmbeddedComment(postId, postType, content, parentCommentId);
    if ("error" in result) {
        throw new Error(result.error);
    }
    return result;
}

export async function editCommentAction(postId: string, postType: 'blog' | 'community', commentIndex: number, content: string) {
    const result = await editEmbeddedComment(postId, postType, commentIndex, content);
    if ("error" in result) {
        throw new Error(result.error);
    }
    return result;
}

export async function deleteCommentAction(postId: string, postType: 'blog' | 'community', commentIndex: number) {
    const result = await deleteEmbeddedComment(postId, postType, commentIndex);
    if ("error" in result) {
        throw new Error(result.error);
    }
    return result;
}

export async function likeCommentAction(postId: string, postType: 'blog' | 'community', commentIndex: number) {
    const result = await likeEmbeddedComment(postId, postType, commentIndex);
    if ("error" in result) {
        throw new Error(result.error);
    }
    return result;
} 