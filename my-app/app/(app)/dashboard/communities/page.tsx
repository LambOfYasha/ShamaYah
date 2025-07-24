import { getCurrentUser } from "@/lib/auth/middleware";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { 
  Search, 
  Users, 
  MessageSquare, 
  TrendingUp, 
  Plus,
  Eye,
  UserPlus,
  Settings,
  Calendar
} from "lucide-react";
import { getUserCommunities, getRecommendedCommunities } from "@/lib/user/getUserCommunities";
import CommunitiesClient from "./communities-client";
import CreateCommunityButton from "@/components/header/CreateCommunityButton";
import CommunitySettingsButton from "@/components/community/CommunitySettingsButton";

// Force dynamic rendering to avoid static generation issues
export const dynamic = 'force-dynamic';

export default async function CommunitiesPage() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold mb-2">Unable to Load Communities</h2>
            <p className="text-gray-600 mb-4">Please sign in to view your communities</p>
            <Button asChild>
              <Link href="/sign-in">
                Sign In
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Get real community data
  const userCommunitiesResult = await getUserCommunities();
  const recommendedCommunities = await getRecommendedCommunities(6);

  const userCommunities = "error" in userCommunitiesResult 
    ? { joined: [], moderated: [], stats: { totalCommunities: 0, totalMembers: 0, totalPosts: 0, moderatedCommunities: 0 } }
    : userCommunitiesResult;

  const stats = userCommunities.stats;

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Communities</h1>
            <p className="text-gray-600">Manage and discover communities</p>
          </div>
          <CreateCommunityButton />
        </div>

        <CommunitiesClient>
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">My Communities</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCommunities}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Members</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalMembers.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
              <MessageSquare className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPosts.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Moderated</CardTitle>
              <Settings className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.moderatedCommunities}</div>
            </CardContent>
          </Card>
        </div>



        {/* My Communities */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">My Communities</h2>
          {userCommunities.joined.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userCommunities.joined.map((community) => (
                <Card key={community._id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{community.title}</CardTitle>
                      {community.isModerator && (
                        <Badge variant="secondary">Moderator</Badge>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">Community</Badge>
                      <div className="flex items-center space-x-1 text-xs text-gray-500">
                        <Calendar className="w-3 h-3" />
                        <span>Joined {new Date(community.joinedAt || community._createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {community.description || "No description available"}
                    </p>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <span>{(community.memberCount || 0).toLocaleString()} members</span>
                      <span>{community.postCount || 0} posts</span>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Link href={`/community-questions/${community.slug}`}>
                        <Button size="sm" className="flex-1">
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </Button>
                      </Link>
                      <CommunitySettingsButton
                        communityId={community._id}
                        communitySlug={community.slug}
                        communityTitle={community.title}
                        isModerator={community.isModerator}
                        size="sm"
                        variant="outline"
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No communities joined</h3>
                <p className="text-gray-600 mb-4">
                  Start by joining some communities or create your own
                </p>
                <Button asChild>
                  <Link href="/search">
                    <Plus className="w-4 h-4 mr-2" />
                    Explore Communities
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Recommended Communities */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Recommended Communities</h2>
          {recommendedCommunities.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recommendedCommunities.map((community) => (
                <Card key={community._id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{community.title}</CardTitle>
                      <Badge variant="outline">Public</Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">Community</Badge>
                      <div className="flex items-center space-x-1 text-xs text-gray-500">
                        <Calendar className="w-3 h-3" />
                        <span>Created {new Date(community.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {community.description || "No description available"}
                    </p>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <span>{(community.memberCount || 0).toLocaleString()} members</span>
                      <span>{community.postCount || 0} posts</span>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-xs text-gray-500 mb-4">
                      <span>Moderated by {community.moderator.username}</span>
                    </div>
                    
                    <Button size="sm" className="w-full" asChild>
                      <Link href={`/community-questions/${community.slug}`}>
                        <UserPlus className="w-4 h-4 mr-2" />
                        View Community
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No recommended communities</h3>
                <p className="text-gray-600 mb-4">
                  Check back later for community recommendations
                </p>
              </CardContent>
            </Card>
          )}
        </div>
        </CommunitiesClient>
      </div>
    </div>
  );
} 