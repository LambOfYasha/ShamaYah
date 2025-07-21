import { getCurrentUser } from "@/lib/auth/middleware";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  Users,
  Eye,
  Clock,
  Star,
  Activity,
  Target,
  Award,
  Bell,
  Search,
  Filter,
  MoreHorizontal,
  ThumbsUp,
  Share2,
  Edit,
  Trash2,
  Settings,
  BarChart3,
  PieChart,
  LineChart
} from "lucide-react";
import { getBlogs } from "@/sanity/lib/blogs/getBlogs";
import { getCommunities } from "@/sanity/lib/communties/getCommunities";
import { getUserNotifications } from "@/action/notificationActions";

// Try to import the main progress component, fallback to simple version
let Progress;
try {
  Progress = require('@/components/ui/progress').Progress;
} catch (error) {
  Progress = require('@/components/ui/simple-progress').Progress;
}

export default async function DashboardPage() {
  const user = await getCurrentUser();

  // Fetch real data
  const [blogs, communities, notifications] = await Promise.all([
    getBlogs(),
    getCommunities(),
    getUserNotifications(5, false) // Get 5 recent notifications
  ]);

  // Calculate dynamic stats
  const userBlogs = blogs.filter(blog => blog.author?._id === user._id);
  const userCommunities = communities.filter(community => 
    community.members?.some((member: any) => member._id === user._id)
  );

  const stats = {
    postsCreated: userBlogs.length,
    commentsMade: 12, // This would need to be fetched from comments
    communitiesJoined: userCommunities.length,
    favoritesSaved: 8, // This would need to be fetched from favorites
    totalViews: userBlogs.reduce((sum, blog) => sum + (blog.viewCount || 0), 0),
    totalLikes: userBlogs.reduce((sum, blog) => sum + (blog.likeCount || 0), 0),
    engagementRate: userBlogs.length > 0 ? 
      ((userBlogs.reduce((sum, blog) => sum + (blog.likeCount || 0), 0) / userBlogs.length) * 100).toFixed(1) : 0
  };

  // Recent activity based on real data
  const recentActivity = [
    ...userBlogs.slice(0, 3).map(blog => ({
      type: "post",
      title: blog.title,
      time: new Date(blog._createdAt).toLocaleDateString(),
      id: blog._id,
      views: blog.viewCount || 0,
      likes: blog.likeCount || 0
    })),
    ...userCommunities.slice(0, 2).map(community => ({
      type: "community",
      title: community.title,
      time: new Date(community._createdAt).toLocaleDateString(),
      id: community._id,
      members: community.members?.length || 0
    }))
  ];

  // Engagement metrics
  const engagementData = [
    { label: 'Posts', value: stats.postsCreated, color: 'bg-blue-500' },
    { label: 'Views', value: stats.totalViews, color: 'bg-green-500' },
    { label: 'Likes', value: stats.totalLikes, color: 'bg-red-500' },
    { label: 'Comments', value: stats.commentsMade, color: 'bg-purple-500' }
  ];

  // Weekly activity (mock data for now)
  const weeklyActivity = [
    { day: 'Mon', posts: 2, views: 45, likes: 12 },
    { day: 'Tue', posts: 1, views: 32, likes: 8 },
    { day: 'Wed', posts: 3, views: 67, likes: 18 },
    { day: 'Thu', posts: 0, views: 23, likes: 5 },
    { day: 'Fri', posts: 2, views: 54, likes: 15 },
    { day: 'Sat', posts: 1, views: 38, likes: 9 },
    { day: 'Sun', posts: 1, views: 41, likes: 11 }
  ];

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Welcome back, {user.username}!</h1>
              <p className="text-gray-600">Here's your activity overview and insights</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <Activity className="w-3 h-3" />
                {user.role}
              </Badge>
              <Button size="sm" variant="outline">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">My Posts</CardTitle>
              <FileText className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.postsCreated}</div>
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <p className="text-xs text-muted-foreground">
                  +{Math.max(0, stats.postsCreated - 3)} from last month
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Views</CardTitle>
              <Eye className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalViews.toLocaleString()}</div>
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <p className="text-xs text-muted-foreground">
                  +{Math.floor(stats.totalViews * 0.15)} from last week
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
              <Target className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.engagementRate}%</div>
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <p className="text-xs text-muted-foreground">
                  +2.1% from last month
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Communities</CardTitle>
              <Users className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.communitiesJoined}</div>
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <p className="text-xs text-muted-foreground">
                  Active member
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="content">My Content</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-3">
                    <Button asChild className="w-full justify-start">
                      <Link href="/create-post">
                        <Plus className="w-4 h-4 mr-2" />
                        Create New Post
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full justify-start">
                      <Link href="/communities">
                        <Users className="w-4 h-4 mr-2" />
                        Browse Communities
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full justify-start">
                      <Link href="/favorites">
                        <Heart className="w-4 h-4 mr-2" />
                        View Favorites
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full justify-start">
                      <Link href="/search">
                        <Search className="w-4 h-4 mr-2" />
                        Search Content
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Notifications */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    Recent Notifications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {notifications.success && notifications.notifications?.length > 0 ? (
                      notifications.notifications.slice(0, 3).map((notification: any) => (
                        <div key={notification._id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50">
                          <div className={`w-2 h-2 rounded-full ${
                            notification.severity === 'error' ? 'bg-red-500' :
                            notification.severity === 'warning' ? 'bg-yellow-500' :
                            notification.severity === 'success' ? 'bg-green-500' : 'bg-blue-500'
                          }`}></div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{notification.title}</p>
                            <p className="text-xs text-gray-500 truncate">{notification.message}</p>
                          </div>
                          <span className="text-xs text-gray-400">
                            {new Date(notification.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4 text-gray-500">
                        <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                        <p className="text-sm">No recent notifications</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Engagement Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Engagement Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {engagementData.map((item, index) => (
                    <div key={index} className="text-center">
                      <div className={`w-16 h-16 rounded-full ${item.color} flex items-center justify-center mx-auto mb-2`}>
                        <span className="text-white font-bold">{item.value}</span>
                      </div>
                      <p className="text-sm font-medium">{item.label}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            {/* Weekly Activity Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Weekly Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {weeklyActivity.map((day, index) => (
                    <div key={index} className="flex items-center space-x-4">
                      <div className="w-12 text-sm font-medium">{day.day}</div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full" 
                              style={{ width: `${(day.posts / 3) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600">{day.posts} posts</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center space-x-4 p-3 border rounded-lg">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        activity.type === 'post' ? 'bg-blue-100' :
                        activity.type === 'community' ? 'bg-green-100' : 'bg-purple-100'
                      }`}>
                        {activity.type === 'post' ? <FileText className="w-4 h-4 text-blue-600" /> :
                         activity.type === 'community' ? <Users className="w-4 h-4 text-green-600" /> :
                         <MessageSquare className="w-4 h-4 text-purple-600" />}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{activity.title}</p>
                        <p className="text-sm text-gray-500">
                          {activity.type === 'post' && `${activity.views} views • ${activity.likes} likes`}
                          {activity.type === 'community' && `${activity.members} members`}
                        </p>
                      </div>
                      <div className="text-sm text-gray-400">{activity.time}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content" className="space-y-6">
            {/* My Posts */}
            <Card>
              <CardHeader>
                <CardTitle>My Posts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {userBlogs.length > 0 ? (
                    userBlogs.map((blog) => (
                      <div key={blog._id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium">{blog.title}</h4>
                          <p className="text-sm text-gray-500">
                            {blog.viewCount || 0} views • {blog.likeCount || 0} likes • {new Date(blog._createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No posts yet</p>
                      <Button className="mt-4">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Your First Post
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* My Communities */}
            <Card>
              <CardHeader>
                <CardTitle>My Communities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {userCommunities.length > 0 ? (
                    userCommunities.map((community) => (
                      <div key={community._id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium">{community.title}</h4>
                          <p className="text-sm text-gray-500">
                            {community.members?.length || 0} members • {community.posts?.length || 0} posts
                          </p>
                        </div>
                        <Button size="sm" variant="outline">
                          <Users className="w-4 h-4 mr-1" />
                          View
                        </Button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>Not a member of any communities yet</p>
                      <Button className="mt-4">
                        <Users className="w-4 h-4 mr-2" />
                        Join Communities
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            {/* Performance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Content Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Average Views</span>
                        <span>{stats.postsCreated > 0 ? Math.round(stats.totalViews / stats.postsCreated) : 0}</span>
                      </div>
                      <Progress value={stats.postsCreated > 0 ? (stats.totalViews / stats.postsCreated) / 100 : 0} />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Engagement Rate</span>
                        <span>{stats.engagementRate}%</span>
                      </div>
                      <Progress value={parseFloat(stats.engagementRate)} />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Community Activity</span>
                        <span>{stats.communitiesJoined}/10</span>
                      </div>
                      <Progress value={(stats.communitiesJoined / 10) * 100} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Growth Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Posts Growth</span>
                      <div className="flex items-center space-x-1">
                        <TrendingUp className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-green-600">+15%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Views Growth</span>
                      <div className="flex items-center space-x-1">
                        <TrendingUp className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-green-600">+23%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Engagement Growth</span>
                      <div className="flex items-center space-x-1">
                        <TrendingUp className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-green-600">+8%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Achievement Badges */}
            <Card>
              <CardHeader>
                <CardTitle>Achievements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <Award className="w-8 h-8 mx-auto mb-2 text-yellow-600" />
                    <p className="text-sm font-medium">First Post</p>
                    <p className="text-xs text-gray-500">Created your first post</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <Star className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                    <p className="text-sm font-medium">Engaged</p>
                    <p className="text-xs text-gray-500">100+ views on posts</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <Users className="w-8 h-8 mx-auto mb-2 text-green-600" />
                    <p className="text-sm font-medium">Community</p>
                    <p className="text-xs text-gray-500">Joined 3+ communities</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <Heart className="w-8 h-8 mx-auto mb-2 text-red-600" />
                    <p className="text-sm font-medium">Liked</p>
                    <p className="text-xs text-gray-500">Received 50+ likes</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 