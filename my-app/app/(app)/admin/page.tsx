import { requireAdmin } from "@/lib/auth/middleware";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { 
  Users, 
  GraduationCap, 
  Shield, 
  MessageSquare, 
  BarChart3, 
  Settings,
  ArrowRight,
  BookOpen,
  Flag,
  Tag
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminPage() {
  const user = await requireAdmin();

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* User Management */}
          <RoleGuard permission="canManageUsers">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  <CardTitle>User Management</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Manage user accounts and permissions
                </p>
                <Button asChild className="w-full">
                  <Link href="/admin/users">
                    Manage Users
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </RoleGuard>

          {/* Teacher Management */}
          <RoleGuard permission="canManageTeachers">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <GraduationCap className="h-5 w-5 text-green-600" />
                  <CardTitle>Teacher Management</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Manage teacher accounts and specializations
                </p>
                <Button asChild className="w-full">
                  <Link href="/admin/teachers">
                    Manage Teachers
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </RoleGuard>

          {/* Content Moderation */}
          <RoleGuard permission="canModerate">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-orange-600" />
                  <CardTitle>Content Moderation</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Review and moderate community content
                </p>
                <Button asChild className="w-full">
                  <Link href="/admin/moderation">
                    Moderate Content
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </RoleGuard>

          {/* Reports Management */}
          <RoleGuard permission="canModerate">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Flag className="h-5 w-5 text-red-600" />
                  <CardTitle>Reports</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Review and manage user-submitted reports
                </p>
                <Button asChild className="w-full">
                  <Link href="/admin/reports">
                    View Reports
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </RoleGuard>

          {/* Community Management */}
          <RoleGuard permission="canCreateCommunities">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <MessageSquare className="h-5 w-5 text-purple-600" />
                  <CardTitle>Community Management</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Create and manage community questions
                </p>
                <Button asChild className="w-full">
                  <Link href="/admin/communities">
                    Manage Communities
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </RoleGuard>

          {/* Blog Management */}
          <RoleGuard permission="canManageBlogs">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <BookOpen className="h-5 w-5 text-emerald-600" />
                  <CardTitle>Blog Management</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Create and manage blog posts and articles
                </p>
                <Button asChild className="w-full">
                  <Link href="/admin/blogs">
                    Manage Blogs
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </RoleGuard>

          {/* Tags Management */}
          <RoleGuard permission="canManageBlogs">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Tag className="h-5 w-5 text-purple-600" />
                  <CardTitle>Tags Management</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Create and manage tags for blog posts
                </p>
                <Button asChild className="w-full">
                  <Link href="/admin/tags">
                    Manage Tags
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </RoleGuard>

          {/* Analytics */}
          <RoleGuard permission="canAccessAdminPanel">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5 text-indigo-600" />
                  <CardTitle>Analytics</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  View platform analytics and insights
                </p>
                <Button asChild className="w-full">
                  <Link href="/admin/analytics">
                    View Analytics
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </RoleGuard>

          {/* System Settings */}
          <RoleGuard permission="canAccessAdminPanel">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Settings className="h-5 w-5 text-gray-600" />
                  <CardTitle>System Settings</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Configure system-wide settings
                </p>
                <Button asChild className="w-full">
                  <Link href="/admin/settings">
                    System Settings
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </RoleGuard>
        </div>

        {/* User Info */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Current User</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-medium">Username:</label>
                <p className="text-gray-600">{user.username}</p>
              </div>
              <div>
                <label className="font-medium">Role:</label>
                <p className="text-gray-600 capitalize">{user.role}</p>
              </div>
              <div>
                <label className="font-medium">Email:</label>
                <p className="text-gray-600">{user.email}</p>
              </div>
              <div>
                <label className="font-medium">User ID:</label>
                <p className="text-gray-600">{user._id}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 