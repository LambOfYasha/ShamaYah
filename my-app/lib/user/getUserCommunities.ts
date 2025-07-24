import { defineQuery } from "groq";
import { client } from "@/sanity/lib/client";
import { getUser } from "./getUser";

export interface UserCommunity {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  image?: {
    asset: {
      _ref: string;
    };
    alt?: string;
  };
  moderator: {
    _id: string;
    username: string;
    imageURL?: string;
  };
  createdAt: string;
  _createdAt: string;
  isModerator: boolean;
  memberCount: number;
  postCount: number;
  viewCount: number;
  joinedAt?: string;
}

export interface CommunityStats {
  totalCommunities: number;
  totalViews: number;
  totalPosts: number;
  moderatedCommunities: number;
}

export interface UserCommunitiesData {
  joined: UserCommunity[];
  moderated: UserCommunity[];
  stats: CommunityStats;
}

export async function getUserCommunities(): Promise<UserCommunitiesData | { error: string }> {
  try {
    const user = await getUser();
    
    if ("error" in user) {
      return { error: user.error };
    }

    // Get communities where user is a member or moderator
    const communitiesQuery = defineQuery(`
      {
        "joined": *[_type == "communityQuestion" && (isDeleted == false || isDeleted == null) && (
          moderator._ref == $userId || 
          count(members[_ref == $userId]) > 0
        )] | order(_createdAt desc) {
          _id,
          title,
          "slug": slug.current,
          description,
          image,
          "moderator": moderator->{
            _id,
            username,
            imageURL
          },
          createdAt,
          _createdAt,
          "isModerator": moderator._ref == $userId,
          "memberCount": count(members),
          "postCount": count(posts[]->),
          "viewCount": viewCount || 0,
          "joinedAt": _createdAt
        },
        "totalJoined": count(*[_type == "communityQuestion" && (isDeleted == false || isDeleted == null) && (
          moderator._ref == $userId || 
          count(members[_ref == $userId]) > 0
        )]),
        "totalModerated": count(*[_type == "communityQuestion" && (isDeleted == false || isDeleted == null) && moderator._ref == $userId])
      }
    `);

    const result = await client.fetch(communitiesQuery, { userId: user._id });
    
    const joined = result.joined || [];
    const moderated = joined.filter((community: UserCommunity) => community.isModerator);
    
    // Calculate totals from the joined communities
    const totalViews = joined.reduce((sum: number, community: UserCommunity) => sum + (community.viewCount || 0), 0);
    const totalPosts = joined.reduce((sum: number, community: UserCommunity) => sum + (community.postCount || 0), 0);
    
    const stats: CommunityStats = {
      totalCommunities: result.totalJoined || 0,
      totalViews,
      totalPosts,
      moderatedCommunities: result.totalModerated || 0,
    };

    return {
      joined,
      moderated,
      stats
    };
  } catch (error) {
    console.error("Error getting user communities:", error);
    return { error: "Failed to get user communities" };
  }
}

export async function getRecommendedCommunities(limit: number = 6): Promise<UserCommunity[]> {
  try {
    const user = await getUser();
    
    if ("error" in user) {
      return [];
    }

    // Get communities the user is NOT already a member of
    const recommendedQuery = defineQuery(`
      *[_type == "communityQuestion" && (isDeleted == false || isDeleted == null) && 
        moderator._ref != $userId && 
        count(members[_ref == $userId]) == 0] | 
        order(count(members) desc)[0...$limit] {
          _id,
          title,
          "slug": slug.current,
          description,
          image,
          "moderator": moderator->{
            _id,
            username,
            imageURL
          },
          createdAt,
          _createdAt,
          "isModerator": false,
          "memberCount": count(members),
          "postCount": count(posts[]->),
          "viewCount": viewCount || 0
        }
    `);

    const recommended = await client.fetch(recommendedQuery, { 
      userId: user._id, 
      limit 
    });

    return recommended || [];
  } catch (error) {
    console.error("Error getting recommended communities:", error);
    return [];
  }
} 