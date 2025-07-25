import { getCurrentUser } from "@/lib/auth/middleware";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TagList } from "@/components/ui/tag";
import Link from "next/link";
import { 
  Search, 
  Filter, 
  TrendingUp, 
  Clock, 
  Star,
  Users,
  BookOpen,
  Eye,
  Calendar,
  Plus,
  ArrowRight,
  Flame,
  Bookmark,
  User,
  Activity,
  FileText,
  ThumbsUp
} from "lucide-react";
import { getBlogs } from "@/sanity/lib/blogs/getBlogs";
import CreateBlogButton from "@/components/header/CreateBlogButton";
import BlogsClient from "./blogs-client";
import { formatDistanceToNow } from "date-fns";
import { getImageUrl, calculateReadTime } from "@/lib/utils";

// Force dynamic rendering to avoid static generation issues
export const dynamic = 'force-dynamic';

interface BlogPost {
  _id: string;
  title: string;
  description: string;
  slug: string;
  content: any[];
  viewCount?: number;
  author: {
    _id: string;
    username: string;
    imageURL?: string;
  };
  createdAt: string;
  image?: {
    asset: {
      _ref: string;
    };
    alt?: string;
  };
  tags?: Array<{
    _id: string;
    name: string;
    slug: string;
    color: string;
  }>;
}

