import { getCurrentUser } from "@/lib/auth/middleware";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { 
  MessageSquare, 
  Heart, 
  Bookmark, 
  TrendingUp, 
  Calendar,
  Plus,
  ArrowRight,
  User,
  FileText,
  Users
} from "lucide-react";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  // Mock data - replace with actual data fetching
  const stats = {
    postsCreated: 5,
    commentsMade: 12,
    communitiesJoined: 3,
    favoritesSaved: 8,
  };

  const recentActivity = [
    { type: "post", title: "Question about baptism", time: "2 hours ago" },
    { type: "comment", content: "Great insight on this topic", time: "1 day ago" },
    { type: "favorite", title: "Saved a post about prayer", time: "2 days ago" },
  ];

  const recommendedCommunities = [
    { name: "Biblical Studies", members: 1250, posts: 456 },
    { name: "Church History", members: 890, posts: 234 },
    { name: "Theology Discussion", members: 2100, posts: 789 },
  ];

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome back, {user.username}!</h1>
          <p className="text-gray-600">Here's what's happening in your communities</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">My Posts</CardTitle>
              <FileText className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.postsCreated}</div>
              <p className="text-xs text-muted-foreground">
                +2 from last week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Comments</CardTitle>
              <MessageSquare className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.commentsMade}</div>
              <p className="text-xs text-muted-foreground">
                +5 from last week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Communities</CardTitle>
              <Users className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.communitiesJoined}</div>
              <p className="text-xs text-muted-foreground">
                Active member
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Favorites</CardTitle>
              <Heart className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.favoritesSaved}</div>
              <p className="text-xs text-muted-foreground">
                Saved posts
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Plus className="h-5 w-5 text-blue-600" />
                <CardTitle>Ask a Question</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Start a new discussion in your communities
              </p>
              <Button asChild className="w-full">
                <Link href="/create-post">
                  Create Post
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-green-600" />
                <CardTitle>Join Communities</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Discover and join new communities
              </p>
              <Button asChild variant="outline" className="w-full">
                <Link href="/communities">
                  Browse Communities
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Bookmark className="h-5 w-5 text-orange-600" />
                <CardTitle>My Favorites</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                View your saved posts and comments
              </p>
              <Button asChild variant="outline" className="w-full">
                <Link href="/favorites">
                  View Favorites
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity & Recommended Communities */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm">
                        {activity.type === 'post' && 'Created post: '}
                        {activity.type === 'comment' && 'Commented: '}
                        {activity.type === 'favorite' && 'Favorited: '}
                        <span className="font-medium">{activity.title || activity.content}</span>
                      </p>
                    </div>
                    <div className="text-sm text-gray-500">{activity.time}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recommended Communities */}
          <Card>
            <CardHeader>
              <CardTitle>Recommended Communities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recommendedCommunities.map((community, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{community.name}</h4>
                      <p className="text-sm text-gray-500">
                        {community.members.toLocaleString()} members • {community.posts} posts
                      </p>
                    </div>
                    <Button size="sm" variant="outline">
                      Join
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 