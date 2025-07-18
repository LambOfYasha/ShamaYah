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

export default async function FavoritesPage() {
  const user = await getCurrentUser();

  // Mock data - replace with actual data fetching
  const favorites = [
    {
      _id: "1",
      type: "post",
      title: "What is the significance of baptism?",
      content: "I've been studying baptism and would like to understand its theological significance...",
      author: "dr_smith",
      community: "Biblical Studies",
      savedAt: "2024-01-15",
      tags: ["baptism", "theology"],
    },
    {
      _id: "2",
      type: "comment",
      title: "Great insight on prayer",
      content: "This comment really helped me understand the power of prayer in daily life...",
      author: "jane_doe",
      community: "Spiritual Life",
      savedAt: "2024-01-14",
      tags: ["prayer", "spirituality"],
    },
    {
      _id: "3",
      type: "post",
      title: "Church history resources",
      content: "Looking for good resources on early church history...",
      author: "prof_johnson",
      community: "Church History",
      savedAt: "2024-01-13",
      tags: ["history", "resources"],
    },
  ];

  const stats = {
    totalFavorites: favorites.length,
    posts: favorites.filter(f => f.type === 'post').length,
    comments: favorites.filter(f => f.type === 'comment').length,
  };

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">My Favorites</h1>
            <p className="text-gray-600">Your saved posts and comments</p>
          </div>
          <Button variant="outline">
            <Trash2 className="w-4 h-4 mr-2" />
            Clear All
          </Button>
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
          {favorites.map((favorite) => (
            <Card key={favorite._id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      {favorite.type === 'post' ? (
                        <FileText className="w-4 h-4 text-blue-600" />
                      ) : (
                        <MessageSquare className="w-4 h-4 text-green-600" />
                      )}
                      <Badge variant="outline" className="text-xs">
                        {favorite.type}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {favorite.community}
                      </Badge>
                    </div>
                    
                    <h3 className="text-lg font-semibold mb-2">{favorite.title}</h3>
                    <p className="text-gray-600 mb-3 line-clamp-2">
                      {favorite.content}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>by {favorite.author}</span>
                        <span>•</span>
                        <span>Saved {favorite.savedAt}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <div className="flex space-x-1">
                          {favorite.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" className="text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {favorites.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Heart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No favorites yet</h3>
              <p className="text-gray-600 mb-4">
                Start saving posts and comments you find interesting
              </p>
              <Button>
                Browse Posts
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 