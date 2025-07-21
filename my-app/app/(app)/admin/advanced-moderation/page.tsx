import { getCurrentUser } from "@/lib/auth/middleware";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Brain,
  Shield,
  Settings,
  FileText,
  Bell,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  Activity,
  BarChart3,
  Download,
  Plus,
  Trash2,
  Edit,
  Eye
} from "lucide-react";

export default async function AdvancedModerationDashboard() {
  const user = await getCurrentUser();
  if (user.role !== 'admin' && user.role !== 'teacher') {
    redirect('/unauthorized');
  }

  // Mock data for demonstration
  const mockData = {
    customGuidelines: [
      {
        _id: 'guideline_1',
        name: 'Spam Detection',
        description: 'Detect and flag spam content',
        category: 'spam',
        severity: 'medium',
        isActive: true,
        usageCount: 45,
        successRate: 0.85
      },
      {
        _id: 'guideline_2',
        name: 'Inappropriate Language',
        description: 'Flag inappropriate or offensive language',
        category: 'language',
        severity: 'high',
        isActive: true,
        usageCount: 32,
        successRate: 0.92
      }
    ],
    notifications: [
      {
        _id: 'notif_1',
        type: 'moderation',
        title: 'Content Flagged for Review',
        message: 'A post has been flagged for review',
        severity: 'warning',
        isRead: false,
        createdAt: new Date().toISOString()
      },
      {
        _id: 'notif_2',
        type: 'appeal',
        title: 'New Appeal Submitted',
        message: 'A user has submitted an appeal',
        severity: 'info',
        isRead: false,
        createdAt: new Date().toISOString()
      }
    ],
    reports: [
      {
        id: 'report_1',
        name: 'Weekly Moderation Report',
        period: 'week',
        generatedAt: new Date().toISOString(),
        status: 'completed'
      },
      {
        id: 'report_2',
        name: 'Monthly Performance Review',
        period: 'month',
        generatedAt: new Date().toISOString(),
        status: 'pending'
      }
    ]
  };

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Advanced Moderation Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Advanced AI-powered content moderation with custom guidelines, real-time notifications, and comprehensive reporting
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Guidelines</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockData.customGuidelines.length}</div>
              <p className="text-xs text-muted-foreground">
                Custom moderation rules
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unread Notifications</CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockData.notifications.filter(n => !n.isRead).length}</div>
              <p className="text-xs text-muted-foreground">
                Pending alerts
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">AI Confidence</CardTitle>
              <Brain className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">92%</div>
              <p className="text-xs text-muted-foreground">
                Average decision confidence
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Health</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">Healthy</div>
              <p className="text-xs text-muted-foreground">
                All systems operational
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard */}
        <Tabs defaultValue="guidelines" className="space-y-6">
          <TabsList>
            <TabsTrigger value="guidelines">Custom Guidelines</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="guidelines" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Custom Moderation Guidelines</h2>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Guideline
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {mockData.customGuidelines.map((guideline) => (
                <Card key={guideline._id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{guideline.name}</CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant={guideline.isActive ? 'default' : 'secondary'}>
                          {guideline.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        <Badge variant="outline">{guideline.category}</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">{guideline.description}</p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Usage Count:</span> {guideline.usageCount}
                      </div>
                      <div>
                        <span className="font-medium">Success Rate:</span> {(guideline.successRate * 100).toFixed(1)}%
                      </div>
                      <div>
                        <span className="font-medium">Severity:</span> {guideline.severity}
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button size="sm" variant="outline">
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Button>
                      <Button size="sm" variant="outline" className="text-red-600">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Real-time Notifications</h2>
              <Button variant="outline">
                Mark All as Read
              </Button>
            </div>

            <div className="space-y-4">
              {mockData.notifications.map((notification) => (
                <Card key={notification._id} className={!notification.isRead ? 'border-l-4 border-l-blue-500' : ''}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-medium">{notification.title}</h3>
                          {!notification.isRead && (
                            <Badge variant="secondary" className="text-xs">New</Badge>
                          )}
                        </div>
                        <p className="text-gray-600 text-sm">{notification.message}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span>{new Date(notification.createdAt).toLocaleString()}</span>
                          <Badge variant="outline" className="text-xs">
                            {notification.type}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          Mark Read
                        </Button>
                        <Button size="sm" variant="outline" className="text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Advanced Reporting</h2>
              <Button>
                <Download className="w-4 h-4 mr-2" />
                Generate Report
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Report Templates
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-3 border rounded-lg">
                      <h4 className="font-medium">Executive Summary</h4>
                      <p className="text-sm text-gray-600">High-level overview for management</p>
                      <div className="flex gap-2 mt-2">
                        <Button size="sm" variant="outline">Generate</Button>
                        <Button size="sm" variant="outline">Preview</Button>
                      </div>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <h4 className="font-medium">Detailed Analysis</h4>
                      <p className="text-sm text-gray-600">Comprehensive report with all details</p>
                      <div className="flex gap-2 mt-2">
                        <Button size="sm" variant="outline">Generate</Button>
                        <Button size="sm" variant="outline">Preview</Button>
                      </div>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <h4 className="font-medium">Performance Review</h4>
                      <p className="text-sm text-gray-600">Focus on system performance metrics</p>
                      <div className="flex gap-2 mt-2">
                        <Button size="sm" variant="outline">Generate</Button>
                        <Button size="sm" variant="outline">Preview</Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Recent Reports
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockData.reports.map((report) => (
                      <div key={report.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{report.name}</h4>
                          <p className="text-sm text-gray-600">
                            {new Date(report.generatedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={report.status === 'completed' ? 'default' : 'secondary'}>
                            {report.status}
                          </Badge>
                          <Button size="sm" variant="outline">
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    AI Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="confidence-threshold">Confidence Threshold</Label>
                    <Input
                      id="confidence-threshold"
                      type="number"
                      min="0"
                      max="1"
                      step="0.1"
                      defaultValue="0.8"
                    />
                  </div>
                  <div>
                    <Label htmlFor="response-time">Max Response Time (seconds)</Label>
                    <Input
                      id="response-time"
                      type="number"
                      min="1"
                      max="10"
                      defaultValue="3"
                    />
                  </div>
                  <div>
                    <Label htmlFor="batch-size">Bulk Operation Batch Size</Label>
                    <Select defaultValue="10">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5 items</SelectItem>
                        <SelectItem value="10">10 items</SelectItem>
                        <SelectItem value="20">20 items</SelectItem>
                        <SelectItem value="50">50 items</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button className="w-full">Save Configuration</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    Notification Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Notification Types</Label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="moderation-notifications" defaultChecked />
                        <Label htmlFor="moderation-notifications">Moderation Events</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="appeal-notifications" defaultChecked />
                        <Label htmlFor="appeal-notifications">Appeal Updates</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="system-notifications" defaultChecked />
                        <Label htmlFor="system-notifications">System Alerts</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="report-notifications" />
                        <Label htmlFor="report-notifications">Report Generation</Label>
                      </div>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="notification-frequency">Notification Frequency</Label>
                    <Select defaultValue="realtime">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="realtime">Real-time</SelectItem>
                        <SelectItem value="hourly">Hourly digest</SelectItem>
                        <SelectItem value="daily">Daily digest</SelectItem>
                        <SelectItem value="weekly">Weekly digest</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button className="w-full">Save Settings</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 