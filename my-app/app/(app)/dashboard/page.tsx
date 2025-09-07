import { getCurrentUser } from "@/lib/auth/middleware";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserAvatar } from "@/components/ui/user-avatar";
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
  LineChart,
  Zap,
  Target as TargetIcon,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  XCircle,
  BookOpen
} from "lucide-react";
import { getUserDashboardData } from "@/lib/user/getUserDashboardData";

// Try to import the main progress component, fallback to simple version
import { Progress as MainProgress } from "@/components/ui/progress";
import { Progress as SimpleProgress } from "@/components/ui/simple-progress";

const Progress = MainProgress ?? SimpleProgress;

// Force dynamic rendering to avoid static generation issues
export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const user = await getCurrentUser();
  
  // Fetch comprehensive dashboard data
  const dashboardData = await getUserDashboardData();
  
  if ('error' in dashboardData) {
    return (
      <div className="p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-8 sm:py-12">
            <AlertCircle className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 text-red-500" />
            <h2 className="text-lg sm:text-xl font-semibold mb-2">Unable to Load Dashboard</h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-4">{dashboardData.error}</p>
            <Button onClick={() => window.location.reload()} className="w-full sm:w-auto">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const { stats, posts, communities, notifications, analytics, recentActivity } = dashboardData;

  return (
    <div className="p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Section */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              <UserAvatar user={dashboardData.user} size="md" />
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">Welcome back, {dashboardData.user.username}!</h1>
                <p className="text-sm sm:text-base text-muted-foreground">Here's your activity overview and insights</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
              <Badge variant="outline" className="flex items-center gap-1 w-fit">
                <Activity className="w-3 h-3" />
                <span className="hidden sm:inline">{dashboardData.user.role}</span>
                <span className="sm:hidden">{dashboardData.user.role.charAt(0).toUpperCase()}</span>
              </Badge>
              <Button size="sm" variant="outline" asChild className="w-full sm:w-auto">
                <Link href="/dashboard/settings">
                  <Settings className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Settings</span>
                  <span className="sm:hidden">Settings</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">My Posts</CardTitle>
              <FileText className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">{stats.postsCreated}</div>
              <div className="flex items-center space-x-2">
                {stats.weeklyGrowth > 0 ? (
                  <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                ) : (
                  <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4 text-red-600" />
                )}
                <p className="text-xs text-muted-foreground">
                  {stats.weeklyGrowth > 0 ? '+' : ''}{stats.weeklyGrowth} from last week
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Total Views</CardTitle>
              <Eye className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">{stats.totalViews.toLocaleString()}</div>
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                <p className="text-xs text-muted-foreground">
                  +{Math.floor(stats.totalViews * 0.15)} from last week
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Engagement Rate</CardTitle>
              <TargetIcon className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">{stats.engagementRate}%</div>
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                <p className="text-xs text-muted-foreground">
                  +2.1% from last month
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Questions</CardTitle>
              <Users className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">{stats.communitiesJoined}</div>
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                <p className="text-xs text-muted-foreground">
                  {communities.active} active
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Content */}
        <Tabs defaultValue="overview" className="space-y-4 sm:space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto p-1">
            <TabsTrigger value="overview" className="text-xs sm:text-sm py-2 px-1 sm:px-3">
              <span className="hidden sm:inline">Overview</span>
              <span className="sm:hidden">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="activity" className="text-xs sm:text-sm py-2 px-1 sm:px-3">
              <span className="hidden sm:inline">Activity</span>
              <span className="sm:hidden">Activity</span>
            </TabsTrigger>
            <TabsTrigger value="content" className="text-xs sm:text-sm py-2 px-1 sm:px-3">
              <span className="hidden sm:inline">My Content</span>
              <span className="sm:hidden">Content</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="text-xs sm:text-sm py-2 px-1 sm:px-3">
              <span className="hidden sm:inline">Analytics</span>
              <span className="sm:hidden">Analytics</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <Zap className="w-4 h-4 sm:w-5 sm:h-5" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4">
                  <div className="grid grid-cols-1 gap-2 sm:gap-3">
                    <Button asChild variant="outline" className="w-full justify-start text-sm sm:text-base">
                      <Link href="/questions">
                        <Users className="w-4 h-4 mr-2" />
                        Browse Questions
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full justify-start text-sm sm:text-base">
                      <Link href="/blogs">
                        <BookOpen className="w-4 h-4 mr-2" />
                        Browse Blogs
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full justify-start text-sm sm:text-base">
                      <Link href="/dashboard/favorites">
                        <Heart className="w-4 h-4 mr-2" />
                        <span className="hidden sm:inline">View Favorites ({stats.favoritesSaved})</span>
                        <span className="sm:hidden">Favorites ({stats.favoritesSaved})</span>
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full justify-start text-sm sm:text-base">
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
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
                    Recent Notifications
                    {notifications.unread > 0 && (
                      <Badge variant="destructive" className="ml-auto text-xs">
                        {notifications.unread}
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 sm:space-y-3">
                    {notifications.recent.length > 0 ? (
                      notifications.recent.map((notification: any) => (
                        <div key={notification._id} className="flex items-center space-x-2 sm:space-x-3 p-2 rounded-lg hover:bg-muted">
                          <div className={`w-2 h-2 rounded-full ${
                            notification.severity === 'error' ? 'bg-red-500' :
                            notification.severity === 'warning' ? 'bg-yellow-500' :
                            notification.severity === 'success' ? 'bg-green-500' : 'bg-blue-500'
                          }`}></div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs sm:text-sm font-medium truncate">{notification.title}</p>
                            <p className="text-xs text-muted-foreground truncate">{notification.message}</p>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {new Date(notification.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4 text-muted-foreground">
                        <Bell className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-xs sm:text-sm">No recent notifications</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Engagement Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">Engagement Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-blue-500 flex items-center justify-center mx-auto mb-2">
                      <span className="text-white font-bold text-sm sm:text-base">{stats.postsCreated}</span>
                    </div>
                    <p className="text-xs sm:text-sm font-medium">Posts</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-green-500 flex items-center justify-center mx-auto mb-2">
                      <span className="text-white font-bold text-sm sm:text-base">{stats.totalViews.toLocaleString()}</span>
                    </div>
                    <p className="text-xs sm:text-sm font-medium">Views</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-purple-500 flex items-center justify-center mx-auto mb-2">
                      <span className="text-white font-bold text-sm sm:text-base">{stats.totalComments}</span>
                    </div>
                    <p className="text-xs sm:text-sm font-medium">Comments</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-4 sm:space-y-6">
            {/* Weekly Activity Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">Weekly Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 sm:space-y-4">
                  {analytics.weeklyActivity.map((day, index) => (
                    <div key={index} className="flex items-center space-x-3 sm:space-x-4">
                      <div className="w-10 sm:w-12 text-xs sm:text-sm font-medium">{day.day}</div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <div className="flex-1 bg-muted rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full" 
                              style={{ width: `${Math.min((day.posts / 3) * 100, 100)}%` }}
                            ></div>
                          </div>
                          <span className="text-xs sm:text-sm text-muted-foreground">{day.posts} posts</span>
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          <div className="flex-1 bg-muted rounded-full h-1">
                            <div 
                              className="bg-green-500 h-1 rounded-full" 
                              style={{ width: `${Math.min((day.views / 100) * 100, 100)}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-muted-foreground">{day.views} views</span>
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
                <CardTitle className="text-base sm:text-lg">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 sm:space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center space-x-3 sm:space-x-4 p-3 border rounded-lg">
                      <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center ${
                        activity.type === 'post' ? 'bg-blue-100' :
                        activity.type === 'community' ? 'bg-green-100' : 'bg-purple-100'
                      }`}>
                        {activity.type === 'post' ? <FileText className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" /> :
                         activity.type === 'community' ? <Users className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" /> :
                         <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4 text-purple-600" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm sm:text-base font-medium">{activity.title}</p>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          {activity.type === 'post' && `${activity.metadata.views} views`}
                          {activity.type === 'community' && `${activity.metadata.members} members • ${activity.metadata.posts} posts`}
                          {activity.type === 'comment' && `${activity.metadata.severity} notification`}
                        </p>
                      </div>
                      <div className="text-xs sm:text-sm text-muted-foreground">{activity.time}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content" className="space-y-4 sm:space-y-6">
            {/* My Posts */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">My Posts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 sm:space-y-4">
                  {posts.recent.length > 0 ? (
                    posts.recent.map((post) => (
                      <div key={post._id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 border rounded-lg gap-3 sm:gap-0">
                        <div className="flex-1">
                          <h4 className="text-sm sm:text-base font-medium">{post.title}</h4>
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            {post.viewCount || 0} views • {post.commentCount || 0} comments
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(post.publishedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                          <Badge variant={post.isApproved ? "default" : "secondary"} className="text-xs">
                            {post.isApproved ? "Approved" : "Pending"}
                          </Badge>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" asChild className="text-xs">
                              <Link href={`/responses/${post.slug?.current || post._id}`}>
                                <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                                <span className="hidden sm:inline">View</span>
                                <span className="sm:hidden">View</span>
                              </Link>
                            </Button>
                            <Button size="sm" variant="outline" className="text-xs">
                              <Edit className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                              <span className="hidden sm:inline">Edit</span>
                              <span className="sm:hidden">Edit</span>
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 sm:py-8 text-muted-foreground">
                      <FileText className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 text-muted-foreground" />
                      <p className="text-sm sm:text-base">No posts yet</p>
                      <Button className="mt-3 sm:mt-4 w-full sm:w-auto" asChild>
                        <Link href="/create-post">
                          <Plus className="w-4 h-4 mr-2" />
                          Create Your First Post
                        </Link>
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* My Communities */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">My Questions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 sm:space-y-4">
                  {communities.joined.length > 0 ? (
                    communities.joined.map((community) => (
                      <div key={community._id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 border rounded-lg gap-3 sm:gap-0">
                        <div className="flex-1">
                          <h4 className="text-sm sm:text-base font-medium">{community.title}</h4>
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            {community.members?.length || 0} members • {community.posts?.length || 0} posts
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Joined {new Date(community._createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <Button size="sm" variant="outline" asChild className="w-full sm:w-auto text-xs">
                          <Link href={`/community-questions/${community.slug?.current || community._id}`}>
                            <Users className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                            <span className="hidden sm:inline">View</span>
                            <span className="sm:hidden">View</span>
                          </Link>
                        </Button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 sm:py-8 text-muted-foreground">
                      <Users className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 text-muted-foreground" />
                      <p className="text-sm sm:text-base">Not a member of any questions yet</p>
                      <Button className="mt-3 sm:mt-4 w-full sm:w-auto" asChild>
                        <Link href="/communities">
                          <Users className="w-4 h-4 mr-2" />
                          Participate in Questions
                        </Link>
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4 sm:space-y-6">
            {/* Performance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg">Content Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 sm:space-y-4">
                    <div>
                      <div className="flex justify-between text-xs sm:text-sm mb-1">
                        <span>Average Views</span>
                        <span>{stats.postsCreated > 0 ? Math.round(stats.totalViews / stats.postsCreated) : 0}</span>
                      </div>
                      <Progress value={stats.postsCreated > 0 ? Math.min((stats.totalViews / stats.postsCreated) / 100, 1) : 0} />
                    </div>
                    <div>
                      <div className="flex justify-between text-xs sm:text-sm mb-1">
                        <span>Engagement Rate</span>
                        <span>{stats.engagementRate}%</span>
                      </div>
                      <Progress value={stats.engagementRate / 100} />
                    </div>
                    <div>
                      <div className="flex justify-between text-xs sm:text-sm mb-1">
                        <span>Question Activity</span>
                        <span>{stats.communitiesJoined}/10</span>
                      </div>
                      <Progress value={Math.min((stats.communitiesJoined / 10) * 100, 100) / 100} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg">Growth Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 sm:space-y-4">
                    {analytics.engagementTrends.map((trend, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-xs sm:text-sm">{trend.period}</span>
                        <div className="flex items-center space-x-3 sm:space-x-4">
                          <div className="text-right">
                            <div className="text-xs sm:text-sm font-medium">{trend.views.toLocaleString()}</div>
                            <div className="text-xs text-muted-foreground">views</div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs sm:text-sm font-medium">{trend.comments}</div>
                            <div className="text-xs text-muted-foreground">comments</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Top Content */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">Top Performing Content</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 sm:space-y-4">
                  {analytics.topContent.length > 0 ? (
                    analytics.topContent.map((post, index) => (
                      <div key={post._id} className="flex items-center space-x-3 sm:space-x-4 p-3 border rounded-lg">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-xs sm:text-sm font-bold text-blue-600">{index + 1}</span>
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm sm:text-base font-medium">{post.title}</h4>
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            {post.viewCount || 0} views • {post.commentCount || 0} comments
                          </p>
                        </div>
                        <Button size="sm" variant="outline" asChild className="text-xs">
                          <Link href={`/responses/${post.slug?.current || post._id}`}>
                            <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                            <span className="hidden sm:inline">View</span>
                            <span className="sm:hidden">View</span>
                          </Link>
                        </Button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 sm:py-8 text-muted-foreground">
                      <BarChart3 className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 text-muted-foreground" />
                      <p className="text-sm sm:text-base">No content yet</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 