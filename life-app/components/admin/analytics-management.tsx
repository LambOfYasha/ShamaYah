'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import {
  BarChart3,
  TrendingUp,
  Users,
  FileText,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Target,
  Activity,
  PieChart,
  MessageSquare,
  Heart,
  Flag,
  UserPlus,
  Eye
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export interface AnalyticsData {
  // User Statistics
  totalUsers: number;
  activeUsers: number;
  newUsersThisMonth: number;
  userRoleBreakdown: Record<string, number>;
  
  // Content Statistics
  totalPosts: number;
  totalComments: number;
  totalBlogs: number;
  totalCommunities: number;
  totalFavorites: number;
  
  // Moderation Statistics
  totalReports: number;
  pendingReports: number;
  resolvedReports: number;
  reportsByReason: Record<string, number>;
  reportsByContentType: Record<string, number>;
  
  // Engagement Metrics
  averagePostsPerUser: number;
  averageCommentsPerPost: number;
  topActiveCommunities: Array<{
    _id: string;
    title: string;
    memberCount: number;
    postCount: number;
  }>;
  
  // System Performance
  averageResponseTime: string;
  systemHealth: {
    aiService: 'online' | 'offline';
    database: 'healthy' | 'warning' | 'error';
    apiResponseTime: string;
    errorRate: string;
  };
  
  // Recent Activity
  recentActivity: Array<{
    _id: string;
    type: 'user_joined' | 'post_created' | 'comment_added' | 'report_submitted' | 'moderation_action';
    description: string;
    timestamp: string;
  }>;
  
  // Growth Metrics
  growthMetrics: {
    userGrowthRate: number;
    contentGrowthRate: number;
    engagementGrowthRate: number;
  };
}

