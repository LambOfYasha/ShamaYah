'use server';

import { deleteBlog } from './deleteBlog';

export async function deleteBlogAction(blogId: string) {
    console.log("=== DELETE BLOG ACTION CALLED ===");
    console.log("deleteBlogAction called with blog ID:", blogId);
    
    const result = await deleteBlog(blogId);
    console.log("Delete result:", result);
    
    if ("error" in result) {
        console.error("Delete blog error:", result.error);
        throw new Error(result.error);
    }
    
    console.log("Delete successful");
    return result;
} 