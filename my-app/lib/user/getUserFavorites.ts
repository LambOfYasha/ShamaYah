import { defineQuery } from "groq";
import { client } from "@/sanity/lib/client";
import { getUser } from "./getUser";

export interface UserFavorite {
  _id: string;
  post: {
    _id: string;
    title: string;
    slug?: {
      current: string;
    };
    author: {
      _id: string;
      username: string;
      imageURL?: string;
    };
    publishedAt: string;
    viewCount: number;
    commentCount: number;
  };
  createdAt: string;
}

export async function getUserFavorites(limit: number = 10): Promise<UserFavorite[] | { error: string }> {
  try {
    const user = await getUser();
    
    if ("error" in user) {
      return { error: user.error };
    }

    // Get user's favorites
    const favoritesQuery = defineQuery(`
      *[_type == "favorite" && user._ref == $userId && (post->isDeleted == false || post->isDeleted == null)] | order(_createdAt desc)[0...$limit] {
        _id,
        _createdAt,
        post->{
          _id,
          title,
          slug,
          publishedAt,
          viewCount,
          commentCount,
          author->{
            _id,
            username,
            imageURL
          }
        }
      }
    `);

    const favorites = await client.fetch(favoritesQuery, { 
      userId: user._id, 
      limit 
    });

    return favorites || [];
  } catch (error) {
    console.error("Error getting user favorites:", error);
    return { error: "Failed to get user favorites" };
  }
}

export async function getFavoriteStats(): Promise<{ total: number; thisMonth: number; thisYear: number } | { error: string }> {
  try {
    const user = await getUser();
    
    if ("error" in user) {
      return { error: user.error };
    }

    // Calculate date ranges
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    // Get favorite stats
    const statsQuery = defineQuery(`
      {
        "total": count(*[_type == "favorite" && user._ref == $userId && (post->isDeleted == false || post->isDeleted == null)]),
        "thisMonth": count(*[_type == "favorite" && user._ref == $userId && _createdAt >= $startOfMonth && (post->isDeleted == false || post->isDeleted == null)]),
        "thisYear": count(*[_type == "favorite" && user._ref == $userId && _createdAt >= $startOfYear && (post->isDeleted == false || post->isDeleted == null)])
      }
    `);

    const stats = await client.fetch(statsQuery, { 
      userId: user._id,
      startOfMonth: startOfMonth.toISOString(),
      startOfYear: startOfYear.toISOString()
    });

    return {
      total: stats.total || 0,
      thisMonth: stats.thisMonth || 0,
      thisYear: stats.thisYear || 0
    };
  } catch (error) {
    console.error("Error getting favorite stats:", error);
    return { error: "Failed to get favorite stats" };
  }
} 