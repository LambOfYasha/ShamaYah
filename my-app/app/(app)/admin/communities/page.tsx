import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  TrendingUp, 
  MessageSquare, 
  Calendar, 
  User, 
  Search, 
  Plus,
  Eye,
  Settings,
  Edit,
  Trash2
} from "lucide-react";
import Link from "next/link";
import CreateCommunityButton from "@/components/header/CreateCommunityButton";
import DeleteCommunityButton from "@/components/community/DeleteCommunityButton";
import { deleteCommunity } from "@/action/deleteCommunity";

export default async function AdminCommunitiesPage() {
  // Mock data - replace with actual data fetching
  const communities = [
    {
      _id: "1",
      title: "Biblical Studies",
      description: "Deep dive into biblical texts, interpretation, and theological discussions.",
      moderator: {
        username: "Dr. Sarah Johnson",
        role: "teacher"
      },
      createdAt: "2024-01-15",
      status: "active",
      members: 1250,
      posts: 456,
      category: "Theology",
      isActive: true,
    },
    {
      _id: "2",
      title: "Spiritual Life",
      description: "Sharing personal spiritual experiences and growth journeys.",
      moderator: {
        username: "Pastor Michael Chen",
        role: "teacher"
      },
      createdAt: "2024-01-10",
      status: "active",
      members: 890,
      posts: 234,
      category: "Personal Growth",
      isActive: true,
    },
    {
      _id: "3",
      title: "Church History",
      description: "Exploring the rich history of Christianity and church development.",
      moderator: {
        username: "Prof. David Williams",
        role: "teacher"
      },
      createdAt: "2024-01-08",
      status: "moderated",
      members: 2100,
      posts: 789,
      category: "History",
      isActive: true,
    },
  ];

  const stats = {
    totalCommunities: communities.length,
    activeCommunities: communities.filter(comm => comm.isActive).length,
    totalMembers: communities.reduce((sum, comm) => sum + comm.members, 0),
    totalPosts: communities.reduce((sum, comm) => sum + comm.posts, 0),
  };

  const handleDeleteCommunity = async () => {
    'use server';
    // This would be implemented with actual community deletion
    // For now, we'll use a placeholder since this is mock data
    console.log('Delete community functionality would be implemented here');
  };

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Community Management</h1>
            <p className="text-gray-600">Manage communities and moderators</p>
          </div>
          <CreateCommunityButton />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Communities</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCommunities}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeCommunities}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Members</CardTitle>
              <Users className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalMembers.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
              <MessageSquare className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPosts.toLocaleString()}</div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input 
              placeholder="Search communities..." 
              className="pl-10"
            />
          </div>
        </div>

        {/* Communities */}
        <div className="space-y-4">
          {communities.map((community) => (
            <Card key={community._id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <CardTitle className="text-lg">{community.title}</CardTitle>
                      <Badge variant={community.isActive ? "default" : "secondary"}>
                        {community.status}
                      </Badge>
                      <Badge variant="outline">{community.category}</Badge>
                    </div>
                    <p className="text-gray-600 line-clamp-2">
                      {community.description}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <div className="flex items-center space-x-4">
                    <span className="flex items-center">
                      <User className="w-4 h-4 mr-1" />
                      {community.moderator.username}
                    </span>
                    <span className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {new Date(community.createdAt).toLocaleDateString()}
                    </span>
                    <span className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      {community.members} members
                    </span>
                    <span className="flex items-center">
                      <MessageSquare className="w-4 h-4 mr-1" />
                      {community.posts} posts
                    </span>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Link href={`/community-questions/${community._id}`}>
                    <Button size="sm" className="flex-1">
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </Button>
                  </Link>
                  <Button size="sm" variant="outline">
                    <Settings className="w-4 h-4 mr-2" />
                    Manage
                  </Button>
                  <Button size="sm" variant="outline">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <DeleteCommunityButton 
                    communityId={community._id}
                    communityTitle={community.title}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {communities.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No communities found</h3>
              <p className="text-gray-600 mb-4">
                Start by creating your first community
              </p>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Community
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 