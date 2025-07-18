'use server';

import { deleteCommunity } from './deleteCommunity';

export async function deleteCommunityAction(communityId: string) {
    console.log("=== DELETE COMMUNITY ACTION CALLED ===");
    console.log("deleteCommunityAction called with community ID:", communityId);
    
    const result = await deleteCommunity(communityId);
    console.log("Delete result:", result);
    
    if ("error" in result) {
        console.error("Delete community error:", result.error);
        throw new Error(result.error);
    }
    
    console.log("Delete successful");
    return result;
} 