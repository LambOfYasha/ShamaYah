'use server';

import { getUser } from "@/lib/user/getUser";
import { adminClient } from "@/sanity/lib/adminClient";
import { defineQuery } from "groq";
import { sanityFetch } from "@/sanity/lib/live";

export async function deleteCommunity(communityId: string) {
    try {
        console.log("Starting deleteCommunity with communityId:", communityId);
        
        // Check if admin token is available
        if (!process.env.SANITY_ADMIN_API_TOKEN) {
            console.error("SANITY_ADMIN_API_TOKEN is not set");
            return { error: "Admin token not configured" };
        }

        const user = await getUser();
        console.log("User result:", user);

        if ("error" in user) {
            console.error("User error:", user.error);
            return { error: user.error };
        }

        // Check if user has permission to delete this community
        const communityQuery = defineQuery(`
            *[_type == "communityQuestion" && _id == $communityId][0] {
                _id,
                moderator->{_id},
                title
            }
        `);

        console.log("Fetching community with ID:", communityId);
        const community = await sanityFetch({
            query: communityQuery,
            params: { communityId },
        });

        console.log("Community query result:", community);

        if (!community.data) {
            console.error("Community not found with ID:", communityId);
            return { error: "Community not found" };
        }

        console.log("Community moderator ID:", community.data.moderator?._id);
        console.log("Current user ID:", user._id);
        console.log("Current user role:", user.role);

        // Check if user is the moderator or an admin
        if (community.data.moderator?._id !== user._id && user.role !== "admin") {
            console.error("User does not have permission to delete this community");
            return { error: "You don't have permission to delete this community" };
        }

        console.log("Deleting community with ID:", communityId);
        
        // Delete the community
        const deleteResult = await adminClient.delete(communityId);
        console.log("Delete result:", deleteResult);

        return { success: true };
    } catch (error) {
        console.error("Failed to delete community:", error);
        
        // Provide more specific error messages
        if (error instanceof Error) {
            if (error.message.includes("token")) {
                return { error: "Authentication failed - please check your permissions" };
            }
            if (error.message.includes("not found")) {
                return { error: "Community not found or already deleted" };
            }
            if (error.message.includes("permission")) {
                return { error: "You don't have permission to delete this community" };
            }
        }
        
        return { error: "Failed to delete community" };
    }
} 