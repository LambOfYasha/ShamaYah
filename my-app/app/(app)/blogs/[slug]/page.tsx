import { notFound } from "next/navigation";
import { client } from "@/sanity/lib/client";
import { defineQuery } from "groq";
import { Blog, Teacher } from "@/sanity.types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Calendar, 
  User, 
  MessageCircle, 
  BookOpen, 
  ArrowLeft,
  Share,
  Bookmark,
  Clock,
  Eye
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface BlogWithAuthor extends Blog {
  author: Teacher;
}

async function getBlog(slug: string): Promise<BlogWithAuthor | null> {
  const query = defineQuery(`
    *[_type == "blog" && slug.current == $slug][0] {
      ...,
      "author": author->
    }
  `);

  try {
    const result = await client.fetch(query, { slug });
    return result;
  } catch (error) {
    console.error("Error fetching blog:", error);
    return null;
  }
}

export default async function BlogPage({ 
  params 
}: { 
  params: { slug: string } 
}) {
  const blog = await getBlog(params.slug);

  if (!blog) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/dashboard/blogs">
            <Button variant="ghost" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Blogs
            </Button>
          </Link>
        </div>

        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {blog.title}
              </h1>
              <p className="text-gray-600 text-lg mb-4">
                {blog.description}
              </p>
              
              {/* Meta Information */}
              <div className="flex items-center gap-6 text-sm text-gray-500 mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {new Date(blog.createdAt || blog._createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>5 min read</span>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  <span>1.2k views</span>
                </div>
                {blog.author && (
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>By {blog.author.username}</span>
                  </div>
                )}
              </div>

              {/* Tags/Categories */}
              <div className="flex gap-2 mb-4">
                <Badge variant="secondary">Teaching</Badge>
                <Badge variant="secondary">Education</Badge>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Share className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" size="sm">
                <Bookmark className="w-4 h-4 mr-2" />
                Save
              </Button>
            </div>
          </div>

          {/* Blog Image */}
          {blog.image && (
            <div className="relative w-full h-64 rounded-lg overflow-hidden mb-6">
              <Image
                src={`https://cdn.sanity.io/images/${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}/${process.env.NEXT_PUBLIC_SANITY_DATASET}/${blog.image.asset?._ref?.replace('image-', '').replace('-jpg', '.jpg').replace('-png', '.png')}`}
                alt={blog.title || "Blog image"}
                fill
                className="object-cover"
              />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="prose max-w-none">
            {blog.content ? (
              <div className="text-gray-700 leading-relaxed">
                {/* Render content blocks */}
                {blog.content.map((block: any, index: number) => (
                  <div key={index} className="mb-4">
                    {block.children?.map((child: any, childIndex: number) => (
                      <span key={childIndex}>{child.text}</span>
                    ))}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">
                This blog post is currently being written. Check back soon for the full content!
              </p>
            )}
          </div>
        </div>

        {/* Author Section */}
        {blog.author && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center gap-4">
              {blog.author.imageURL && (
                <div className="relative w-16 h-16 rounded-full overflow-hidden">
                  <Image
                    src={blog.author.imageURL}
                    alt={blog.author.username || "Author"}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div>
                <h3 className="font-semibold text-lg">{blog.author.username}</h3>
                <p className="text-gray-600 text-sm">
                  {blog.author.role === "teacher" ? "Teacher" : "Author"}
                </p>
                <p className="text-gray-500 text-sm">
                  Published on {new Date(blog.createdAt || blog._createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Comments Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Comments</h2>
            <Button>
              <MessageCircle className="w-4 h-4 mr-2" />
              Add Comment
            </Button>
          </div>
          
          {/* Placeholder for comments */}
          <div className="text-center py-8 text-gray-500">
            <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No comments yet. Be the first to share your thoughts!</p>
          </div>
        </div>
      </div>
    </div>
  );
} 