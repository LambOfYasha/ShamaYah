'use server';

import { adminClient } from "@/sanity/lib/adminClient";
import { defineQuery } from "groq";

export async function testAdminClient() {
    try {
        console.log("=== TESTING ADMIN CLIENT ===");
        
        // Check environment variables
        console.log("SANITY_ADMIN_API_TOKEN exists:", !!process.env.SANITY_ADMIN_API_TOKEN);
        console.log("NEXT_PUBLIC_SANITY_PROJECT_ID:", process.env.NEXT_PUBLIC_SANITY_PROJECT_ID);
        console.log("NEXT_PUBLIC_SANITY_DATASET:", process.env.NEXT_PUBLIC_SANITY_DATASET);
        
        if (!process.env.SANITY_ADMIN_API_TOKEN) {
            return { error: "SANITY_ADMIN_API_TOKEN is not set" };
        }
        
        if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID) {
            return { error: "NEXT_PUBLIC_SANITY_PROJECT_ID is not set" };
        }
        
        if (!process.env.NEXT_PUBLIC_SANITY_DATASET) {
            return { error: "NEXT_PUBLIC_SANITY_DATASET is not set" };
        }
        
        // Test a simple query
        const testQuery = defineQuery(`*[_type == "communityQuestion"][0]{_id, title}`);
        console.log("Executing test query...");
        
        const result = await adminClient.fetch(testQuery);
        console.log("Test query result:", result);
        
        if (result) {
            return { success: true, message: "Admin client is working", data: result };
        } else {
            return { success: true, message: "Admin client is working but no community questions found" };
        }
        
    } catch (error) {
        console.error("Admin client test failed:", error);
        return { 
            error: "Admin client test failed", 
            details: error instanceof Error ? error.message : String(error) 
        };
    }
} 