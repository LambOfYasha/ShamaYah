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
  MessageSquare, 
  BookOpen, 
  ArrowLeft,
  Share,
  Bookmark,
  Clock,
  Eye,
  Edit
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { getCurrentUser } from "@/lib/auth/middleware";
import EditBlogButton from "@/components/blog/EditBlogButton";
import DeleteBlogButton from "@/components/blog/DeleteBlogButton";
import EmbeddedCommentSectionWrapper from "@/components/comments/EmbeddedCommentSectionWrapper";
import FavoriteButton from "@/components/ui/favorite-button";
import { editBlog } from "@/action/editBlog";
import { getImageUrl } from "@/lib/utils";
import { ReportButton } from "@/components/ui/report-button";
import RichContentRenderer from "@/components/ui/rich-content-renderer";
import { TagList } from "@/components/ui/tag";

interface BlogWithAuthor extends Omit<Blog, 'author'> {
  author?: Teacher;
  tags?: Array<{
    _id: string;
    name: string;
    slug: string;
    color: string;
  }>;
}

async function getBlog(slug: string): Promise<BlogWithAuthor | null> {
  const query = defineQuery(`
    *[_type == "blog" && slug.current == $slug && (isDeleted == false || isDeleted == null)][0] {
      _id,
      title,
      description,
      "slug": slug.current,
      content,
      image,
      author->{
        _id,
        username,
        imageURL,
        role
      },
      createdAt,
      _createdAt,
      "tags": tags[]->{
        _id,
        name,
        "slug": slug.current,
        color
      }
    }
  `);

  try {
    const result = await client.fetch(query, { slug });
    console.log("getBlog result:", result);
    return result;
  } catch (error) {
    console.error("Error fetching blog:", error);
    return null;
  }
}

export default async function BlogPage({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const { slug } = await params;
  const blog = await getBlog(slug);
  const currentUser = await getCurrentUser();

  if (!blog) {
    notFound();
  }

  // Use the same user object for permission checks
  const user = await getCurrentUser();

  console.log("Blog page - Blog ID:", blog._id);
  console.log("Blog page - Blog author ID:", blog.author?._id);
  console.log("Blog page - User ID:", user._id);
  console.log("Blog page - User role:", user.role);

  const canEdit = user && (
    user._id === blog.author?._id || 
    user.role === "admin" ||
    user.role === "teacher"
  );

  const canDelete = user && (
    user._id === blog.author?._id || 
    user.role === "admin"
  );

  console.log("Blog page - Can edit:", canEdit);
  console.log("Blog page - Can delete:", canDelete);

  // Create a properly typed blog object for the EditBlogButton
  const blogForEdit = {
    _id: blog._id,
    title: blog.title || '',
    description: blog.description || '',
    slug: {
      _type: 'slug',
      current: blog.slug || ''
    },
    content: blog.content || '',
    image: blog.image,
    tags: blog.tags || []
  };

  const handleEditBlog = async (data: {
    title: string;
    description: string;
    slug: string;
    content: string;
    imageBase64?: string;
    imageFilename?: string;
    imageContentType?: string;
    tags?: string[];
  }): Promise<void> => {
    'use server';
    
    const imageData = data.imageBase64 ? {
      base64: data.imageBase64,
      fileName: data.imageFilename!,
      contentType: data.imageContentType!,
    } : null;

    const result = await editBlog(
      blog._id,
      data.title,
      data.description,
      data.slug,
      data.content,
      imageData,
      data.tags
    );

    if ("error" in result) {
      throw new Error(result.error);
    }
  };





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
              {blog.tags && blog.tags.length > 0 && (
                <div className="mb-4">
                  <TagList tags={blog.tags} />
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              {canEdit && (
                <EditBlogButton 
                  blog={blogForEdit}
                  onEdit={handleEditBlog}
                />
              )}
              {canDelete && (
                <DeleteBlogButton 
                  blogId={blog._id}
                  blogTitle={blog.title || 'Untitled Blog'}
                />
              )}
              <Button variant="outline" size="sm">
                <Share className="w-4 h-4 mr-2" />
                Share
              </Button>
              <FavoriteButton 
                postId={blog._id}
                postType="blog"
                size="sm"
                variant="outline"
              />
              <ReportButton 
                contentId={blog._id}
                contentType="blog"
                contentTitle={blog.title}
                size="sm"
                variant="outline"
              />
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
              <RichContentRenderer 
                content={typeof blog.content === 'string' 
                  ? blog.content 
                  : blog.content.map((block: any) => 
                      block.children?.map((child: any) => child.text).join('') || ''
                    ).join('\n')
                }
                className="text-gray-700 leading-relaxed"
              />
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
                  {getImageUrl(blog.author.imageURL) ? (
                    <Image
                      src={getImageUrl(blog.author.imageURL)!}
                      alt={blog.author.username || "Author"}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="w-8 h-8 text-gray-600" />
                    </div>
                  )}
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
          <EmbeddedCommentSectionWrapper
            postId={blog._id}
            postType="blog"
          />
        </div>
      </div>
    </div>
  );
} 