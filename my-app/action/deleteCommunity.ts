'use server';

import { getUser } from "@/lib/user/getUser";
import { adminClient } from "@/sanity/lib/adminClient";
import { defineQuery } from "groq";
import { sanityFetch } from "@/sanity/lib/live";
import { cleanupFavoritesForDeletedPost } from "./embeddedComments";

export async function deleteCommunity(communityId: string) {
    try {
        console.log("=== DELETE COMMUNITY DEBUG START ===");
        console.log("Starting deleteCommunity with communityId:", communityId);
        
        // Check if admin token is available
        if (!process.env.SANITY_ADMIN_API_TOKEN) {
            console.error("SANITY_ADMIN_API_TOKEN is not set");
            return { error: "Admin token not configured" };
        }

        console.log("Admin token is available");
        console.log("Project ID:", process.env.NEXT_PUBLIC_SANITY_PROJECT_ID);
        console.log("Dataset:", process.env.NEXT_PUBLIC_SANITY_DATASET);

        const user = await getUser();
        console.log("User result:", user);

        if ("error" in user) {
            console.error("User error:", user.error);
            return { error: user.error };
        }

        // Check if user has permission to delete this community question
        const communityQuery = defineQuery(`
            *[_type == "communityQuestion" && _id == $communityId][0] {
                _id,
                author->{_id},
                title
            }
        `);

        console.log("Fetching community question with ID:", communityId);
        const community = await adminClient.fetch(communityQuery, { communityId });

        console.log("Community query result:", community);

        if (!community) {
            console.error("Community question not found with ID:", communityId);
            return { error: "Community question not found" };
        }

        console.log("Community author ID:", community.author?._id);
        console.log("Current user ID:", user._id);
        console.log("Current user role:", user.role);

        // Check if user is the author or an admin/teacher
        if (community.author?._id !== user._id && user.role !== "admin" && user.role !== "teacher") {
            console.error("User does not have permission to delete this community question");
            return { error: "You don't have permission to delete this community question" };
        }

        console.log("Permission check passed, proceeding with deletion");

        console.log("Deleting community question with ID:", communityId);
        
        // Clean up favorites before deleting the community question
        console.log("Cleaning up favorites for community question:", communityId);
        const cleanupResult = await cleanupFavoritesForDeletedPost(communityId);
        if ("error" in cleanupResult) {
            console.warn("Warning: Failed to cleanup favorites:", cleanupResult.error);
        } else {
            console.log(`Cleaned up ${cleanupResult.cleanedCount} favorites for community question:`, communityId);
        }
        
        // Now delete the community question
        const deleteResult = await adminClient.delete(communityId);
        console.log("Delete result:", deleteResult);

        console.log("=== DELETE COMMUNITY DEBUG END ===");
        return { success: true };
    } catch (error) {
        console.error("=== DELETE COMMUNITY ERROR ===");
        console.error("Failed to delete community question:", error);
        console.error("Error type:", typeof error);
        console.error("Error message:", error instanceof Error ? error.message : String(error));
        console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace");
        console.error("=== END ERROR ===");
        
        // Provide more specific error messages
        if (error instanceof Error) {
            if (error.message.includes("token")) {
                return { error: "Authentication failed - please check your permissions" };
            }
            if (error.message.includes("not found")) {
                return { error: "Community question not found or already deleted" };
            }
            if (error.message.includes("permission")) {
                return { error: "You don't have permission to delete this community question" };
            }
            if (error.message.includes("network")) {
                return { error: "Network error - please check your connection" };
            }
            if (error.message.includes("referenced")) {
                return { error: "Cannot delete community question with existing references - please try again" };
            }
        }
        
        return { error: "Failed to delete community question" };
    }
} 