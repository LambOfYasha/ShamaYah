'use server';

import { defineQuery } from "groq"
import { adminClient } from "@/sanity/lib/adminClient"
import { client } from "@/sanity/lib/client"
import { getUser } from "@/lib/user/getUser"
import { currentUser } from "@clerk/nextjs/server"

export type ImageData = {
    base64: string;
    fileName: string;
    contentType: string;
} | null;

export async function editCommunity(
    communityId: string,
    title: string,
    description: string,
    slug: string,
    imageData: ImageData | null
) {
    try {
        const user = await getUser();

        if ("error" in user) {
            return { error: user.error };
        }

        // Check if user has permission to edit this community
        const communityQuery = defineQuery(`
            *[_type == "communityQuestion" && _id == $communityId][0] {
                _id,
                moderator->{_id},
                title,
                slug
            }
        `);

        const community = await client.fetch(communityQuery, { communityId });

        if (!community) {
            return { error: "Community not found" };
        }

        // Check if user is the moderator or an admin
        if (community.moderator?._id !== user._id && user.role !== "admin") {
            return { error: "You don't have permission to edit this community" };
        }

        // Check if new slug conflicts with existing communities (excluding current community)
        if (slug !== community.slug?.current) {
            const checkSlugQuery = defineQuery(`
                *[_type == "communityQuestion" && slug.current == $slug && _id != $communityId][0] {
                    _id
                }
            `);

            const existingSlug = await client.fetch(checkSlugQuery, { slug, communityId });

            if (existingSlug) {
                return { error: "A community with this URL already exists" };
            }
        }

        // Upload new image if provided
        let imageAsset;
        if (imageData) {
            try {
                const base64Data = imageData.base64.split(",")[1];
                const buffer = Buffer.from(base64Data, "base64");

                imageAsset = await adminClient.assets.upload("image", buffer, {
                    filename: imageData.fileName,
                    contentType: imageData.contentType,
                });
            } catch (error) {
                console.error("Failed to upload image:", error);
                return { error: "Failed to upload image" };
            }
        }

        // Update the community
        const updateData: any = {
            title,
            description,
            slug: {
                current: slug,
                _type: "slug",
            },
        };

        if (imageAsset) {
            updateData.image = {
                _type: "image",
                asset: {
                    _type: "reference",
                    _ref: imageAsset._id,
                },
            };
        }

        const updatedCommunity = await adminClient
            .patch(communityId)
            .set(updateData)
            .commit();

        return { success: true, community: updatedCommunity };
    } catch (error) {
        console.error("Failed to edit community:", error);
        return { error: "Failed to edit community" };
    }
} 