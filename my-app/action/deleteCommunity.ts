'use server';

import { getUser } from "@/lib/user/getUser";
import { adminClient } from "@/sanity/lib/adminClient";
import { defineQuery } from "groq";
import { sanityFetch } from "@/sanity/lib/live";

export async function deleteCommunity(communityId: string) {
    try {
        const user = await getUser();

        if ("error" in user) {
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

        const community = await sanityFetch({
            query: communityQuery,
            params: { communityId },
        });

        if (!community.data) {
            return { error: "Community not found" };
        }

        // Check if user is the moderator or an admin
        if (community.data.moderator?._id !== user._id && user.role !== "admin") {
            return { error: "You don't have permission to delete this community" };
        }

        // Delete the community
        await adminClient.delete(communityId);

        return { success: true };
    } catch (error) {
        console.error("Failed to delete community:", error);
        return { error: "Failed to delete community" };
    }
} 