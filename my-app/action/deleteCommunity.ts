'use server';

import { defineQuery } from "groq";
import { adminClient } from "@/sanity/lib/adminClient";
import { client } from "@/sanity/lib/client";
import { getUser } from "@/lib/user/getUser";
import { currentUser } from "@clerk/nextjs/server";
import { cleanupFavoritesForDeletedPost, cleanupAllCommentsForDeletedPost } from "./embeddedComments";

export async function deleteCommunity(communityId: string) {
    console.log("=== DELETE COMMUNITY FUNCTION ENTRY ===");
    console.log("CommunityId received:", communityId);
    
    try {
        console.log("=== DELETE COMMUNITY DEBUG START ===");
        console.log("Starting deleteCommunity with communityId:", communityId);
        
        if (!communityId || typeof communityId !== 'string' || communityId.trim() === '') {
            console.error("Invalid community ID provided:", communityId);
            return { error: "Invalid community ID" };
        }

        // Log the ID format to help debug
        console.log("Community ID format check:");
        console.log("- ID length:", communityId.length);
        console.log("- ID starts with 'communityQuestion':", communityId.startsWith('communityQuestion'));
        console.log("- ID format:", communityId);
        
        // Check if admin token is available
        if (!process.env.SANITY_ADMIN_API_TOKEN) {
            console.error("SANITY_ADMIN_API_TOKEN is not set");
            return { error: "Admin token not configured" };
        }

        if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID) {
            console.error("NEXT_PUBLIC_SANITY_PROJECT_ID is not set");
            return { error: "Project ID not configured" };
        }

        if (!process.env.NEXT_PUBLIC_SANITY_DATASET) {
            console.error("NEXT_PUBLIC_SANITY_DATASET is not set");
            return { error: "Dataset not configured" };
        }

        console.log("Admin token is available");
        console.log("Admin token length:", process.env.SANITY_ADMIN_API_TOKEN?.length || 0);
        console.log("Project ID:", process.env.NEXT_PUBLIC_SANITY_PROJECT_ID);
        console.log("Dataset:", process.env.NEXT_PUBLIC_SANITY_DATASET);

        const user = await getUser();
        console.log("User result:", user);

        if ("error" in user) {
            console.error("User error:", user.error);
            return { error: user.error };
        }

        if (!user || !user._id) {
            console.error("User not found or missing ID");
            return { error: "User authentication failed" };
        }

        // Check if user has permission to delete this community question
        const communityQuery = defineQuery(`
            *[_type == "communityQuestion" && _id == $communityId && (isDeleted == false || isDeleted == null)][0] {
                _id,
                moderator->{_id},
                title,
                "hasModerator": defined(moderator)
            }
        `);

        console.log("Fetching community question with ID:", communityId);
        
        // Test admin client connection first
        try {
            const testQuery = defineQuery(`*[_type == "communityQuestion"][0]{_id}`);
            const testResult = await adminClient.fetch(testQuery);
            console.log("Admin client test successful:", testResult ? "Found document" : "No documents");
        } catch (testError) {
            console.error("Admin client test failed:", testError);
            return { error: "Database connection failed - please check your configuration" };
        }
        
        let community;
        try {
            // First try with adminClient
            community = await adminClient.fetch(communityQuery, { communityId });
            console.log("Community query result with adminClient:", community);
        } catch (queryError) {
            console.log("Admin client failed, trying regular client");
            try {
                // If adminClient fails, try with regular client
                community = await client.fetch(communityQuery, { communityId });
                console.log("Community query result with regular client:", community);
            } catch (clientError) {
                console.error("Both clients failed to fetch community:", clientError);
                return { error: "Failed to fetch community question - please try again" };
            }
        }

        if (!community) {
            console.error("Community question not found with ID:", communityId);
            // Try to find the community with a broader query to debug
            try {
                const debugQuery = defineQuery(`
                    *[_type == "communityQuestion" && _id == $communityId] {
                        _id,
                        _type,
                        title,
                        isDeleted
                    }
                `);
                const debugResult = await client.fetch(debugQuery, { communityId });
                console.log("Debug query result:", debugResult);
                
                if (debugResult && debugResult.length > 0) {
                    const foundCommunity = debugResult[0];
                    console.log("Found community but it might be deleted:", foundCommunity);
                    
                    if (foundCommunity.isDeleted) {
                        console.log("Community is already soft-deleted");
                        return { success: true, message: "Community question was already deleted" };
                    } else {
                        return { error: "Community question not found or has been deleted" };
                    }
                }
            } catch (debugError) {
                console.error("Debug query also failed:", debugError);
            }
            return { error: "Community question not found" };
        }

        console.log("Community moderator ID:", community.moderator?._id);
        console.log("Community has moderator:", community.hasModerator);
        console.log("Current user ID:", user._id);
        console.log("Current user role:", user.role);

        // Check if user is the moderator or an admin/teacher
        const isModerator = community.moderator?._id === user._id;
        const isAdmin = user.role === "admin";
        const isTeacher = user.role === "teacher";
        
        console.log("Permission check - isModerator:", isModerator, "isAdmin:", isAdmin, "isTeacher:", isTeacher);
        
        // If no moderator is set, only allow admins and teachers to delete
        if (!community.hasModerator) {
            console.log("No moderator set for this community question");
            if (!isAdmin && !isTeacher) {
                console.error("User does not have permission to delete this community question (no moderator set)");
                return { error: "Only admins and teachers can delete community questions without moderators" };
            }
        } else if (!isModerator && !isAdmin && !isTeacher) {
            console.error("User does not have permission to delete this community question");
            return { error: "You don't have permission to delete this community question" };
        }

        console.log("Permission check passed, proceeding with deletion");

        // Check if there are any responses for this community question (including soft-deleted ones)
        console.log("Checking for responses to this community question:", communityId);
        const responsesQuery = defineQuery(`
            *[_type == "post" && communityQuestion._ref == $communityId] {
                _id,
                title,
                isDeleted
            }
        `);
        
        try {
            const responses = await adminClient.fetch(responsesQuery, { communityId });
            console.log("Found responses:", responses);
            
            if (responses && responses.length > 0) {
                console.log(`Found ${responses.length} responses for this community question`);
                
                // Handle all responses (both active and soft-deleted)
                console.log("Processing responses before deleting community question");
                for (const response of responses) {
                    try {
                        console.log("Processing response:", response._id, "isDeleted:", response.isDeleted);
                        
                        // Clean up favorites for this response first
                        console.log("Cleaning up favorites for response:", response._id);
                        const responseCleanupResult = await cleanupFavoritesForDeletedPost(response._id);
                        if ("error" in responseCleanupResult) {
                            console.warn("Warning: Failed to cleanup favorites for response:", responseCleanupResult.error);
                        } else {
                            console.log(`Cleaned up ${responseCleanupResult.cleanedCount} favorites for response:`, response._id);
                        }
                        
                        // If response is not already soft-deleted, soft delete it
                        if (!response.isDeleted) {
                            console.log("Soft deleting response:", response._id);
                            await adminClient
                                .patch(response._id)
                                .set({
                                    isDeleted: true,
                                    deletedAt: new Date().toISOString(),
                                    deletedBy: user._id
                                })
                                .commit();
                            console.log("Successfully soft deleted response:", response._id);
                        } else {
                            console.log("Response already soft-deleted:", response._id);
                        }
                    } catch (responseDeleteError) {
                        console.error("Error processing response:", response._id, responseDeleteError);
                        // Continue with other responses even if one fails
                    }
                }
            } else {
                console.log("No responses found for this community question");
            }
        } catch (responsesError) {
            console.error("Error checking for responses:", responsesError);
            // Continue with deletion even if we can't check responses
        }

        console.log("Deleting community question with ID:", communityId);
        
        // Clean up favorites before deleting the community question
        console.log("Cleaning up favorites for community question:", communityId);
        try {
            const cleanupResult = await cleanupFavoritesForDeletedPost(communityId);
            if ("error" in cleanupResult) {
                console.warn("Warning: Failed to cleanup favorites:", cleanupResult.error);
            } else {
                console.log(`Cleaned up ${cleanupResult.cleanedCount} favorites for community question:`, communityId);
            }
        } catch (cleanupError) {
            console.warn("Warning: Exception during favorites cleanup:", cleanupError);
            // Continue with deletion even if cleanup fails
        }

        // Clean up all comments (both embedded and separate)
        console.log("Cleaning up all comments for community question:", communityId);
        const commentCleanupResult = await cleanupAllCommentsForDeletedPost(communityId, 'community');
        if ("error" in commentCleanupResult) {
            console.warn("Warning: Failed to cleanup comments:", commentCleanupResult.error);
        } else {
            console.log("Successfully cleaned up all comments for community question:", communityId);
        }

        // Also clean up any favorites that reference this community question as a post
        console.log("Cleaning up post-level favorites for community question:", communityId);
        try {
            const postFavoritesQuery = defineQuery(`
                *[_type == "favorite" && post._ref == $communityId && isActive == true] {
                    _id
                }
            `);
            
            const postFavorites = await adminClient.fetch(postFavoritesQuery, { communityId });
            if (postFavorites && postFavorites.length > 0) {
                console.log(`Found ${postFavorites.length} post-level favorites to deactivate`);
                for (const favorite of postFavorites) {
                    await adminClient
                        .patch(favorite._id)
                        .set({ isActive: false })
                        .commit();
                }
                console.log(`Successfully deactivated ${postFavorites.length} post-level favorites`);
            }
        } catch (postFavoritesError) {
            console.warn("Warning: Exception during post-level favorites cleanup:", postFavoritesError);
        }
        
        // Soft delete the community question (mark as deleted instead of hard delete)
        try {
            console.log("Soft deleting community question with ID:", communityId);
            const softDeleteResult = await adminClient
                .patch(communityId)
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
                    return { error: "Community question not found or already deleted" };
                }
                if (deleteError.message.includes("referenced")) {
                    return { error: "Cannot delete community question with existing references" };
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
            return { error: "Failed to delete community question - please try again" };
        }

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
        
        return { error: "Failed to delete community question - please try again" };
    }
} 