'use server';

import { getUser } from "@/lib/user/getUser";

export async function testUserAuth() {
    try {
        console.log("=== USER AUTH TEST ===");
        
        const user = await getUser();
        console.log("User result:", user);
        
        if ("error" in user) {
            return { error: user.error };
        }
        
        return { 
            success: true, 
            user: {
                _id: user._id,
                username: user.username,
                role: user.role
            }
        };
        
    } catch (error) {
        console.error("User auth test failed:", error);
        return { 
            error: "User auth test failed", 
            details: error instanceof Error ? error.message : String(error) 
        };
    }
} 