'use server';

import { adminClient } from "@/sanity/lib/adminClient";
import { defineQuery } from "groq";

export async function testDeleteSimple(responseId: string) {
    try {
        console.log("=== SIMPLE DELETE TEST ===");
        console.log("Testing delete for responseId:", responseId);
        
        // Check environment variables
        console.log("SANITY_ADMIN_API_TOKEN exists:", !!process.env.SANITY_ADMIN_API_TOKEN);
        console.log("NEXT_PUBLIC_SANITY_PROJECT_ID:", process.env.NEXT_PUBLIC_SANITY_PROJECT_ID);
        
        if (!process.env.SANITY_ADMIN_API_TOKEN) {
            return { error: "SANITY_ADMIN_API_TOKEN is not set" };
        }
        
        // Test a simple query first
        const testQuery = defineQuery(`*[_type == "post"][0]{_id, title}`);
        console.log("Testing simple query...");
        const testResult = await adminClient.fetch(testQuery);
        console.log("Test query result:", testResult);
        
        // Test the specific response query
        const responseQuery = defineQuery(`
            *[_type == "post" && _id == $responseId][0] {
                _id,
                title
            }
        `);
        
        console.log("Testing response query...");
        const response = await adminClient.fetch(responseQuery, { responseId });
        console.log("Response query result:", response);
        
        if (!response) {
            return { error: "Response not found" };
        }
        
        // Test deletion
        console.log("Testing deletion...");
        const deleteResult = await adminClient.delete(responseId);
        console.log("Delete result:", deleteResult);
        
        return { success: true, message: "Delete test completed successfully" };
        
    } catch (error) {
        console.error("Simple delete test failed:", error);
        return { 
            error: "Simple delete test failed", 
            details: error instanceof Error ? error.message : String(error) 
        };
    }
} 