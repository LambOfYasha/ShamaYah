import { getCurrentUser } from "@/lib/auth/middleware";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { 
  Search, 
  Users, 
  MessageSquare, 
  TrendingUp, 
  Plus,
  Eye,
  UserPlus,
  Settings
} from "lucide-react";

// Force dynamic rendering to avoid static generation issues
export const dynamic = 'force-dynamic';

export default async function CommunitiesPage() {
  const user = await getCurrentUser();

  // Mock data - replace with actual data fetching
  const myCommunities = [
    {
      _id: "1",
      name: "Biblical Studies",
      description: "Deep dive into biblical texts, interpretation, and theological discussions.",
      members: 1250,
      posts: 456,
      isModerator: false,
      joinedAt: "2024-01-10",
      category: "Theology",
    },
    {
      _id: "2",
      name: "Spiritual Life",
      description: "Sharing personal spiritual experiences and growth journeys.",
      members: 890,
      posts: 234,
      isModerator: true,
      joinedAt: "2024-01-05",
      category: "Personal Growth",
    },
  ];

  const recommendedCommunities = [
    {
      _id: "3",
      name: "Church History",
      description: "Exploring the rich history of Christianity and church development.",
      members: 2100,
      posts: 789,
      category: "History",
      isPrivate: false,
    },
    {
      _id: "4",
      name: "Theology Discussion",
      description: "Academic discussions on theological concepts and doctrines.",
      members: 1560,
      posts: 567,
      category: "Theology",
      isPrivate: false,
    },
    {
      _id: "5",
      name: "Prayer Warriors",
      description: "A community dedicated to prayer requests and spiritual support.",
      members: 3200,
      posts: 1234,
      category: "Spiritual Life",
      isPrivate: false,
    },
  ];

  const stats = {
    totalCommunities: myCommunities.length,
    totalMembers: myCommunities.reduce((sum, comm) => sum + comm.members, 0),
    totalPosts: myCommunities.reduce((sum, comm) => sum + comm.posts, 0),
  };

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Communities</h1>
            <p className="text-gray-600">Manage and discover communities</p>
          </div>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create Community
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">My Communities</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCommunities}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Members</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalMembers.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
              <MessageSquare className="h-4 w-4 text-purple-600" />
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

        {/* My Communities */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">My Communities</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {myCommunities.map((community) => (
              <Card key={community._id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{community.name}</CardTitle>
                    {community.isModerator && (
                      <Badge variant="secondary">Moderator</Badge>
                    )}
                  </div>
                  <Badge variant="outline">{community.category}</Badge>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {community.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span>{community.members.toLocaleString()} members</span>
                    <span>{community.posts} posts</span>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Link href={`/community-questions/${community._id}`}>
                      <Button size="sm" className="flex-1">
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Button>
                    </Link>
                    {community.isModerator && (
                      <Button size="sm" variant="outline">
                        <Settings className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Recommended Communities */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Recommended Communities</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendedCommunities.map((community) => (
              <Card key={community._id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{community.name}</CardTitle>
                    {community.isPrivate && (
                      <Badge variant="outline">Private</Badge>
                    )}
                  </div>
                  <Badge variant="outline">{community.category}</Badge>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {community.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span>{community.members.toLocaleString()} members</span>
                    <span>{community.posts} posts</span>
                  </div>
                  
                  <Button size="sm" className="w-full">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Join Community
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {myCommunities.length === 0 && recommendedCommunities.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No communities found</h3>
              <p className="text-gray-600 mb-4">
                Start by joining some communities or create your own
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