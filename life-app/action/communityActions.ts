'use server';

import { defineQuery } from "groq";
import { adminClient } from "@/sanity/lib/adminClient";
import { getUser } from "@/lib/user/getUser";

export interface CommunityStats {
  totalCommunities: number;
  activeCommunities: number;
  totalMembers: number;
  totalPosts: number;
  averageMembersPerCommunity: number;
  averagePostsPerCommunity: number;
  categoryDistribution: Record<string, number>;
  statusDistribution: Record<string, number>;
  growthRate: number;
  engagementRate: number;
}

export interface CommunityAnalytics {
  monthlyGrowth: Array<{ month: string; communities: number; members: number; posts: number }>;
  topCommunities: Array<{ _id: string; title: string; memberCount: number; postCount: number }>;
  categoryPerformance: Array<{ category: string; communities: number; members: number; posts: number }>;
  moderatorActivity: Array<{ moderatorId: string; moderatorName: string; communities: number; totalMembers: number }>;
}

export async function getCommunityStats(): Promise<{ success: boolean; stats?: CommunityStats; error?: string }> {
  try {
    const user = await getUser();
    if ("error" in user || !user || user.role !== 'admin') {
      return { success: false, error: 'Unauthorized' };
    }

    // Get basic stats
    const statsQuery = defineQuery(`
      {
        "totalCommunities": count(*[_type == "communityQuestion" && (isDeleted == false || isDeleted == null)]),
        "activeCommunities": count(*[_type == "communityQuestion" && (isDeleted == false || isDeleted == null) && isActive == true]),
        "categoryDistribution": {
          "Theology": count(*[_type == "communityQuestion" && (isDeleted == false || isDeleted == null) && category == "Theology"]),
          "Biblical Studies": count(*[_type == "communityQuestion" && (isDeleted == false || isDeleted == null) && category == "Biblical Studies"]),
          "Church History": count(*[_type == "communityQuestion" && (isDeleted == false || isDeleted == null) && category == "Church History"]),
          "Spiritual Life": count(*[_type == "communityQuestion" && (isDeleted == false || isDeleted == null) && category == "Spiritual Life"]),
          "Personal Growth": count(*[_type == "communityQuestion" && (isDeleted == false || isDeleted == null) && category == "Personal Growth"])
        },
        "statusDistribution": {
          "active": count(*[_type == "communityQuestion" && (isDeleted == false || isDeleted == null) && status == "active"]),
          "moderated": count(*[_type == "communityQuestion" && (isDeleted == false || isDeleted == null) && status == "moderated"]),
          "suspended": count(*[_type == "communityQuestion" && (isDeleted == false || isDeleted == null) && status == "suspended"]),
          "archived": count(*[_type == "communityQuestion" && (isDeleted == false || isDeleted == null) && status == "archived"])
        }
      }
    `);

    const stats = await adminClient.fetch(statsQuery);

    // Get member and post counts
    const communitiesQuery = defineQuery(`
      *[_type == "communityQuestion" && (isDeleted == false || isDeleted == null)] {
        _id,
        "memberCount": count(*[_type == "favorite" && post._ref == ^._id && isActive == true]),
        "postCount": count(*[_type == "post" && communityQuestion._ref == ^._id && (isDeleted == false || isDeleted == null)])
      }
    `);

    const communities = await adminClient.fetch(communitiesQuery);
    
    const totalMembers = communities.reduce((sum: number, comm: any) => sum + comm.memberCount, 0);
    const totalPosts = communities.reduce((sum: number, comm: any) => sum + comm.postCount, 0);
    const averageMembersPerCommunity = stats.totalCommunities > 0 ? Math.round(totalMembers / stats.totalCommunities) : 0;
    const averagePostsPerCommunity = stats.totalCommunities > 0 ? Math.round(totalPosts / stats.totalCommunities) : 0;

    // Calculate engagement rate (posts per member)
    const engagementRate = totalMembers > 0 ? Math.round((totalPosts / totalMembers) * 100) / 100 : 0;

    // Calculate growth rate (simplified - could be enhanced with historical data)
    const growthRate = 12; // Placeholder - would need historical data

    return {
      success: true,
      stats: {
        totalCommunities: stats.totalCommunities,
        activeCommunities: stats.activeCommunities,
        totalMembers,
        totalPosts,
        averageMembersPerCommunity,
        averagePostsPerCommunity,
        categoryDistribution: stats.categoryDistribution,
        statusDistribution: stats.statusDistribution,
        growthRate,
        engagementRate
      }
    };

  } catch (error) {
    console.error('Error getting community stats:', error);
    return { success: false, error: 'Failed to get community statistics' };
  }
}

