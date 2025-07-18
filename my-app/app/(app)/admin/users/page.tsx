import { requireAdmin } from "@/lib/auth/middleware";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Search, Edit, Trash2, Shield } from "lucide-react";

export default async function UsersPage() {
  const user = await requireAdmin();

  // Mock data - replace with actual data fetching
  const users = [
    {
      _id: "1",
      username: "john_doe",
      email: "john@example.com",
      role: "member",
      joinedAt: "2024-01-15",
      isReported: false,
    },
    {
      _id: "2", 
      username: "jane_smith",
      email: "jane@example.com",
      role: "teacher",
      joinedAt: "2024-01-10",
      isReported: false,
    },
    {
      _id: "3",
      username: "admin_user",
      email: "admin@example.com", 
      role: "admin",
      joinedAt: "2024-01-01",
      isReported: false,
    },
  ];

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">User Management</h1>
          <Button>
            <Shield className="w-4 h-4 mr-2" />
            Add User
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input 
                  placeholder="Search users..." 
                  className="pl-10"
                />
              </div>
            </div>
            <select className="border rounded-md px-3 py-2">
              <option value="">All Roles</option>
              <option value="member">Member</option>
              <option value="teacher">Teacher</option>
              <option value="moderator">Moderator</option>
              <option value="admin">Admin</option>
            </select>
            <select className="border rounded-md px-3 py-2">
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="reported">Reported</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user._id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium">{user.username}</div>
                        <div className="text-sm text-gray-500">ID: {user._id}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>{user.joinedAt}</TableCell>
                  <TableCell>
                    <Badge variant={user.isReported ? 'destructive' : 'default'}>
                      {user.isReported ? 'Reported' : 'Active'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline" className="text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
} 