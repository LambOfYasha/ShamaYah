import { defineQuery } from "groq";
import { client } from "@/sanity/lib/client";
import { getUser } from "./getUser";

export interface UserPost {
  _id: string;
  title: string;
  slug?: {
    current: string;
  };
  publishedAt: string;
  isApproved: boolean;
  communityQuestion?: {
    _id: string;
    title: string;
    slug?: {
      current: string;
    };
  };
}

export async function getUserPosts(limit: number = 5): Promise<UserPost[] | { error: string }> {
  try {
    const user = await getUser();
    
    if ("error" in user) {
      return { error: user.error };
    }

    // Get user's recent posts (community responses)
    const postsQuery = defineQuery(`
      *[_type == "post" && author._ref == $userId && (isDeleted == false || isDeleted == null)] | order(publishedAt desc)[0...$limit] {
        _id,
        title,
        slug,
        publishedAt,
        isApproved,
        communityQuestion->{
          _id,
          title,
          slug
        }
      }
    `);

    const posts = await client.fetch(postsQuery, { 
      userId: user._id, 
      limit 
    });

    return posts || [];
  } catch (error) {
    console.error("Error getting user posts:", error);
    return { error: "Failed to get user posts" };
  }
} 