export async function getCommunityAnalytics(): Promise<{ success: boolean; analytics?: CommunityAnalytics; error?: string }> {
  try {
    const user = await getUser();
    if ("error" in user || !user || user.role !== 'admin') {
      return { success: false, error: 'Unauthorized' };
    }

    // Get top communities by member count
    const topCommunitiesQuery = defineQuery(`
      *[_type == "communityQuestion" && (isDeleted == false || isDeleted == null)] | order(count(*[_type == "favorite" && post._ref == ^._id && isActive == true]) desc) [0...10] {
        _id,
        title,
        "memberCount": count(*[_type == "favorite" && post._ref == ^._id && isActive == true]),
        "postCount": count(*[_type == "post" && communityQuestion._ref == ^._id && (isDeleted == false || isDeleted == null)])
      }
    `);

    const topCommunities = await adminClient.fetch(topCommunitiesQuery);

    // Get category performance
    const categoryPerformanceQuery = defineQuery(`
      {
        "Theology": {
          "communities": count(*[_type == "communityQuestion" && (isDeleted == false || isDeleted == null) && category == "Theology"]),
          "members": sum(count(*[_type == "favorite" && post._ref == ^._id && isActive == true])),
          "posts": sum(count(*[_type == "post" && communityQuestion._ref == ^._id && (isDeleted == false || isDeleted == null)]))
        },
        "Biblical Studies": {
          "communities": count(*[_type == "communityQuestion" && (isDeleted == false || isDeleted == null) && category == "Biblical Studies"]),
          "members": sum(count(*[_type == "favorite" && post._ref == ^._id && isActive == true])),
          "posts": sum(count(*[_type == "post" && communityQuestion._ref == ^._id && (isDeleted == false || isDeleted == null)]))
        },
        "Church History": {
          "communities": count(*[_type == "communityQuestion" && (isDeleted == false || isDeleted == null) && category == "Church History"]),
          "members": sum(count(*[_type == "favorite" && post._ref == ^._id && isActive == true])),
          "posts": sum(count(*[_type == "post" && communityQuestion._ref == ^._id && (isDeleted == false || isDeleted == null)]))
        },
        "Spiritual Life": {
          "communities": count(*[_type == "communityQuestion" && (isDeleted == false || isDeleted == null) && category == "Spiritual Life"]),
          "members": sum(count(*[_type == "favorite" && post._ref == ^._id && isActive == true])),
          "posts": sum(count(*[_type == "post" && communityQuestion._ref == ^._id && (isDeleted == false || isDeleted == null)]))
        },
        "Personal Growth": {
          "communities": count(*[_type == "communityQuestion" && (isDeleted == false || isDeleted == null) && category == "Personal Growth"]),
          "members": sum(count(*[_type == "favorite" && post._ref == ^._id && isActive == true])),
          "posts": sum(count(*[_type == "post" && communityQuestion._ref == ^._id && (isDeleted == false || isDeleted == null)]))
        }
      }
    `);

    const categoryPerformance = await adminClient.fetch(categoryPerformanceQuery);

    // Get moderator activity
    const moderatorActivityQuery = defineQuery(`
      *[_type == "communityQuestion" && (isDeleted == false || isDeleted == null) && defined(moderator)] {
        "moderatorId": moderator._ref,
        "moderatorName": moderator->username,
        "communities": count(*[_type == "communityQuestion" && (isDeleted == false || isDeleted == null) && moderator._ref == ^.moderator._ref]),
        "totalMembers": sum(count(*[_type == "favorite" && post._ref == ^._id && isActive == true]))
      }
    `);

    const moderatorActivity = await adminClient.fetch(moderatorActivityQuery);

    // Generate monthly growth data (placeholder - would need historical data)
    const monthlyGrowth = [
      { month: 'Jan', communities: 15, members: 1200, posts: 450 },
      { month: 'Feb', communities: 18, members: 1450, posts: 520 },
      { month: 'Mar', communities: 22, members: 1800, posts: 680 },
      { month: 'Apr', communities: 25, members: 2100, posts: 750 },
      { month: 'May', communities: 28, members: 2400, posts: 890 },
      { month: 'Jun', communities: 32, members: 2800, posts: 1050 }
    ];

    return {
      success: true,
      analytics: {
        monthlyGrowth,
        topCommunities,
        categoryPerformance: Object.entries(categoryPerformance).map(([category, data]: [string, any]) => ({
          category,
          communities: data.communities,
          members: data.members,
          posts: data.posts
        })),
        moderatorActivity: moderatorActivity.map((mod: any) => ({
          moderatorId: mod.moderatorId,
          moderatorName: mod.moderatorName,
          communities: mod.communities,
          totalMembers: mod.totalMembers
        }))
      }
    };

  } catch (error) {
    console.error('Error getting community analytics:', error);
    return { success: false, error: 'Failed to get community analytics' };
  }
}

