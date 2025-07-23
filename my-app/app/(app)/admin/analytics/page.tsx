import { requireAdminOrTeacher } from "@/lib/auth/middleware";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  PieChart
} from "lucide-react";

// Force dynamic rendering to avoid static generation issues
export const dynamic = 'force-dynamic';

export default async function AnalyticsDashboard() {
  const user = await requireAdminOrTeacher();

  // Mock analytics data - replace with real data from Sanity
  const analyticsData = {
    totalModerations: 1250,
    allowedContent: 1100,
    flaggedContent: 120,
    blockedContent: 30,
    moderationRate: 12.0,
    averageConfidence: 0.85,
    topFlags: [
      'Inappropriate language',
      'Spam content',
      'Personal attacks',
      'Off-topic discussion',
      'Commercial promotion'
    ],
    contentTypeBreakdown: {
      post: 300,
      response: 450,
      comment: 400,
      blog: 80,
      community: 20
    },
    userRoleBreakdown: {
      user: 1000,
      teacher: 200,
      admin: 50
    },
    appealStats: {
      totalAppeals: 25,
      pendingAppeals: 8,
      approvedAppeals: 12,
      rejectedAppeals: 5,
      appealRate: 2.0
    },
    performanceMetrics: {
      accuracy: 0.92,
      falsePositives: 0.05,
      falseNegatives: 0.03,
      averageResponseTime: 1.2,
      userSatisfaction: 0.88
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Moderation Analytics</h1>
          <p className="text-gray-600 mt-2">
            Comprehensive insights into content moderation performance and trends
          </p>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Moderations</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData.totalModerations.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                All time content reviews
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Moderation Rate</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData.moderationRate}%</div>
              <p className="text-xs text-muted-foreground">
                Content flagged or blocked
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Confidence</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(analyticsData.averageConfidence * 100).toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                AI decision confidence
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Appeals</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData.appealStats.pendingAppeals}</div>
              <p className="text-xs text-muted-foreground">
                Awaiting review
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Analytics */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="content">Content Analysis</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="appeals">Appeals</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                      <span className="text-sm">Posts</span>
                      <Badge variant="secondary">{analyticsData.contentTypeBreakdown.post}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Responses</span>
                      <Badge variant="secondary">{analyticsData.contentTypeBreakdown.response}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Comments</span>
                      <Badge variant="secondary">{analyticsData.contentTypeBreakdown.comment}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Blog Posts</span>
                      <Badge variant="secondary">{analyticsData.contentTypeBreakdown.blog}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Community Questions</span>
                      <Badge variant="secondary">{analyticsData.contentTypeBreakdown.community}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Moderation Outcomes */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Moderation Outcomes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        Allowed
                      </span>
                      <Badge variant="default">{analyticsData.allowedContent}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-yellow-500" />
                        Flagged
                      </span>
                      <Badge variant="secondary">{analyticsData.flaggedContent}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm flex items-center gap-2">
                        <XCircle className="w-4 h-4 text-red-500" />
                        Blocked
                      </span>
                      <Badge variant="destructive">{analyticsData.blockedContent}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Top Flags */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Top Moderation Flags
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analyticsData.topFlags.map((flag, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium">{flag}</span>
                      <Badge variant="outline">#{index + 1}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Moderation Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-4">
                  <Select defaultValue="week">
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="day">Last 7 Days</SelectItem>
                      <SelectItem value="week">Last 4 Weeks</SelectItem>
                      <SelectItem value="month">Last 12 Months</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">Chart visualization would go here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Content Type Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Content Type Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(analyticsData.contentTypeBreakdown).map(([type, count]) => (
                      <div key={type} className="flex items-center justify-between">
                        <span className="text-sm capitalize">{type}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${(count / analyticsData.totalModerations) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600">{count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* User Role Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    User Role Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(analyticsData.userRoleBreakdown).map(([role, count]) => (
                      <div key={role} className="flex items-center justify-between">
                        <span className="text-sm capitalize">{role}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-600 h-2 rounded-full" 
                              style={{ width: `${(count / analyticsData.totalModerations) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600">{count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                      <span className="text-sm">Accuracy</span>
                      <Badge variant="default">{(analyticsData.performanceMetrics.accuracy * 100).toFixed(1)}%</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">False Positives</span>
                      <Badge variant="secondary">{(analyticsData.performanceMetrics.falsePositives * 100).toFixed(1)}%</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">False Negatives</span>
                      <Badge variant="secondary">{(analyticsData.performanceMetrics.falseNegatives * 100).toFixed(1)}%</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Avg Response Time</span>
                      <Badge variant="outline">{analyticsData.performanceMetrics.averageResponseTime}s</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">User Satisfaction</span>
                      <Badge variant="default">{(analyticsData.performanceMetrics.userSatisfaction * 100).toFixed(1)}%</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

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
                      <span className="text-sm">AI Service Status</span>
                      <Badge variant="default">Online</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Database Status</span>
                      <Badge variant="default">Healthy</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">API Response Time</span>
                      <Badge variant="outline">1.2s avg</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Error Rate</span>
                      <Badge variant="secondary">0.1%</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="appeals" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Appeal Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{analyticsData.appealStats.totalAppeals}</div>
                    <div className="text-sm text-gray-600">Total Appeals</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">{analyticsData.appealStats.pendingAppeals}</div>
                    <div className="text-sm text-gray-600">Pending</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{analyticsData.appealStats.approvedAppeals}</div>
                    <div className="text-sm text-gray-600">Approved</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{analyticsData.appealStats.rejectedAppeals}</div>
                    <div className="text-sm text-gray-600">Rejected</div>
                  </div>
                </div>
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Appeal Rate</span>
                    <span className="text-sm text-gray-600">{analyticsData.appealStats.appealRate}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${analyticsData.appealStats.appealRate}%` }}
                    ></div>
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