import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, 
  TrendingUp, 
  Eye, 
  Calendar, 
  User, 
  Search, 
  Plus,
  Trash2
} from "lucide-react";
import Link from "next/link";
import CreateBlogButton from "@/components/header/CreateBlogButton";
import EditBlogButton from "@/components/blog/EditBlogButton";
import DeleteBlogButton from "@/components/blog/DeleteBlogButton";
import { deleteBlog } from "@/action/deleteBlog";

export default async function AdminBlogsPage() {
  // Mock data - replace with actual data fetching
  const blogs = [
    {
      _id: "1",
      title: "Understanding Biblical Hermeneutics",
      description: "A comprehensive guide to interpreting biblical texts with proper methodology and historical context.",
      slug: {
        _type: "slug",
        current: "understanding-biblical-hermeneutics"
      },
      content: [
        {
          _type: "block",
          children: [
            {
              _type: "span",
              text: "Blog content here..."
            }
          ]
        }
      ],
      author: {
        username: "Dr. Sarah Johnson",
        role: "teacher"
      },
      createdAt: "2024-01-15",
      status: "published",
      views: 1250,
      category: "Biblical Studies",
      isPublished: true,
    },
    {
      _id: "2",
      title: "The Role of Prayer in Christian Life",
      description: "Exploring the importance of prayer and its transformative power in the believer's journey.",
      slug: {
        _type: "slug",
        current: "role-of-prayer-christian-life"
      },
      content: [
        {
          _type: "block",
          children: [
            {
              _type: "span",
              text: "Blog content here..."
            }
          ]
        }
      ],
      author: {
        username: "Pastor Michael Chen",
        role: "teacher"
      },
      createdAt: "2024-01-10",
      status: "draft",
      views: 0,
      category: "Spiritual Life",
      isPublished: false,
    },
    {
      _id: "3",
      title: "Church History: The Early Church Fathers",
      description: "An examination of the early church fathers and their contributions to Christian theology.",
      slug: {
        _type: "slug",
        current: "church-history-early-fathers"
      },
      content: [
        {
          _type: "block",
          children: [
            {
              _type: "span",
              text: "Blog content here..."
            }
          ]
        }
      ],
      author: {
        username: "Prof. David Williams",
        role: "teacher"
      },
      createdAt: "2024-01-08",
      status: "published",
      views: 890,
      category: "Church History",
      isPublished: true,
    },
  ];

  const stats = {
    totalBlogs: blogs.length,
    publishedBlogs: blogs.filter(blog => blog.isPublished).length,
    totalViews: blogs.reduce((sum, blog) => sum + blog.views, 0),
    draftBlogs: blogs.filter(blog => !blog.isPublished).length,
  };

  const handleDeleteBlog = async () => {
    'use server';
    // This would be implemented with actual blog deletion
    // For now, we'll use a placeholder since this is mock data
    console.log('Delete blog functionality would be implemented here');
  };

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Blog Management</h1>
            <p className="text-gray-600">Manage blog posts and content</p>
          </div>
          <CreateBlogButton />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
              <BookOpen className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalBlogs}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Published</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.publishedBlogs}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Views</CardTitle>
              <Eye className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalViews.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Drafts</CardTitle>
              <Calendar className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.draftBlogs}</div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input 
              placeholder="Search blog posts..." 
              className="pl-10"
            />
          </div>
        </div>

        {/* Blog Posts */}
        <div className="space-y-4">
          {blogs.map((blog) => (
            <Card key={blog._id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <CardTitle className="text-lg">{blog.title}</CardTitle>
                      <Badge variant={blog.isPublished ? "default" : "secondary"}>
                        {blog.status}
                      </Badge>
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
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Link href={`/blogs/${blog._id}`}>
                    <Button size="sm" className="flex-1">
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </Button>
                  </Link>
                  <EditBlogButton 
                    blog={blog}
                  />
                  <DeleteBlogButton 
                    blogId={blog._id}
                    blogTitle={blog.title}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {blogs.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No blog posts found</h3>
              <p className="text-gray-600 mb-4">
                Start by creating your first blog post
              </p>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Blog Post
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 