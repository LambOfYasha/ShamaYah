'use server';

import { adminClient } from "@/sanity/lib/adminClient";
import { defineQuery } from "groq";

export async function testCommunityDelete(communityId: string) {
    try {
        console.log("=== COMMUNITY DELETE TEST ===");
        console.log("Testing delete for communityId:", communityId);
        
        // Check environment variables
        console.log("SANITY_ADMIN_API_TOKEN exists:", !!process.env.SANITY_ADMIN_API_TOKEN);
        console.log("NEXT_PUBLIC_SANITY_PROJECT_ID:", process.env.NEXT_PUBLIC_SANITY_PROJECT_ID);
        
        if (!process.env.SANITY_ADMIN_API_TOKEN) {
            return { error: "SANITY_ADMIN_API_TOKEN is not set" };
        }
        
        // Test a simple query first
        const testQuery = defineQuery(`*[_type == "communityQuestion"][0]{_id, title}`);
        console.log("Testing simple query...");
        const testResult = await adminClient.fetch(testQuery);
        console.log("Test query result:", testResult);
        
        // Test the specific community query
        const communityQuery = defineQuery(`
            *[_type == "communityQuestion" && _id == $communityId][0] {
                _id,
                title,
                moderator->{_id}
            }
        `);
        
        console.log("Testing community query...");
        const community = await adminClient.fetch(communityQuery, { communityId });
        console.log("Community query result:", community);
        
        if (!community) {
            return { error: "Community not found" };
        }
        
        // Check for references to this community
        const referencesQuery = defineQuery(`
            *[references($communityId)] {
                _id,
                _type,
                title
            }
        `);
        
        console.log("Testing references query...");
        const references = await adminClient.fetch(referencesQuery, { communityId });
        console.log("References found:", references);
        
        // Test deletion
        console.log("Testing deletion...");
        const deleteResult = await adminClient.delete(communityId);
        console.log("Delete result:", deleteResult);
        
        return { success: true, message: "Delete test completed successfully" };
        
    } catch (error) {
        console.error("Community delete test failed:", error);
        return { 
            error: "Community delete test failed", 
            details: error instanceof Error ? error.message : String(error) 
        };
    }
} 