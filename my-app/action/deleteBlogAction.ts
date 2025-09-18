'use server';

import { deleteBlog } from './deleteBlog';

export async function deleteBlogAction(blogId: string) {
    console.log("=== DELETE BLOG ACTION CALLED ===");
    console.log("deleteBlogAction called with blog ID:", blogId);
    
    try {
        const result = await deleteBlog(blogId);
        console.log("Delete result:", result);
        
        if ("error" in result) {
            console.error("Delete blog error:", result.error);
            throw new Error(result.error);
        }
        
        console.log("Delete successful");
        return result;
    } catch (error) {
        console.error("=== DELETE BLOG ACTION ERROR ===");
        console.error("Error in deleteBlogAction:", error);
        console.error("Error type:", typeof error);
        console.error("Error message:", error instanceof Error ? error.message : String(error));
        console.error("=== END ACTION ERROR ===");
        
        throw new Error("Failed to delete blog - please try again");
    }
} 