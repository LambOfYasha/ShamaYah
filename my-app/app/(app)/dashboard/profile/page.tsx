import { getCurrentUser } from "@/lib/auth/middleware";
import { getUserStats, UserStats } from "@/lib/user/getUserStats";
import { getUserPosts, UserPost } from "@/lib/user/getUserPosts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Mail, 
  Calendar, 
  Shield, 
  Edit, 
  Save,
  Camera,
  MessageSquare,
  ThumbsUp,
  Clock,
  CheckCircle,
  XCircle
} from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  
  // Get real user statistics
  const userStatsResult = await getUserStats();
  const userStats: UserStats = "error" in userStatsResult 
    ? {
        postsCreated: 0,
        commentsMade: 0,
        communitiesJoined: 0,
        memberSince: "Unknown",
        totalLikes: 0,
        approvedResponses: 0,
        pendingResponses: 0,
      }
    : userStatsResult;

  // Get real user posts
  const userPostsResult = await getUserPosts(5);
  const recentPosts: UserPost[] = "error" in userPostsResult 
    ? []
    : userPostsResult;

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">My Profile</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Info */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Profile Information</CardTitle>
                  <Button variant="outline" size="sm">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Profile Picture */}
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
                      {user.imageURL ? (
                        <img 
                          src={user.imageURL} 
                          alt={user.username}
                          className="w-20 h-20 rounded-full object-cover"
                        />
                      ) : (
                        <User className="w-8 h-8 text-gray-600" />
                      )}
                    </div>
                    <Button size="sm" variant="outline" className="absolute -bottom-1 -right-1">
                      <Camera className="w-3 h-3" />
                    </Button>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{user.username}</h3>
                    <Badge variant="secondary" className="mt-1">
                      {user.role}
                    </Badge>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="username">Username</Label>
                    <Input id="username" defaultValue={user.username} />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" defaultValue={user.email} />
                  </div>
                  <div>
                    <Label htmlFor="role">Role</Label>
                    <Input id="role" defaultValue={user.role} disabled />
                  </div>
                  <div>
                    <Label htmlFor="joined">Joined</Label>
                    <Input id="joined" defaultValue={userStats.memberSince} disabled />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Stats & Info */}
          <div className="space-y-6">
            {/* Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-blue-500" />
                    <span>Responses Created</span>
                  </div>
                  <span className="font-semibold">{userStats.postsCreated}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-green-500" />
                    <span>Comments Made</span>
                  </div>
                  <span className="font-semibold">{userStats.commentsMade}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <ThumbsUp className="w-4 h-4 text-yellow-500" />
                    <span>Total Likes</span>
                  </div>
                  <span className="font-semibold">{userStats.totalLikes}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Approved Responses</span>
                  </div>
                  <span className="font-semibold">{userStats.approvedResponses}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-orange-500" />
                    <span>Pending Responses</span>
                  </div>
                  <span className="font-semibold">{userStats.pendingResponses}</span>
                </div>
              </CardContent>
            </Card>

            {/* Account Info */}
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">{user.email}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">Member since {userStats.memberSince}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-gray-500" />
                  <span className="text-sm capitalize">{user.role} account</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Posts */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Recent Responses</CardTitle>
          </CardHeader>
          <CardContent>
            {recentPosts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No responses yet</p>
                <p className="text-sm">Start participating in community discussions!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentPosts.map((post) => (
                  <div key={post._id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{post.title}</h4>
                        {post.isApproved ? (
                          <Badge variant="default" className="text-xs">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Approved
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">
                            <Clock className="w-3 h-3 mr-1" />
                            Pending
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">
                        {post.communityQuestion ? (
                          <>in {post.communityQuestion.title} • </>
                        ) : (
                          <>Community Response • </>
                        )}
                        {formatDistanceToNow(new Date(post.publishedAt), { addSuffix: true })}
                      </p>
                    </div>
                    <Link href={`/responses/${post._id}`}>
                      <Button size="sm" variant="outline">
                        View
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 