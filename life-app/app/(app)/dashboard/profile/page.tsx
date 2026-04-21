import { getCurrentUser } from "@/lib/auth/middleware";
import { getUserStats, UserStats } from "@/lib/user/getUserStats";
import { getUserPosts, UserPost } from "@/lib/user/getUserPosts";
import { getUserAnalytics, UserAnalytics } from "@/lib/user/getUserAnalytics";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  MessageSquare,
  FileText,
  Clock,
  CheckCircle,
  TrendingUp,
  Eye,
  Heart,
  Star,
  BarChart3,
  Activity
} from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import ProfileForm from "@/components/profile/ProfileForm";

// Force dynamic rendering to avoid static generation issues
export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const user = await getCurrentUser();
  
  if (!user) {
    return (
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold mb-2">Unable to Load Profile</h2>
            <p className="text-gray-600 mb-4">Please sign in to view your profile</p>
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
  
  // Get real user statistics
  const userStatsResult = await getUserStats();
  const userStats: UserStats = "error" in userStatsResult 
    ? {
        postsCreated: 0,
        commentsMade: 0,
        communitiesJoined: 0,
        memberSince: "Unknown",
        totalLikes: 0,
        approvedResponses: 0,
        pendingResponses: 0,
      }
    : userStatsResult;

  // Get real user posts
  const userPostsResult = await getUserPosts(5);
  const recentPosts: UserPost[] = "error" in userPostsResult 
    ? []
    : userPostsResult;

  // Get user analytics
  const analyticsResult = await getUserAnalytics();
  const analytics: UserAnalytics = "error" in analyticsResult 
    ? {
        posts: {
          total: 0,
          approved: 0,
          pending: 0,
          rejected: 0,
          thisMonth: 0,
          thisYear: 0,
          averageLength: 0,
          mostActiveMonth: 'No activity',
        },
        comments: {
          total: 0,
          thisMonth: 0,
          thisYear: 0,
          averageLength: 0,
          mostActiveMonth: 'No activity',
        },
        engagement: {
          totalViews: 0,
          totalFavorites: 0,
          responseRate: 0,
        },
        activity: {
          lastActivity: 'No activity',
          mostActiveDay: 'No activity',
          activityStreak: 0,
        },
      }
    : analyticsResult;

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">My Profile</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Info */}
          <div className="lg:col-span-2">
            <ProfileForm 
              user={{
                _id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                imageURL: user.imageURL,
                bio: user.bio,
                location: user.location,
                website: user.website,
                joinedAt: user.joinedAt
              }} 
              memberSince={userStats.memberSince} 
            />
          </div>

          {/* Stats & Info */}
          <div className="space-y-6">
            {/* Basic Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-500" />
                    <span>Total Posts</span>
                  </div>
                  <span className="font-semibold">{analytics.posts.total}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-green-500" />
                    <span>Total Comments</span>
                  </div>
                  <span className="font-semibold">{analytics.comments.total}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Approved Posts</span>
                  </div>
                  <span className="font-semibold">{analytics.posts.approved}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-orange-500" />
                    <span>Pending Posts</span>
                  </div>
                  <span className="font-semibold">{analytics.posts.pending}</span>
                </div>
              </CardContent>
            </Card>

            {/* Analytics Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Analytics Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-blue-500" />
                    <span>This Month</span>
                  </div>
                  <span className="font-semibold">{analytics.posts.thisMonth} posts</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-purple-500" />
                    <span>Total Views</span>
                  </div>
                  <span className="font-semibold">{analytics.engagement.totalViews}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-red-500" />
                    <span>Total Favorites</span>
                  </div>
                  <span className="font-semibold">{analytics.engagement.totalFavorites}</span>
                </div>

              </CardContent>
            </Card>

            {/* Activity Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">Last activity: {analytics.activity.lastActivity}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">Most active: {analytics.posts.mostActiveMonth}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-gray-500" />
                  <span className="text-sm capitalize">{user?.role || 'member'} account</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Detailed Analytics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {/* Posts Analytics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Posts Analytics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{analytics.posts.thisMonth}</div>
                  <div className="text-sm text-gray-600">This Month</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{analytics.posts.thisYear}</div>
                  <div className="text-sm text-gray-600">This Year</div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Average Length:</span>
                  <span className="text-sm font-medium">{analytics.posts.averageLength} chars</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Response Rate:</span>
                  <span className="text-sm font-medium">{analytics.engagement.responseRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Rejected Posts:</span>
                  <span className="text-sm font-medium">{analytics.posts.rejected}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Comments Analytics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Comments Analytics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{analytics.comments.thisMonth}</div>
                  <div className="text-sm text-gray-600">This Month</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{analytics.comments.thisYear}</div>
                  <div className="text-sm text-gray-600">This Year</div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Average Length:</span>
                  <span className="text-sm font-medium">{analytics.comments.averageLength} chars</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Most Active:</span>
                  <span className="text-sm font-medium">{analytics.comments.mostActiveMonth}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Total Comments:</span>
                  <span className="text-sm font-medium">{analytics.comments.total}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Posts */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Recent Responses</CardTitle>
          </CardHeader>
          <CardContent>
            {recentPosts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No responses yet</p>
                <p className="text-sm">Start participating in community discussions!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentPosts.map((post) => (
                  <div key={post._id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{post.title}</h4>
                        {post.isApproved ? (
                          <Badge variant="default" className="text-xs">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Approved
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">
                            <Clock className="w-3 h-3 mr-1" />
                            Pending
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">
                        {post.communityQuestion ? (
                          <>in {post.communityQuestion.title} • </>
                        ) : (
                          <>Community Response • </>
                        )}
                        {formatDistanceToNow(new Date(post.publishedAt), { addSuffix: true })}
                      </p>
                    </div>
                    <Link href={`/responses/${post._id}`}>
                      <Button size="sm" variant="outline">
                        View
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 