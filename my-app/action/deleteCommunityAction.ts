'use server';

import { deleteCommunity } from './deleteCommunity';

export async function deleteCommunityAction(communityId: string) {
    console.log("=== DELETE COMMUNITY ACTION CALLED ===");
    console.log("deleteCommunityAction called with community ID:", communityId);
    
    try {
        const result = await deleteCommunity(communityId);
        console.log("Delete result:", result);
        
        if ("error" in result) {
            console.error("Delete community error:", result.error);
            throw new Error(result.error);
        }
        
        console.log("Delete successful");
        return result;
    } catch (error) {
        console.error("=== DELETE COMMUNITY ACTION ERROR ===");
        console.error("Error in deleteCommunityAction:", error);
        console.error("Error type:", typeof error);
        console.error("Error message:", error instanceof Error ? error.message : String(error));
        console.error("=== END ACTION ERROR ===");
        
        throw new Error("Failed to delete community question - please try again");
    }
} 