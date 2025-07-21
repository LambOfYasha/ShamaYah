import { getCurrentUser } from "@/lib/auth/middleware";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Eye,
  Clock,
  Users,
  FileText
} from "lucide-react";

export default async function ModerationDashboard() {
  const user = await getCurrentUser();

  // Check if user has admin or teacher role
  if (user.role !== 'admin' && user.role !== 'teacher') {
    redirect('/unauthorized');
  }

  // Mock data - replace with real data from Sanity
  const moderationStats = {
    totalFlagged: 12,
    pendingReview: 5,
    approvedToday: 8,
    rejectedToday: 3,
    averageResponseTime: "2.5 hours"
  };

  const recentFlags = [
    {
      id: '1',
      contentType: 'response',
      title: 'Question about baptism',
      author: 'john_doe',
      flaggedAt: '2024-01-15T10:30:00Z',
      status: 'pending',
      reason: 'Potential theological disagreement',
      confidence: 0.7
    },
    {
      id: '2',
      contentType: 'comment',
      title: 'Comment on prayer',
      author: 'jane_smith',
      flaggedAt: '2024-01-15T09:15:00Z',
      status: 'approved',
      reason: 'False positive - appropriate content',
      confidence: 0.3
    },
    {
      id: '3',
      contentType: 'post',
      title: 'Thoughts on church history',
      author: 'mike_wilson',
      flaggedAt: '2024-01-15T08:45:00Z',
      status: 'rejected',
      reason: 'Inappropriate language detected',
      confidence: 0.9
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'approved':
        return <Badge variant="default"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'response':
        return <FileText className="w-4 h-4" />;
      case 'comment':
        return <Users className="w-4 h-4" />;
      case 'post':
        return <FileText className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Moderation Dashboard</h1>
            <p className="text-gray-600 mt-2">
              Manage flagged content and moderation decisions
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-blue-600" />
            <span className="text-sm text-gray-600">
              {user.role === 'admin' ? 'Administrator' : 'Teacher'} Access
            </span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Flagged</CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{moderationStats.totalFlagged}</div>
              <p className="text-xs text-muted-foreground">
                Items requiring review
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
              <Clock className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{moderationStats.pendingReview}</div>
              <p className="text-xs text-muted-foreground">
                Awaiting decision
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved Today</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{moderationStats.approvedToday}</div>
              <p className="text-xs text-muted-foreground">
                Content approved
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rejected Today</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{moderationStats.rejectedToday}</div>
              <p className="text-xs text-muted-foreground">
                Content rejected
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList>
            <TabsTrigger value="pending">Pending Review</TabsTrigger>
            <TabsTrigger value="recent">Recent Decisions</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Pending Moderation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentFlags.filter(flag => flag.status === 'pending').map((flag) => (
                    <div key={flag.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getContentTypeIcon(flag.contentType)}
                        <div>
                          <h4 className="font-medium">{flag.title}</h4>
                          <p className="text-sm text-gray-600">
                            by {flag.author} • {new Date(flag.flaggedAt).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">{flag.reason}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-sm font-medium">
                            Confidence: {Math.round(flag.confidence * 100)}%
                          </div>
                          {getStatusBadge(flag.status)}
                        </div>
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4 mr-2" />
                          Review
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  {recentFlags.filter(flag => flag.status === 'pending').length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-600" />
                      <p>No pending items to review</p>
                      <p className="text-sm">All flagged content has been processed</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recent" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Decisions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentFlags.map((flag) => (
                    <div key={flag.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getContentTypeIcon(flag.contentType)}
                        <div>
                          <h4 className="font-medium">{flag.title}</h4>
                          <p className="text-sm text-gray-600">
                            by {flag.author} • {new Date(flag.flaggedAt).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">{flag.reason}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-sm font-medium">
                            Confidence: {Math.round(flag.confidence * 100)}%
                          </div>
                          {getStatusBadge(flag.status)}
                        </div>
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Moderation Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-4">Response Time</h4>
                    <div className="text-2xl font-bold text-blue-600">
                      {moderationStats.averageResponseTime}
                    </div>
                    <p className="text-sm text-gray-600">Average time to review</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-4">Accuracy Rate</h4>
                    <div className="text-2xl font-bold text-green-600">
                      94%
                    </div>
                    <p className="text-sm text-gray-600">AI moderation accuracy</p>
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