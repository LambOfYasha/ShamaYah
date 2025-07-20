'use server';

import { getUser } from "@/lib/user/getUser";
import { adminClient } from "@/sanity/lib/adminClient";
import { defineQuery } from "groq";
import { sanityFetch } from "@/sanity/lib/live";

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
        // Validate input parameters
        if (!communityId || !title || !description || !slug) {
            return { error: "All required fields must be provided" };
        }

        if (title.length < 3 || title.length > 100) {
            return { error: "Title must be between 3 and 100 characters" };
        }

        if (description.length < 10 || description.length > 500) {
            return { error: "Description must be between 10 and 500 characters" };
        }

        // Validate slug format
        const slugRegex = /^[a-z0-9-]+$/;
        if (!slugRegex.test(slug)) {
            return { error: "Slug can only contain lowercase letters, numbers, and hyphens" };
        }

        if (slug.length < 3 || slug.length > 50) {
            return { error: "Slug must be between 3 and 50 characters" };
        }

        // Validate image data if provided
        if (imageData !== null && imageData !== undefined) {
            if (!imageData.base64 || !imageData.fileName || !imageData.contentType) {
                return { error: "Invalid image data provided" };
            }

            // Validate file type
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
            if (!allowedTypes.includes(imageData.contentType)) {
                return { error: "Only JPEG, PNG, WebP, and GIF images are allowed" };
            }

            // Validate base64 format
            if (!imageData.base64.startsWith('data:image/')) {
                return { error: "Invalid image format" };
            }
        }

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

        const community = await sanityFetch({
            query: communityQuery,
            params: { communityId },
        });

        if (!community.data) {
            return { error: "Community not found" };
        }

        // Check if user is the moderator or an admin
        if (community.data.moderator?._id !== user._id && user.role !== "admin") {
            return { error: "You don't have permission to edit this community" };
        }

        // Check if new slug conflicts with existing communities (excluding current community)
        if (slug !== community.data.slug?.current) {
            const checkSlugQuery = defineQuery(`
                *[_type == "communityQuestion" && slug.current == $slug && _id != $communityId][0] {
                    _id
                }
            `);

            const existingSlug = await sanityFetch({
                query: checkSlugQuery,
                params: { slug, communityId },
            });

            if (existingSlug.data) {
                return { error: "A community with this URL already exists" };
            }
        }

        // Upload new image if provided
        let imageAsset;
        if (imageData !== null && imageData !== undefined) {
            try {
                // Validate base64 data format
                const base64Match = imageData.base64.match(/^data:([^;]+);base64,(.+)$/);
                if (!base64Match) {
                    return { error: "Invalid image data format" };
                }

                const [, contentType, base64Data] = base64Match;
                
                // Validate content type matches
                if (contentType !== imageData.contentType) {
                    return { error: "Image content type mismatch" };
                }

                // Validate base64 data length (reasonable size check)
                if (base64Data.length > 10 * 1024 * 1024) { // 10MB limit
                    return { error: "Image file is too large. Maximum size is 5MB." };
                }

                const buffer = Buffer.from(base64Data, "base64");

                // Additional validation for buffer
                if (buffer.length === 0) {
                    return { error: "Invalid image data" };
                }

                imageAsset = await adminClient.assets.upload("image", buffer, {
                    filename: imageData.fileName,
                    contentType: imageData.contentType,
                });

                if (!imageAsset || !imageAsset._id) {
                    return { error: "Failed to upload image to storage" };
                }
            } catch (error) {
                console.error("Failed to upload image:", error);
                
                // Provide more specific error messages
                if (error instanceof Error) {
                    if (error.message.includes('size')) {
                        return { error: "Image file is too large. Maximum size is 5MB." };
                    }
                    if (error.message.includes('type')) {
                        return { error: "Unsupported image format. Please use JPEG, PNG, WebP, or GIF." };
                    }
                }
                
                return { error: "Failed to upload image. Please try again." };
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

        // Handle image updates
        if (imageAsset) {
            // New image uploaded - set the new image
            updateData.image = {
                _type: "image",
                asset: {
                    _type: "reference",
                    _ref: imageAsset._id,
                },
            };
        } else if (imageData === null) {
            // Explicitly remove image (when user clicks remove)
            updateData.image = null;
        }
        // If imageData is undefined, keep existing image unchanged

        const updatedCommunity = await adminClient
            .patch(communityId)
            .set(updateData)
            .commit();

        if (!updatedCommunity) {
            return { error: "Failed to update community" };
        }

        return { success: true, community: updatedCommunity };
    } catch (error) {
        console.error("Failed to edit community:", error);
        
        // Provide more specific error messages based on error type
        if (error instanceof Error) {
            if (error.message.includes('network') || error.message.includes('timeout')) {
                return { error: "Network error. Please check your connection and try again." };
            }
            if (error.message.includes('permission') || error.message.includes('unauthorized')) {
                return { error: "Permission denied. You may not have access to edit this community." };
            }
        }
        
        return { error: "Failed to edit community. Please try again." };
    }
} 