export default function AnalyticsManagement() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('all');
  const [selectedTab, setSelectedTab] = useState('overview');

  const { toast } = useToast();

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams();
      if (timeRange !== 'all') {
        params.append('timeRange', timeRange);
      }

      const response = await fetch(`/api/admin/analytics?${params.toString()}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 401) {
          toast({
            title: 'Authentication Error',
            description: errorData.error || 'Please sign in to access this feature',
            variant: 'destructive',
          });
          return;
        } else if (response.status === 403) {
          toast({
            title: 'Permission Denied',
            description: errorData.error || 'You do not have permission to access this feature',
            variant: 'destructive',
          });
          return;
        } else {
          toast({
            title: 'Error',
            description: errorData.error || 'Failed to load analytics data',
            variant: 'destructive',
          });
          return;
        }
      }

      const data = await response.json();
      
      if (data.success) {
        setAnalyticsData(data.data);
      }
    } catch (error) {
      console.error('Error loading analytics data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load analytics data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalyticsData();
  }, [timeRange]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user_joined': return <UserPlus className="w-4 h-4 text-blue-500" />;
      case 'post_created': return <FileText className="w-4 h-4 text-green-500" />;
      case 'comment_added': return <MessageSquare className="w-4 h-4 text-purple-500" />;
      case 'report_submitted': return <Flag className="w-4 h-4 text-red-500" />;
      case 'moderation_action': return <Shield className="w-4 h-4 text-orange-500" />;
      default: return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getSystemHealthBadge = (status: string) => {
    switch (status) {
      case 'online':
      case 'healthy':
        return <Badge variant="default" className="bg-green-100 text-green-800">Online</Badge>;
      case 'warning':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Warning</Badge>;
      case 'offline':
      case 'error':
        return <Badge variant="destructive">Offline</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getReasonLabel = (reason: string) => {
    const reasonLabels: Record<string, string> = {
      inappropriate: 'Inappropriate Content',
      spam: 'Spam',
      harassment: 'Harassment',
      misinformation: 'Misinformation',
      copyright: 'Copyright Violation',
      violence: 'Violence',
      hate_speech: 'Hate Speech',
      other: 'Other'
    };
    return reasonLabels[reason] || reason;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <span className="ml-2">Loading analytics data...</span>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No analytics data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Time Range Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Analytics Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="week">Last 7 Days</SelectItem>
                <SelectItem value="month">Last 30 Days</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={loadAnalyticsData} variant="outline">
              Refresh Data
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +{analyticsData.newUsersThisMonth} this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.activeUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((analyticsData.activeUsers / analyticsData.totalUsers) * 100)}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Content</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(analyticsData.totalPosts + analyticsData.totalComments + analyticsData.totalBlogs).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Posts, comments & blogs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Reports</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.pendingReports}</div>
            <p className="text-xs text-muted-foreground">
              Need attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="moderation">Moderation</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* User Role Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  User Role Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(analyticsData.userRoleBreakdown).map(([role, count]) => (
                    <div key={role} className="flex items-center justify-between">
                      <span className="text-sm capitalize">{role.replace('_', ' ')}</span>
                      <div className="flex items-center gap-2">
                        <Progress 
                          value={(count / analyticsData.totalUsers) * 100} 
                          className="w-20" 
                        />
                        <Badge variant="secondary">{count}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Content Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="w-5 h-5" />
                  Content Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Posts
                    </span>
                    <Badge variant="secondary">{analyticsData.totalPosts}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      Comments
                    </span>
                    <Badge variant="secondary">{analyticsData.totalComments}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Blog Posts
                    </span>
                    <Badge variant="secondary">{analyticsData.totalBlogs}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Communities
                    </span>
                    <Badge variant="secondary">{analyticsData.totalCommunities}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analyticsData.recentActivity.slice(0, 5).map((activity) => (
                  <div key={activity._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      {getActivityIcon(activity.type)}
                      <div>
                        <p className="text-sm font-medium">{activity.description}</p>
                        <p className="text-xs text-gray-600">{activity.timestamp}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* User Growth */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  User Growth
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Total Users</span>
                    <Badge variant="default">{analyticsData.totalUsers}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Active Users</span>
                    <Badge variant="secondary">{analyticsData.activeUsers}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">New This Month</span>
                    <Badge variant="outline">{analyticsData.newUsersThisMonth}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Growth Rate</span>
                    <Badge variant="default">{analyticsData.growthMetrics.userGrowthRate}%</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* User Engagement */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  User Engagement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Avg Posts per User</span>
                    <Badge variant="default">{analyticsData.averagePostsPerUser}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Avg Comments per Post</span>
                    <Badge variant="secondary">{analyticsData.averageCommentsPerPost}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Total Favorites</span>
                    <Badge variant="outline">{analyticsData.totalFavorites}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Content Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Content Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Total Posts</span>
                    <Badge variant="default">{analyticsData.totalPosts}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Total Comments</span>
                    <Badge variant="secondary">{analyticsData.totalComments}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Total Blog Posts</span>
                    <Badge variant="outline">{analyticsData.totalBlogs}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Total Communities</span>
                    <Badge variant="default">{analyticsData.totalCommunities}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Content Growth */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Content Growth
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Content Growth Rate</span>
                    <Badge variant="default">{analyticsData.growthMetrics.contentGrowthRate}%</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Engagement Growth</span>
                    <Badge variant="secondary">{analyticsData.growthMetrics.engagementGrowthRate}%</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="moderation" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Moderation Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Moderation Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Total Reports</span>
                    <Badge variant="default">{analyticsData.totalReports}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Pending Reports</span>
                    <Badge variant="secondary">{analyticsData.pendingReports}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Resolved Reports</span>
                    <Badge variant="outline">{analyticsData.resolvedReports}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Reports by Reason */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Flag className="w-5 h-5" />
                  Reports by Reason
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(analyticsData.reportsByReason).map(([reason, count]) => (
                    <div key={reason} className="flex items-center justify-between">
                      <span className="text-sm">{getReasonLabel(reason)}</span>
                      <Badge variant="secondary">{count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Communities */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Top Active Communities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.topActiveCommunities.map((community) => (
                    <div key={community._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium">{community.title}</p>
                        <p className="text-xs text-gray-600">
                          {community.memberCount} members • {community.postCount} posts
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Engagement Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="w-5 h-5" />
                  Engagement Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Avg Posts per User</span>
                    <Badge variant="default">{analyticsData.averagePostsPerUser}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Avg Comments per Post</span>
                    <Badge variant="secondary">{analyticsData.averageCommentsPerPost}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Total Favorites</span>
                    <Badge variant="outline">{analyticsData.totalFavorites}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* System Health */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  System Health
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">AI Service</span>
                    {getSystemHealthBadge(analyticsData.systemHealth.aiService)}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Database</span>
                    {getSystemHealthBadge(analyticsData.systemHealth.database)}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">API Response Time</span>
                    <Badge variant="outline">{analyticsData.systemHealth.apiResponseTime}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Error Rate</span>
                    <Badge variant="secondary">{analyticsData.systemHealth.errorRate}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Average Response Time</span>
                    <Badge variant="outline">{analyticsData.averageResponseTime}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">User Growth Rate</span>
                    <Badge variant="default">{analyticsData.growthMetrics.userGrowthRate}%</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Content Growth Rate</span>
                    <Badge variant="secondary">{analyticsData.growthMetrics.contentGrowthRate}%</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Engagement Growth</span>
                    <Badge variant="outline">{analyticsData.growthMetrics.engagementGrowthRate}%</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 