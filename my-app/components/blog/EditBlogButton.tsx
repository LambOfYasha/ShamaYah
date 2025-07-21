'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Edit, ImageIcon, X } from "lucide-react";
import { useState, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface BlogData {
  _id: string;
  title: string;
  description: string;
  slug: {
    _type: string;
    current: string;
  };
  content?: string;
  image?: {
    asset?: {
      _ref: string;
    };
  };
}

interface EditBlogButtonProps {
  blog: BlogData;
  onEdit: (data: {
    title: string;
    description: string;
    slug: string;
    content: string;
    imageBase64?: string;
    imageFilename?: string;
    imageContentType?: string;
  }) => Promise<void>;
}

export default function EditBlogButton({ blog, onEdit }: EditBlogButtonProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(blog.title);
  const [description, setDescription] = useState(blog.description);
  const [slug, setSlug] = useState(blog.slug?.current || '');
  const [content, setContent] = useState(blog.content || "");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const generateSlug = (text: string) => {
    return text.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "").slice(0, 50);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTitle(value);
    
    if (!slug || slug === generateSlug(blog.title)) {
      setSlug(generateSlug(value));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setImagePreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setImageFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setErrorMessage("Title is required");
      return;
    }

    if (!slug.trim()) {
      setErrorMessage("Slug is required");
      return;
    }

    if (!description.trim()) {
      setErrorMessage("Description is required");
      return;
    }

    if (!content.trim()) {
      setErrorMessage("Content is required");
      return;
    }

    setErrorMessage("");
    setIsSubmitting(true);

    try {
      let imageBase64: string | undefined;
      let fileName: string | undefined;
      let fileType: string | undefined;

      if (imageFile) {
        const reader = new FileReader();
        imageBase64 = await new Promise<string>((resolve) => {
          reader.onload = () => {
            resolve(reader.result as string);
          };
          reader.readAsDataURL(imageFile);
        });

        fileName = imageFile.name;
        fileType = imageFile.type;
      }

      await onEdit({
        title: title.trim(),
        description: description.trim(),
        slug: slug.trim(),
        content: content.trim(),
        imageBase64,
        imageFilename: fileName,
        imageContentType: fileType,
      });

      setOpen(false);
      router.refresh();
    } catch (error) {
      console.error("Failed to edit blog:", error);
      setErrorMessage("Failed to edit blog");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Edit className="w-4 h-4 mr-2" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Blog Post</DialogTitle>
          <DialogDescription>
            Update your blog post content and settings.
          </DialogDescription>

          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            {errorMessage && (
              <div className="text-red-500 text-sm">{errorMessage}</div>
            )}

            <div className="space-y-2">
              <Label htmlFor="title">Blog Title</Label>
              <Input
                id="title"
                value={title}
                onChange={handleTitleChange}
                placeholder="Enter blog title"
                required
                minLength={3}
                maxLength={100}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Blog Slug (URL)</Label>
              <Input
                id="slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="Enter a unique slug for your blog"
                required
                minLength={3}
                maxLength={50}
                pattern="[a-z0-9-]*"
                title="Lowercase letters, numbers, and hyphens only"
              />
              <p className="text-sm text-gray-500">
                This will be used in the URL: yourdomain.com/blogs/{slug || "blog-slug"}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter a brief description of your blog post"
                required
                minLength={10}
                maxLength={200}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your blog post content..."
                required
                minLength={50}
                rows={8}
              />
            </div>

            <div className="space-y-2">
              <Label>Blog Image</Label>
              <div className="space-y-4">
                {(imagePreview || blog.image) && (
                  <div className="relative">
                    <div className="relative w-full h-48 rounded-lg overflow-hidden">
                      <Image
                        src={imagePreview || `/api/sanity/image/${blog.image?.asset?._ref}`}
                        alt="Blog preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={removeImage}
                      className="absolute top-2 right-2"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}

                {!imagePreview && !blog.image && (
                  <div className="flex items-center justify-center w-full">
                    <Label htmlFor="blog-image" className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                      <div className="flex flex-col items-center justify-center">
                        <ImageIcon className="w-6 h-6 mb-2 text-gray-400" />
                        <p className="text-xs text-gray-500">
                          Click to upload image
                        </p>
                      </div>
                      <input
                        id="blog-image"
                        name="blog-image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        ref={fileInputRef}
                        className="hidden"
                      />
                    </Label>
                  </div>
                )}
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Updating..." : "Update Blog Post"}
            </Button>
          </form>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
} 