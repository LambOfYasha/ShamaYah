import { getCurrentUser } from "@/lib/auth/middleware";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { 
  Settings,
  User,
  Bell,
  Shield,
  Palette,
  ArrowLeft,
  Edit,
  Save,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Calendar,
  Activity
} from "lucide-react";

// Force dynamic rendering to avoid static generation issues
export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const user = await getCurrentUser();

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Link>
              </Button>
              <div>
                <h1 className="text-3xl font-bold mb-2">Settings</h1>
                <p className="text-gray-600">Manage your account and preferences</p>
              </div>
            </div>
            <Badge variant="outline" className="flex items-center gap-1">
              <Activity className="w-3 h-3" />
              {user.role}
            </Badge>
          </div>
        </div>

        {/* Settings Content */}
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-4">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={user.imageURL} />
                    <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">{user.username}</h3>
                    <p className="text-gray-600">{user.email}</p>
                    <p className="text-sm text-gray-500">Member since {new Date(user.joinedAt).toLocaleDateString()}</p>
                  </div>
                  <Button variant="outline">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Username</label>
                    <p className="text-gray-600">{user.username}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Email</label>
                    <p className="text-gray-600">{user.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Role</label>
                    <Badge variant="outline">{user.role}</Badge>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Account Status</label>
                    <Badge variant="default">Active</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Notification Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Email Notifications</h4>
                      <p className="text-sm text-gray-600">Receive notifications via email</p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-2" />
                      Enabled
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Push Notifications</h4>
                      <p className="text-sm text-gray-600">Receive notifications in browser</p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-2" />
                      Enabled
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Content Moderation</h4>
                      <p className="text-sm text-gray-600">Notifications about content moderation</p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-2" />
                      Enabled
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Community Updates</h4>
                      <p className="text-sm text-gray-600">Updates from communities you follow</p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-2" />
                      Enabled
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="privacy" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Privacy Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Profile Visibility</h4>
                      <p className="text-sm text-gray-600">Who can see your profile</p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-2" />
                      Public
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Activity Status</h4>
                      <p className="text-sm text-gray-600">Show when you're online</p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-2" />
                      Enabled
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Content Visibility</h4>
                      <p className="text-sm text-gray-600">Who can see your posts</p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-2" />
                      Public
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Data Collection</h4>
                      <p className="text-sm text-gray-600">Allow analytics and tracking</p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-2" />
                      Enabled
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appearance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  Appearance Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Theme</h4>
                      <p className="text-sm text-gray-600">Choose your preferred theme</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Light
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Font Size</h4>
                      <p className="text-sm text-gray-600">Adjust text size</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Medium
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Compact Mode</h4>
                      <p className="text-sm text-gray-600">Use compact layout</p>
                    </div>
                    <Button variant="outline" size="sm">
                      <EyeOff className="w-4 h-4 mr-2" />
                      Disabled
                    </Button>
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