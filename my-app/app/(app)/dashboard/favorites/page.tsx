import { getUserFavorites } from "@/lib/user/getUserFavorites";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { 
  Heart, 
  Eye, 
  User, 
  Calendar,
  ThumbsUp,
  MessageSquare,
  ArrowLeft,
  Trash2,
  AlertCircle
} from "lucide-react";

export default async function FavoritesPage() {
  const favorites = await getUserFavorites(50);
  
  if ('error' in favorites) {
    return (
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
            <h2 className="text-xl font-semibold mb-2">Unable to Load Favorites</h2>
            <p className="text-gray-600 mb-4">{favorites.error}</p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

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
                <h1 className="text-3xl font-bold mb-2">My Favorites</h1>
                <p className="text-gray-600">Posts you've saved for later</p>
              </div>
            </div>
            <Badge variant="outline" className="flex items-center gap-1">
              <Heart className="w-3 h-3" />
              {favorites.length} favorites
            </Badge>
          </div>
        </div>

        {/* Favorites List */}
        <div className="space-y-4">
          {favorites.length > 0 ? (
            favorites.map((favorite) => (
              <Card key={favorite._id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-semibold">{favorite.post.title}</h3>
                        <Badge variant="secondary" className="text-xs">
                          <Heart className="w-3 h-3 mr-1" />
                          Favorited
                        </Badge>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                        <div className="flex items-center space-x-1">
                          <User className="w-4 h-4" />
                          <span>{favorite.post.author?.username || 'Unknown Author'}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(favorite.post.publishedAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Eye className="w-4 h-4" />
                          <span>{favorite.post.viewCount || 0} views</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MessageSquare className="w-4 h-4" />
                          <span>{favorite.post.commentCount || 0} comments</span>
                        </div>
                      </div>
                      
                      <p className="text-xs text-gray-400">
                        Favorited on {new Date(favorite.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/responses/${favorite.post.slug?.current || favorite.post._id}`}>
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Link>
                      </Button>
                      <Button size="sm" variant="outline">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-12">
                <div className="text-center">
                  <Heart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-semibold mb-2">No favorites yet</h3>
                  <p className="text-gray-600 mb-6">
                    Start exploring content and save your favorite posts here
                  </p>
                  <Button asChild>
                    <Link href="/search">
                      Explore Content
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
} 