import { defineQuery } from "groq";
import { client } from "@/sanity/lib/client";
import { getUser } from "./getUser";

export interface UserStats {
  postsCreated: number;
  commentsMade: number;
  communitiesJoined: number;
  memberSince: string;
  totalLikes: number;
  approvedResponses: number;
  pendingResponses: number;
}

export async function getUserStats(): Promise<UserStats | { error: string }> {
  try {
    const user = await getUser();
    
    if ("error" in user) {
      return { error: user.error };
    }

    // Get user's posts (community responses)
    const postsQuery = defineQuery(`
      count(*[_type == "post" && author._ref == $userId && (isDeleted == false || isDeleted == null)])
    `);

    // Get user's comments
    const commentsQuery = defineQuery(`
      count(*[_type == "comment" && author._ref == $userId && (isDeleted == false || isDeleted == null)])
    `);

    // Get user's embedded comments (comments within posts)
    const embeddedCommentsQuery = defineQuery(`
      count(*[_type == "post" && author._ref == $userId && (isDeleted == false || isDeleted == null) && defined(comments) && count(comments) > 0])
    `);

    // Get user's approved responses
    const approvedResponsesQuery = defineQuery(`
      count(*[_type == "post" && author._ref == $userId && isApproved == true && (isDeleted == false || isDeleted == null)])
    `);

    // Get user's pending responses
    const pendingResponsesQuery = defineQuery(`
      count(*[_type == "post" && author._ref == $userId && isApproved == false && (isDeleted == false || isDeleted == null)])
    `);

    // Get user's favorites (likes received)
    const likesQuery = defineQuery(`
      count(*[_type == "favorite" && post->author._ref == $userId && (post->isDeleted == false || post->isDeleted == null)])
    `);

    // Execute all queries in parallel
    const [
      postsCount,
      commentsCount,
      embeddedCommentsCount,
      approvedResponsesCount,
      pendingResponsesCount,
      likesCount
    ] = await Promise.all([
      client.fetch(postsQuery, { userId: user._id }),
      client.fetch(commentsQuery, { userId: user._id }),
      client.fetch(embeddedCommentsQuery, { userId: user._id }),
      client.fetch(approvedResponsesQuery, { userId: user._id }),
      client.fetch(pendingResponsesQuery, { userId: user._id }),
      client.fetch(likesQuery, { userId: user._id })
    ]);

    // Get user's join date
    const userQuery = defineQuery(`
      *[_type == "user" && _id == $userId][0] {
        joinedAt
      }
    `);

    const userData = await client.fetch(userQuery, { userId: user._id });
    const joinedAt = userData?.joinedAt ? new Date(userData.joinedAt) : new Date();
    const memberSince = joinedAt.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long' 
    });

    const stats: UserStats = {
      postsCreated: postsCount || 0,
      commentsMade: (commentsCount || 0) + (embeddedCommentsCount || 0),
      communitiesJoined: 0, // This would need a separate query for communities the user has joined
      memberSince,
      totalLikes: likesCount || 0,
      approvedResponses: approvedResponsesCount || 0,
      pendingResponses: pendingResponsesCount || 0,
    };

    return stats;
  } catch (error) {
    console.error("Error getting user stats:", error);
    return { error: "Failed to get user statistics" };
  }
} 