export async function updateCommunityStatus(communityId: string, status: string): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getUser();
    if ("error" in user || !user || user.role !== 'admin') {
      return { success: false, error: 'Unauthorized' };
    }

    await adminClient
      .patch(communityId)
      .set({ status })
      .commit();

    return { success: true };

  } catch (error) {
    console.error('Error updating community status:', error);
    return { success: false, error: 'Failed to update community status' };
  }
}

export async function bulkUpdateCommunities(communityIds: string[], updates: any): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getUser();
    if ("error" in user || !user || user.role !== 'admin') {
      return { success: false, error: 'Unauthorized' };
    }

    const updatePromises = communityIds.map(communityId =>
      adminClient
        .patch(communityId)
        .set(updates)
        .commit()
    );

    await Promise.all(updatePromises);

    return { success: true };

  } catch (error) {
    console.error('Error bulk updating communities:', error);
    return { success: false, error: 'Failed to bulk update communities' };
  }
}

export async function getCommunityDetails(communityId: string): Promise<{ success: boolean; community?: any; error?: string }> {
  try {
    const user = await getUser();
    if ("error" in user || !user || user.role !== 'admin') {
      return { success: false, error: 'Unauthorized' };
    }

    const communityQuery = defineQuery(`
      *[_type == "communityQuestion" && _id == $communityId && (isDeleted == false || isDeleted == null)][0] {
        _id,
        title,
        slug,
        description,
        image,
        category,
        tags,
        status,
        isActive,
        isDeleted,
        createdAt,
        lastActivity,
        "moderator": moderator->{
          _id,
          username,
          imageURL,
          role
        },
        "memberCount": count(*[_type == "favorite" && post._ref == ^._id && isActive == true]),
        "postCount": count(*[_type == "post" && communityQuestion._ref == ^._id && (isDeleted == false || isDeleted == null)]),
        "recentPosts": *[_type == "post" && communityQuestion._ref == ^._id && (isDeleted == false || isDeleted == null)] | order(createdAt desc) [0...5] {
          _id,
          title,
          createdAt,
          "author": author->{username, imageURL}
        }
      }
    `);

    const community = await adminClient.fetch(communityQuery, { communityId });

    if (!community) {
      return { success: false, error: 'Community not found' };
    }

    return { success: true, community };

  } catch (error) {
    console.error('Error getting community details:', error);
    return { success: false, error: 'Failed to get community details' };
  }
} 