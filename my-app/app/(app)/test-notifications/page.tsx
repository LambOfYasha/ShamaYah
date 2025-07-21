import { getCurrentUser } from "@/lib/auth/middleware";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, AlertTriangle, CheckCircle, Info } from "lucide-react";
import TestNotificationButton from "@/components/ui/test-notification-button";

export default async function TestNotificationsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/sign-in');
  }

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Notification System Test</h1>
          <p className="text-gray-600 mt-2">
            Test the real-time notification system. Click the button below to generate test notifications.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Test Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                Generate test notifications to see the notification icon in action. 
                The notifications will appear in the header notification icon.
              </p>
              <div className="flex gap-2">
                <TestNotificationButton />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="w-5 h-5" />
                How to Test
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-gray-600">1. Click the "Test Notification" button above</p>
                <p className="text-sm text-gray-600">2. Look for the bell icon in the header</p>
                <p className="text-sm text-gray-600">3. Click the bell icon to see notifications</p>
                <p className="text-sm text-gray-600">4. Try marking notifications as read</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Notification Types
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-sm">Error notifications</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm">Warning notifications</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Success notifications</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm">Info notifications</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Features
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm">✅ Real-time notifications</p>
                <p className="text-sm">✅ Unread count badge</p>
                <p className="text-sm">✅ Mark as read functionality</p>
                <p className="text-sm">✅ Delete notifications</p>
                <p className="text-sm">✅ Mark all as read</p>
                <p className="text-sm">✅ Auto-refresh every 30 seconds</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Moderation Dashboard</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                For more advanced notification management, visit the Advanced Moderation Dashboard.
              </p>
              <Button asChild>
                <a href="/admin/advanced-moderation">Go to Advanced Dashboard</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 