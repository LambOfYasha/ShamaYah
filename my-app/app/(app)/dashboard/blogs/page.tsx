import { getCurrentUser } from "@/lib/auth/middleware";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Filter, 
  BookOpen, 
  User, 
  Calendar, 
  Eye, 
  Heart, 
  MessageSquare, 
  Share2 
} from "lucide-react";
import Link from "next/link";
import CreateBlogButton from "@/components/header/CreateBlogButton";

export default async function MemberBlogsPage() {
  const user = await getCurrentUser();

  // Mock data - replace with actual data fetching
  const featuredBlogs = [
    {
      _id: "1",
      title: "Understanding the Trinity",
      description: "A comprehensive guide to understanding the complex nature of the Trinity and its significance in Christian theology.",
      author: {
        username: "Dr. Sarah Johnson",
        role: "teacher"
      },
      createdAt: "2024-01-15",
      category: "Theology",
      views: 1250,
      likes: 89,
      comments: 23,
      isLiked: true,
      isSaved: false,
    },
    {
      _id: "2",
      title: "The Power of Prayer in Daily Life",
      description: "How to integrate prayer into your daily routine and experience its transformative power in your spiritual journey.",
      author: {
        username: "Pastor Michael Chen",
        role: "teacher"
      },
      createdAt: "2024-01-05",
      category: "Spiritual Life",
      views: 432,
      likes: 28,
      comments: 12,
      isLiked: false,
      isSaved: true,
    },
  ];

  const recentBlogs = [
    {
      _id: "3",
      title: "Biblical Interpretation Methods",
      description: "Learn about different approaches to interpreting biblical texts and their historical context.",
      author: {
        username: "Prof. David Wilson",
        role: "teacher"
      },
      createdAt: "2024-01-10",
      category: "Biblical Studies",
      views: 890,
      likes: 45,
      comments: 18,
      isLiked: false,
      isSaved: false,
    },
    {
      _id: "4",
      title: "Christian Living in the Digital Age",
      description: "Navigating faith and technology in today's connected world while maintaining spiritual values.",
      author: {
        username: "Rev. Lisa Thompson",
        role: "teacher"
      },
      createdAt: "2024-01-08",
      category: "Christian Living",
      views: 567,
      likes: 32,
      comments: 15,
      isLiked: true,
      isSaved: true,
    },
  ];

  const categories = [
    "All",
    "Biblical Studies",
    "Spiritual Life", 
    "Church History",
    "Theology",
    "Christian Living"
  ];

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Blog</h1>
            <p className="text-gray-600">Discover insightful articles and teachings</p>
          </div>
         <div className="flex items-center gap-2">
          {(user.role === "admin" || user.role === "teacher") && (
            <CreateBlogButton />
          )}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input 
                placeholder="Search blog posts..." 
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Badge 
                key={category} 
                variant={category === "All" ? "default" : "outline"}
                className="cursor-pointer hover:bg-gray-100"
              >
                {category}
              </Badge>
            ))}
          </div>
        </div>

        {/* Featured Blogs */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Featured Articles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {featuredBlogs.map((blog) => (
              <Card key={blog._id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline">{blog.category}</Badge>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <span className="flex items-center">
                        <Eye className="w-4 h-4 mr-1" />
                        {blog.views}
                      </span>
                      <span className="flex items-center">
                        <Heart className="w-4 h-4 mr-1" />
                        {blog.likes}
                      </span>
                    </div>
                  </div>
                  <CardTitle className="text-xl mb-2">{blog.title}</CardTitle>
                  <p className="text-gray-600 line-clamp-3">
                    {blog.description}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-2" />
                      {blog.author.username}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      {new Date(blog.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Link href={`/blogs/${blog._id}`}>
                      <Button size="sm" className="flex-1">
                        <BookOpen className="w-4 h-4 mr-2" />
                        Read More
                      </Button>
                    </Link>
                    <Button size="sm" variant="outline">
                      <Heart className={`w-4 h-4 ${blog.isLiked ? 'text-red-500 fill-current' : ''}`} />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Blogs */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Recent Articles</h2>
          <div className="space-y-4">
            {recentBlogs.map((blog) => (
              <Card key={blog._id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <CardTitle className="text-lg">{blog.title}</CardTitle>
                        <Badge variant="outline">{blog.category}</Badge>
                      </div>
                      <p className="text-gray-600 line-clamp-2">
                        {blog.description}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center space-x-4">
                      <span className="flex items-center">
                        <User className="w-4 h-4 mr-1" />
                        {blog.author.username}
                      </span>
                      <span className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(blog.createdAt).toLocaleDateString()}
                      </span>
                      <span className="flex items-center">
                        <Eye className="w-4 h-4 mr-1" />
                        {blog.views} views
                      </span>
                      <span className="flex items-center">
                        <MessageSquare className="w-4 h-4 mr-1" />
                        {blog.comments} comments
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Link href={`/blogs/${blog._id}`}>
                      <Button size="sm" className="flex-1">
                        <BookOpen className="w-4 h-4 mr-2" />
                        Read Article
                      </Button>
                    </Link>
                    <Button size="sm" variant="outline">
                      <Heart className={`w-4 h-4 ${blog.isLiked ? 'text-red-500 fill-current' : ''}`} />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Empty State */}
        {featuredBlogs.length === 0 && recentBlogs.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No blog posts found</h3>
              <p className="text-gray-600 mb-4">
                Check back later for new articles and teachings
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 