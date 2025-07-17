import { requireAdmin } from "@/lib/auth/middleware";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { Button } from "@/components/ui/button";

export default async function AdminPage() {
  const user = await requireAdmin();

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* User Management */}
          <RoleGuard permission="canManageUsers">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">User Management</h2>
              <p className="text-gray-600 mb-4">
                Manage user accounts and permissions
              </p>
              <Button>Manage Users</Button>
            </div>
          </RoleGuard>

          {/* Teacher Management */}
          <RoleGuard permission="canManageTeachers">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Teacher Management</h2>
              <p className="text-gray-600 mb-4">
                Manage teacher accounts and specializations
              </p>
              <Button>Manage Teachers</Button>
            </div>
          </RoleGuard>

          {/* Content Moderation */}
          <RoleGuard permission="canModerate">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Content Moderation</h2>
              <p className="text-gray-600 mb-4">
                Review and moderate community content
              </p>
              <Button>Moderate Content</Button>
            </div>
          </RoleGuard>

          {/* Community Management */}
          <RoleGuard permission="canCreateCommunities">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Community Management</h2>
              <p className="text-gray-600 mb-4">
                Create and manage community questions
              </p>
              <Button>Manage Communities</Button>
            </div>
          </RoleGuard>

          {/* Analytics */}
          <RoleGuard permission="canAccessAdminPanel">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Analytics</h2>
              <p className="text-gray-600 mb-4">
                View platform analytics and insights
              </p>
              <Button>View Analytics</Button>
            </div>
          </RoleGuard>

          {/* System Settings */}
          <RoleGuard permission="canAccessAdminPanel">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">System Settings</h2>
              <p className="text-gray-600 mb-4">
                Configure system-wide settings
              </p>
              <Button>System Settings</Button>
            </div>
          </RoleGuard>
        </div>

        {/* User Info */}
        <div className="mt-8 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Current User</h2>
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
        </div>
      </div>
    </div>
  );
} 