export default async function BlogsPage() {
  const user = await getCurrentUser();
  const blogs = await getBlogs();

  // Separate blogs into different categories
  const featuredBlogs = blogs.slice(0, 3);
  const recentBlogs = blogs.slice(0, 6);
  const popularBlogs = blogs.slice(0, 4);

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Blog Articles</h1>
              <p className="text-gray-600">Discover insightful articles and teachings</p>
            </div>
            <div className="flex items-center gap-2">
              {user && (user.role === "admin" || user.role === "teacher" || user.role === "junior_teacher" || user.role === "senior_teacher" || user.role === "lead_teacher") && (
                <CreateBlogButton />
              )}
            </div>
          </div>
        </div>

        <BlogsClient>
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Articles</CardTitle>
                <BookOpen className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{blogs.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                <Eye className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {blogs.reduce((total, blog) => total + (blog.viewCount || 0), 0).toLocaleString()}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">This Month</CardTitle>
                <Calendar className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {blogs.filter(blog => {
                    const createdAt = new Date(blog.createdAt);
                    const now = new Date();
                    return createdAt.getMonth() === now.getMonth() && 
                           createdAt.getFullYear() === now.getFullYear();
                  }).length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Featured</CardTitle>
                <Star className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{featuredBlogs.length}</div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All Articles</TabsTrigger>
            <TabsTrigger value="featured">Featured</TabsTrigger>
            <TabsTrigger value="recent">Recent</TabsTrigger>
            <TabsTrigger value="popular">Popular</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {blogs.map((blog) => (
                <Card key={blog._id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs">
                        <Clock className="w-3 h-3 mr-1" />
                        {formatDistanceToNow(new Date(blog.createdAt), { addSuffix: true })}
                      </Badge>
                      <div className="flex items-center space-x-1">
                        <Eye className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-500">
                          {blog.viewCount?.toLocaleString() || '0'} views
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-start space-x-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={blog.author.imageURL} />
                        <AvatarFallback>{blog.author.username.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <Link href={`/blogs/${blog.slug}`}>
                          <h3 className="font-semibold text-lg mb-2 hover:text-blue-600 transition-colors">
                            {blog.title}
                          </h3>
                        </Link>
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                          {blog.description}
                        </p>
                        {blog.tags && blog.tags.length > 0 && (
                          <div className="mb-3">
                            <TagList tags={blog.tags} />
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <User className="w-3 h-3 text-gray-400" />
                            <span className="text-xs text-gray-500">
                              {blog.author.username}
                            </span>
                            <span className="text-xs text-gray-400">•</span>
                            <span className="text-xs text-gray-500">
                              {calculateReadTime(blog.content).formatted}
                            </span>
                          </div>
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/blogs/${blog.slug}`}>
                              <ArrowRight className="w-4 h-4" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="featured" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredBlogs.map((blog) => (
                <Card key={blog._id} className="hover:shadow-md transition-shadow border-2 border-yellow-200">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Badge variant="default" className="text-xs bg-yellow-100 text-yellow-800">
                        <Star className="w-3 h-3 mr-1" />
                        Featured
                      </Badge>
                      <div className="flex items-center space-x-1">
                        <Eye className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-500">
                          {blog.viewCount?.toLocaleString() || '0'} views
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-start space-x-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={blog.author.imageURL} />
                        <AvatarFallback>{blog.author.username.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <Link href={`/blogs/${blog.slug}`}>
                          <h3 className="font-semibold text-lg mb-2 hover:text-blue-600 transition-colors">
                            {blog.title}
                          </h3>
                        </Link>
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                          {blog.description}
                        </p>
                        {blog.tags && blog.tags.length > 0 && (
                          <div className="mb-3">
                            <TagList tags={blog.tags} />
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <User className="w-3 h-3 text-gray-400" />
                            <span className="text-xs text-gray-500">
                              {blog.author.username}
                            </span>
                            <span className="text-xs text-gray-400">•</span>
                            <span className="text-xs text-gray-500">
                              {calculateReadTime(blog.content).formatted}
                            </span>
                          </div>
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/blogs/${blog.slug}`}>
                              <ArrowRight className="w-4 h-4" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="recent" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentBlogs.map((blog) => (
                <Card key={blog._id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs">
                        <Clock className="w-3 h-3 mr-1" />
                        {formatDistanceToNow(new Date(blog.createdAt), { addSuffix: true })}
                      </Badge>
                      <div className="flex items-center space-x-1">
                        <Eye className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-500">
                          {blog.viewCount?.toLocaleString() || '0'} views
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-start space-x-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={blog.author.imageURL} />
                        <AvatarFallback>{blog.author.username.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <Link href={`/blogs/${blog.slug}`}>
                          <h3 className="font-semibold text-lg mb-2 hover:text-blue-600 transition-colors">
                            {blog.title}
                          </h3>
                        </Link>
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                          {blog.description}
                        </p>
                        {blog.tags && blog.tags.length > 0 && (
                          <div className="mb-3">
                            <TagList tags={blog.tags} />
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <User className="w-3 h-3 text-gray-400" />
                            <span className="text-xs text-gray-500">
                              {blog.author.username}
                            </span>
                            <span className="text-xs text-gray-400">•</span>
                            <span className="text-xs text-gray-500">
                              {calculateReadTime(blog.content).formatted}
                            </span>
                          </div>
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/blogs/${blog.slug}`}>
                              <ArrowRight className="w-4 h-4" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="popular" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {popularBlogs.map((blog) => (
                <Card key={blog._id} className="hover:shadow-md transition-shadow border-2 border-orange-200">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Badge variant="default" className="text-xs bg-orange-100 text-orange-800">
                        <Flame className="w-3 h-3 mr-1" />
                        Popular
                      </Badge>
                      <div className="flex items-center space-x-1">
                        <Eye className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-500">
                          {blog.viewCount?.toLocaleString() || '0'} views
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-start space-x-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={blog.author.imageURL} />
                        <AvatarFallback>{blog.author.username.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <Link href={`/blogs/${blog.slug}`}>
                          <h3 className="font-semibold text-lg mb-2 hover:text-blue-600 transition-colors">
                            {blog.title}
                          </h3>
                        </Link>
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                          {blog.description}
                        </p>
                        {blog.tags && blog.tags.length > 0 && (
                          <div className="mb-3">
                            <TagList tags={blog.tags} />
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <User className="w-3 h-3 text-gray-400" />
                            <span className="text-xs text-gray-500">
                              {blog.author.username}
                            </span>
                            <span className="text-xs text-gray-400">•</span>
                            <span className="text-xs text-gray-500">
                              {calculateReadTime(blog.content).formatted}
                            </span>
                          </div>
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/blogs/${blog.slug}`}>
                              <ArrowRight className="w-4 h-4" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Empty State */}
        {blogs.length === 0 && (
          <Card>
            <CardContent className="p-12">
              <div className="text-center">
                <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-semibold mb-2">No articles yet</h3>
                <p className="text-gray-600 mb-6">
                  Be the first to publish an insightful article
                </p>
                {user && (user.role === "admin" || user.role === "teacher" || user.role === "junior_teacher" || user.role === "senior_teacher" || user.role === "lead_teacher") && (
                  <CreateBlogButton />
                )}
              </div>
            </CardContent>
          </Card>
        )}
        </BlogsClient>
      </div>
    </div>
  );
} 