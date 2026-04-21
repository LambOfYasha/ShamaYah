'use server';

import { deleteCommunityResponse } from './postActions';

export async function deleteResponseAction(responseId: string) {
    console.log("=== DELETE RESPONSE ACTION CALLED ===");
    console.log("deleteResponseAction called with response ID:", responseId);
    
    const result = await deleteCommunityResponse(responseId);
    console.log("Delete result:", result);
    
    if ("error" in result) {
        console.error("Delete response error:", result.error);
        throw new Error(result.error);
    }
    
    console.log("Delete successful");
    return result;
} 