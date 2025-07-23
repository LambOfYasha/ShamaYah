import { requireAdminOrTeacher } from "@/lib/auth/middleware";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Users, 
  TrendingUp,
  FileText
} from "lucide-react";

// Force dynamic rendering to avoid static generation issues
export const dynamic = 'force-dynamic';

export default async function ModerationDashboard() {
  const user = await requireAdminOrTeacher();

  // Mock data - replace with real data from Sanity
  const moderationStats = {
    totalReports: 24,
    pendingReports: 8,
    resolvedReports: 16,
    averageResolutionTime: '2.3 hours',
    topReportedContent: 'Community Questions',
    recentActivity: [
      { type: 'report', content: 'Inappropriate comment', status: 'pending', time: '2 hours ago' },
      { type: 'approval', content: 'Teacher response', status: 'approved', time: '4 hours ago' },
      { type: 'report', content: 'Spam post', status: 'resolved', time: '6 hours ago' },
    ]
  };

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Content Moderation</h1>
              <p className="text-gray-600 mt-2">
                Review and manage reported content and community guidelines
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-600" />
              <span className="text-sm text-gray-600">
                {user.role === 'admin' ? 'Administrator' : user.role === 'lead_teacher' ? 'Lead Teacher' : user.role === 'senior_teacher' ? 'Senior Teacher' : user.role === 'junior_teacher' ? 'Junior Teacher' : 'Teacher'} Access
              </span>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{moderationStats.totalReports}</div>
              <p className="text-xs text-muted-foreground">
                +12% from last week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Reports</CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{moderationStats.pendingReports}</div>
              <p className="text-xs text-muted-foreground">
                Need attention
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resolved Reports</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{moderationStats.resolvedReports}</div>
              <p className="text-xs text-muted-foreground">
                {Math.round((moderationStats.resolvedReports / moderationStats.totalReports) * 100)}% resolution rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Resolution Time</CardTitle>
              <Clock className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{moderationStats.averageResolutionTime}</div>
              <p className="text-xs text-muted-foreground">
                Target: 4 hours
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                Pending Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Review and take action on pending reports
              </p>
              <Button className="w-full">
                Review Reports
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                Guidelines
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Manage community guidelines and policies
              </p>
              <Button className="w-full">
                Manage Guidelines
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                View moderation analytics and trends
              </p>
              <Button className="w-full">
                View Analytics
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {moderationStats.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    {activity.type === 'report' ? (
                      <AlertTriangle className="h-4 w-4 text-orange-600" />
                    ) : (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    )}
                    <div>
                      <p className="font-medium">{activity.content}</p>
                      <p className="text-sm text-gray-600">{activity.time}</p>
                    </div>
                  </div>
                  <Badge variant={activity.status === 'pending' ? 'secondary' : activity.status === 'approved' ? 'default' : 'destructive'}>
                    {activity.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 