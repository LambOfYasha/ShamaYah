'use server';

import { getUser } from "@/lib/user/getUser";
import { adminClient } from "@/sanity/lib/adminClient";
import { defineQuery } from "groq";
import { cleanupFavoritesForDeletedPost } from "./embeddedComments";

export async function createCommunityResponse(
    communityQuestionId: string,
    title: string,
    body: string,
    imageBase64?: string,
    imageFilename?: string,
    imageContentType?: string,
    guestUser?: { _id: string, username: string, role: string, imageURL?: string }
) {
    try {
        let user;
        
        if (guestUser) {
            // Use provided guest user
            user = guestUser;
        } else {
            // Try to get authenticated user
            const userResult = await getUser();
            
            if ("error" in userResult) {
                return { error: userResult.error };
            }
            
            user = userResult;
        }

        // Check if user has permission to create responses
        if (user.role !== 'guest' && user.role !== 'member' && user.role !== 'teacher' && user.role !== 'junior_teacher' && user.role !== 'senior_teacher' && user.role !== 'lead_teacher' && user.role !== 'admin') {
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

        // Check if user has permission to approve responses - only senior_teacher, lead_teacher, and admin
        if (user.role !== 'senior_teacher' && user.role !== 'lead_teacher' && user.role !== 'admin') {
            return { error: "Only Senior Teachers, Lead Teachers, and Admins can approve responses" };
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

        // Check if user has permission to unapprove responses - only senior_teacher, lead_teacher, and admin
        if (user.role !== 'senior_teacher' && user.role !== 'lead_teacher' && user.role !== 'admin') {
            return { error: "Only Senior Teachers, Lead Teachers, and Admins can unapprove responses" };
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
            *[_type == "post" && communityQuestion._ref == $communityQuestionId && (isDeleted == false || isDeleted == null)] | order(isApproved desc, publishedAt desc) {
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

export async function editCommunityResponse(
    responseId: string,
    title: string,
    body: string
) {
    try {
        const user = await getUser();
        
        if ("error" in user) {
            return { error: user.error };
        }

        // Get the response to check if it exists and if user has permission
        const responseQuery = defineQuery(`
            *[_type == "post" && _id == $responseId && (isDeleted == false || isDeleted == null)][0] {
                _id,
                title,
                author->{_id},
                isApproved
            }
        `);

        const response = await adminClient.fetch(responseQuery, { responseId });

        if (!response) {
            return { error: "Response not found" };
        }

        // Check if user is the author or an admin/teacher
        const isAuthor = response.author._id === user._id;
        const isAdmin = user.role === "admin";
        const isTeacher = user.role === "teacher" || user.role === "junior_teacher" || user.role === "senior_teacher" || user.role === "lead_teacher";

        if (!isAuthor && !isAdmin && !isTeacher) {
            return { error: "You don't have permission to edit this response" };
        }

        // Junior teachers can only edit member content, not teacher content
        if (user.role === "junior_teacher" && !isAuthor && response.author.role && ["teacher", "junior_teacher", "senior_teacher", "lead_teacher"].includes(response.author.role)) {
            return { error: "Junior teachers cannot edit content from other teachers" };
        }

        // Generate new slug from title
        const slug = title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')
            .substring(0, 96);

        // Update the response
        await adminClient
            .patch(responseId)
            .set({
                title,
                slug: {
                    _type: "slug",
                    current: slug,
                },
                body,
                // If not approved, keep approval status. If approved, unapprove when edited
                ...(response.isApproved && {
                    isApproved: false,
                    approvedBy: null,
                    approvedAt: null,
                }),
            })
            .commit();

        console.log(`Response ${responseId} edited by ${user.username}`);
        return { success: true };
    } catch (error) {
        console.error("Error editing community response:", error);
        return { error: "Failed to edit community response" };
    }
}

export async function deleteCommunityResponse(responseId: string) {
    console.log("=== DELETE RESPONSE FUNCTION ENTRY ===");
    console.log("ResponseId received:", responseId);
    
    try {
        console.log("=== DELETE RESPONSE DEBUG START ===");
        console.log("Starting deleteCommunityResponse with responseId:", responseId);
        
        if (!responseId || typeof responseId !== 'string' || responseId.trim() === '') {
            console.error("Invalid response ID provided:", responseId);
            return { error: "Invalid response ID" };
        }
        
        // Check environment variables
        if (!process.env.SANITY_ADMIN_API_TOKEN) {
            console.error("SANITY_ADMIN_API_TOKEN is not set");
            return { error: "Admin token not configured" };
        }

        if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID) {
            console.error("NEXT_PUBLIC_SANITY_PROJECT_ID is not set");
            return { error: "Project ID not configured" };
        }

        console.log("Environment variables check passed");
        
        let user;
        try {
            user = await getUser();
            console.log("User result:", user);
        } catch (userError) {
            console.error("Error getting user:", userError);
            return { error: "Failed to authenticate user" };
        }
        
        if ("error" in user) {
            console.error("User error:", user.error);
            return { error: user.error };
        }

        if (!user || !user._id) {
            console.error("User not found or missing ID");
            return { error: "User authentication failed" };
        }

        // Get the response to check if it exists and if user has permission
        const responseQuery = defineQuery(`
            *[_type == "post" && _id == $responseId && (isDeleted == false || isDeleted == null)][0] {
                _id,
                title,
                author->{_id}
            }
        `);

        console.log("Fetching response with ID:", responseId);
        
        // Test admin client connection first
        try {
            const testQuery = defineQuery(`*[_type == "post"][0]{_id}`);
            const testResult = await adminClient.fetch(testQuery);
            console.log("Admin client test successful:", testResult ? "Found document" : "No documents");
        } catch (testError) {
            console.error("Admin client test failed:", testError);
            return { error: "Database connection failed - please check your configuration" };
        }
        
        let response;
        try {
            response = await adminClient.fetch(responseQuery, { responseId });
            console.log("Response query result:", response);
        } catch (queryError) {
            console.error("Error fetching response:", queryError);
            return { error: "Failed to fetch response - please try again" };
        }

        if (!response) {
            console.error("Response not found with ID:", responseId);
            return { error: "Response not found" };
        }

        console.log("Response author ID:", response.author._id);
        console.log("Current user ID:", user._id);
        console.log("Current user role:", user.role);

        // Check if user is the author or an admin/teacher
        const isAuthor = response.author._id === user._id;
        const isAdmin = user.role === "admin";
        const isTeacher = user.role === "teacher" || user.role === "junior_teacher" || user.role === "senior_teacher" || user.role === "lead_teacher";

        console.log("Permission check - isAuthor:", isAuthor, "isAdmin:", isAdmin, "isTeacher:", isTeacher);

        if (!isAuthor && !isAdmin && !isTeacher) {
            return { error: "You don't have permission to delete this response" };
        }

        // Junior teachers can only delete member content, not teacher content
        if (user.role === "junior_teacher" && !isAuthor && response.author.role && ["teacher", "junior_teacher", "senior_teacher", "lead_teacher"].includes(response.author.role)) {
            return { error: "Junior teachers cannot delete content from other teachers" };
        }

        console.log("Permission check passed, proceeding with deletion");

        // Clean up favorites before deleting
        console.log("Cleaning up favorites for response:", responseId);
        try {
            const cleanupResult = await cleanupFavoritesForDeletedPost(responseId);
            if ("error" in cleanupResult) {
                console.warn("Warning: Failed to cleanup favorites:", cleanupResult.error);
            } else {
                console.log(`Cleaned up ${cleanupResult.cleanedCount} favorites for response:`, responseId);
            }
        } catch (cleanupError) {
            console.warn("Warning: Exception during favorites cleanup:", cleanupError);
            // Continue with deletion even if cleanup fails
        }

        // Soft delete the response (mark as deleted instead of hard delete)
        console.log("Soft deleting response with ID:", responseId);
        try {
            const softDeleteResult = await adminClient
                .patch(responseId)
                .set({
                    isDeleted: true,
                    deletedAt: new Date().toISOString(),
                    deletedBy: user._id
                })
                .commit();
            
            console.log("Soft delete result:", softDeleteResult);
            
            if (!softDeleteResult) {
                console.error("Soft delete operation returned null/undefined");
                return { error: "Delete operation failed - no result returned" };
            }
            
            console.log("Soft delete operation completed successfully");
        } catch (deleteError) {
            console.error("Error during soft deletion:", deleteError);
            console.error("Error type:", typeof deleteError);
            console.error("Error message:", deleteError instanceof Error ? deleteError.message : String(deleteError));
            
            if (deleteError instanceof Error) {
                if (deleteError.message.includes("not found")) {
                    return { error: "Response not found or already deleted" };
                }
                if (deleteError.message.includes("referenced")) {
                    return { error: "Cannot delete response with existing references" };
                }
                if (deleteError.message.includes("permission")) {
                    return { error: "Permission denied - please check your access rights" };
                }
                if (deleteError.message.includes("token")) {
                    return { error: "Authentication failed - please check your Sanity token" };
                }
                if (deleteError.message.includes("network")) {
                    return { error: "Network error - please check your connection" };
                }
            }
            return { error: "Failed to delete response - please try again" };
        }

        console.log("=== DELETE RESPONSE DEBUG END ===");
        console.log(`Response ${responseId} deleted by ${user.username}`);
        return { success: true };
    } catch (error) {
        console.error("=== DELETE RESPONSE ERROR ===");
        console.error("Failed to delete community response:", error);
        console.error("Error type:", typeof error);
        console.error("Error message:", error instanceof Error ? error.message : String(error));
        console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace");
        console.error("=== END ERROR ===");
        
        return { error: "Failed to delete response - please try again" };
    }
}

// Helper function for image upload (placeholder - implement based on your image upload system)
async function uploadImage(base64: string, filename: string, contentType: string): Promise<string> {
    // This is a placeholder - implement your image upload logic here
    // You might want to use Sanity's image upload API or your existing image handling
    throw new Error("Image upload not implemented yet");
} 