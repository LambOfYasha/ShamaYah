'use server';

import { getUser } from "@/lib/user/getUser";
import { adminClient } from "@/sanity/lib/adminClient";
import { defineQuery } from "groq";

export async function createCommunityResponse(
    communityQuestionId: string,
    title: string,
    body: any[],
    imageBase64?: string,
    imageFilename?: string,
    imageContentType?: string
) {
    try {
        const user = await getUser();
        
        if ("error" in user) {
            return { error: user.error };
        }

        // Check if user has permission to create responses
        if (user.role !== 'member' && user.role !== 'teacher' && user.role !== 'admin') {
            return { error: "You don't have permission to create responses" };
        }

        // Verify community question exists
        const communityQuery = defineQuery(`
            *[_type == "communityQuestion" && _id == $communityQuestionId][0] {
                _id,
                title
            }
        `);

        const community = await adminClient.fetch(communityQuery, { communityQuestionId });

        if (!community) {
            return { error: "Community question not found" };
        }

        // Prepare image data if provided
        let imageData = null;
        if (imageBase64 && imageFilename && imageContentType) {
            imageData = {
                _type: 'image',
                asset: {
                    _type: 'reference',
                    _ref: await uploadImage(imageBase64, imageFilename, imageContentType)
                }
            };
        }

        // Generate slug from title
        const slug = title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')
            .substring(0, 96);

        // Create the response document
        const responseDoc = {
            _type: "post",
            title,
            slug: {
                _type: "slug",
                current: slug,
            },
            originalTitle: title,
            author: {
                _type: "reference",
                _ref: user._id,
            },
            communityQuestion: {
                _type: "reference",
                _ref: communityQuestionId,
            },
            body,
            image: imageData,
            isApproved: false,
            isReported: false,
            isDeleted: false,
            publishedAt: new Date().toISOString(),
        };

        const createdResponse = await adminClient.create(responseDoc);

        return { success: true, response: createdResponse };
    } catch (error) {
        console.error("Error creating community response:", error);
        return { error: "Failed to create community response" };
    }
}

export async function approveCommunityResponse(responseId: string) {
    try {
        const user = await getUser();
        
        if ("error" in user) {
            return { error: user.error };
        }

        // Check if user has permission to approve responses
        if (user.role !== 'teacher' && user.role !== 'admin') {
            return { error: "Only teachers and admins can approve responses" };
        }

        // Get the response to check if it exists
        const responseQuery = defineQuery(`
            *[_type == "post" && _id == $responseId && isDeleted == false][0] {
                _id,
                isApproved
            }
        `);

        const response = await adminClient.fetch(responseQuery, { responseId });

        if (!response) {
            return { error: "Response not found" };
        }

        if (response.isApproved) {
            return { error: "Response is already approved" };
        }

        // Approve the response
        await adminClient
            .patch(responseId)
            .set({
                isApproved: true,
                approvedBy: {
                    _type: "reference",
                    _ref: user._id,
                },
                approvedAt: new Date().toISOString(),
            })
            .commit();

        console.log(`Response ${responseId} approved by ${user.username}`);
        return { success: true };
    } catch (error) {
        console.error("Error approving community response:", error);
        return { error: "Failed to approve community response" };
    }
}

export async function unapproveCommunityResponse(responseId: string) {
    try {
        const user = await getUser();
        
        if ("error" in user) {
            return { error: user.error };
        }

        // Check if user has permission to unapprove responses
        if (user.role !== 'teacher' && user.role !== 'admin') {
            return { error: "Only teachers and admins can unapprove responses" };
        }

        // Get the response to check if it exists
        const responseQuery = defineQuery(`
            *[_type == "post" && _id == $responseId && isDeleted == false][0] {
                _id,
                isApproved
            }
        `);

        const response = await adminClient.fetch(responseQuery, { responseId });

        if (!response) {
            return { error: "Response not found" };
        }

        if (!response.isApproved) {
            return { error: "Response is not approved" };
        }

        // Unapprove the response
        await adminClient
            .patch(responseId)
            .set({
                isApproved: false,
                approvedBy: null,
                approvedAt: null,
            })
            .commit();

        console.log(`Response ${responseId} unapproved by ${user.username}`);
        return { success: true };
    } catch (error) {
        console.error("Error unapproving community response:", error);
        return { error: "Failed to unapprove community response" };
    }
}

export async function getCommunityResponses(communityQuestionId: string) {
    try {
        const responsesQuery = defineQuery(`
            *[_type == "post" && communityQuestion._ref == $communityQuestionId && isDeleted == false] | order(isApproved desc, publishedAt desc) {
                _id,
                title,
                slug,
                body,
                image,
                isApproved,
                approvedBy->{
                    _id,
                    username
                },
                approvedAt,
                publishedAt,
                author->{
                    _id,
                    username,
                    imageURL
                }
            }
        `);

        const responses = await adminClient.fetch(responsesQuery, { communityQuestionId });

        return { success: true, responses };
    } catch (error) {
        console.error("Error getting community responses:", error);
        return { error: "Failed to get community responses" };
    }
}

export async function deleteCommunityResponse(responseId: string) {
    try {
        const user = await getUser();
        
        if ("error" in user) {
            return { error: user.error };
        }

        // Get the response to check permissions
        const responseQuery = defineQuery(`
            *[_type == "post" && _id == $responseId && isDeleted == false][0] {
                _id,
                author->{_id},
                isApproved
            }
        `);

        const response = await adminClient.fetch(responseQuery, { responseId });

        if (!response) {
            return { error: "Response not found" };
        }

        // Check if user has permission to delete this response
        if (response.author._id !== user._id && user.role !== 'admin') {
            return { error: "You don't have permission to delete this response" };
        }

        // Soft delete the response
        await adminClient
            .patch(responseId)
            .set({ isDeleted: true })
            .commit();

        console.log(`Response ${responseId} deleted by ${user.username}`);
        return { success: true };
    } catch (error) {
        console.error("Error deleting community response:", error);
        return { error: "Failed to delete community response" };
    }
}

// Helper function for image upload (placeholder - implement based on your image upload system)
async function uploadImage(base64: string, filename: string, contentType: string): Promise<string> {
    // This is a placeholder - implement your image upload logic here
    // You might want to use Sanity's image upload API or your existing image handling
    throw new Error("Image upload not implemented yet");
} 