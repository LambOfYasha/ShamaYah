import { getCurrentUser } from "@/lib/auth/middleware";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Search, 
  Heart, 
  MessageSquare, 
  FileText, 
  Calendar,
  Trash2,
  Eye
} from "lucide-react";
import { getUserFavoritesAction } from "@/action/embeddedCommentActions";
import Link from "next/link";
import DeleteFavoriteButton from "@/components/ui/delete-favorite-button";
import ClearAllFavoritesButton from "@/components/ui/clear-all-favorites-button";

// Force dynamic rendering to avoid static generation issues
export const dynamic = 'force-dynamic';

export default async function FavoritesPage() {
  const user = await getCurrentUser();
  
  // Get real favorites data
  const favoritesResult = await getUserFavoritesAction();
  const favorites = favoritesResult.favorites || [];

  const stats = {
    totalFavorites: favorites.length,
    posts: favorites.filter(f => !f.commentPath).length,
    comments: favorites.filter(f => f.commentPath).length,
  };

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">My Favorites</h1>
            <p className="text-gray-600">Your saved posts and comments</p>
          </div>
          <ClearAllFavoritesButton variant="outline">
            Clear All
          </ClearAllFavoritesButton>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Favorites</CardTitle>
              <Heart className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalFavorites}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Saved Posts</CardTitle>
              <FileText className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.posts}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Saved Comments</CardTitle>
              <MessageSquare className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.comments}</div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input 
                  placeholder="Search favorites..." 
                  className="pl-10"
                />
              </div>
            </div>
            <select className="border rounded-md px-3 py-2">
              <option value="">All Types</option>
              <option value="post">Posts</option>
              <option value="comment">Comments</option>
            </select>
            <select className="border rounded-md px-3 py-2">
              <option value="">All Communities</option>
              <option value="biblical_studies">Biblical Studies</option>
              <option value="spiritual_life">Spiritual Life</option>
              <option value="church_history">Church History</option>
            </select>
          </div>
        </div>

        {/* Favorites List */}
        <div className="space-y-4">
          {favorites.map((favorite) => {
            const post = favorite.post;
            const isComment = favorite.commentPath;
            const postType = post._type === 'communityQuestion' ? 'community' : 'blog';
            const postUrl = postType === 'community' 
              ? `/community-questions/${post.slug?.current}` 
              : `/blogs/${post.slug?.current}`;
            
            return (
              <Card key={favorite._id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        {isComment ? (
                          <MessageSquare className="w-4 h-4 text-green-600" />
                        ) : (
                          <FileText className="w-4 h-4 text-blue-600" />
                        )}
                        <Badge variant="outline" className="text-xs">
                          {isComment ? 'Comment' : 'Post'}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {postType === 'community' ? 'Community' : 'Blog'}
                        </Badge>
                      </div>
                      
                      <h3 className="text-lg font-semibold mb-2">
                        <Link href={postUrl} className="hover:text-blue-600">
                          {post.title}
                        </Link>
                      </h3>
                      
                      {isComment && favorite.comment ? (
                        <div className="mb-3">
                          <p className="text-gray-700 text-sm mb-2">
                            <span className="font-medium">Comment by {favorite.comment.author.username}:</span>
                          </p>
                          <div className="bg-gray-50 p-3 rounded-md">
                            <p className="text-gray-800 text-sm">{favorite.comment.content}</p>
                          </div>
                        </div>
                      ) : (
                        <p className="text-gray-600 mb-3 line-clamp-2">
                          {post.description}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>by {post.author?.username || post.moderator?.username}</span>
                          <span>•</span>
                          <span>Saved {new Date(favorite.savedAt).toLocaleDateString()}</span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Link href={postUrl}>
                            <Button size="sm" variant="outline">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>
                          <DeleteFavoriteButton 
                            favoriteId={favorite._id}
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:text-red-700"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {favorites.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Heart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No favorites yet</h3>
              <p className="text-gray-600 mb-4">
                Start saving posts and comments you find interesting
              </p>
              <Link href="/dashboard/blogs">
                <Button>
                  Browse Posts
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 