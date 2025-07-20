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
import { Edit, ImageIcon, X, AlertCircle } from "lucide-react";
import { useState, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { getSanityImageUrl, validateImageFile, fileToBase64, sanitizeFilename, testImageProcessing } from "@/lib/utils";

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
  const [imageError, setImageError] = useState("");
  const [shouldRemoveImage, setShouldRemoveImage] = useState(false);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [imageLoadError, setImageLoadError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Reset state when dialog opens/closes
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      // Reset state when dialog closes
      setTitle(blog.title);
      setDescription(blog.description);
      setSlug(blog.slug?.current || '');
      setContent(blog.content || "");
      setImagePreview(null);
      setImageFile(null);
      setErrorMessage("");
      setImageError("");
      setShouldRemoveImage(false);
      setIsProcessingImage(false);
      setImageLoadError(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

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

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (file) {
      // Clear previous errors and reset removal flag
      setImageError("");
      setShouldRemoveImage(false);
      setIsProcessingImage(true);
      
      console.log("Image file selected:", {
        name: file.name,
        size: file.size,
        type: file.type
      });

      // Test image processing first
      const testResult = await testImageProcessing(file);
      if (!testResult.success) {
        setImageError(testResult.error || "Image processing test failed");
        setIsProcessingImage(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        return;
      }
      
      // Validate the file
      const validation = validateImageFile(file);
      if (!validation.isValid) {
        setImageError(validation.error || "Invalid image file");
        setIsProcessingImage(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        return;
      }
      
      try {
        // Convert to base64
        const base64 = await fileToBase64(file);
        setImageFile(file);
        setImagePreview(base64);
        setIsProcessingImage(false);
        console.log("Image processed successfully");
      } catch (error) {
        console.error("Failed to process image:", error);
        setImageError("Failed to process image. Please try again.");
        setIsProcessingImage(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setImageFile(null);
    setImageError("");
    setShouldRemoveImage(true);
    setIsProcessingImage(false);
    setImageLoadError(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setErrorMessage("");
    
    // Validate required fields
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

    // Validate slug format
    const slugRegex = /^[a-z0-9-]+$/;
    if (!slugRegex.test(slug)) {
      setErrorMessage("Slug can only contain lowercase letters, numbers, and hyphens");
      return;
    }

    setErrorMessage("");
    setIsSubmitting(true);

    try {
      let imageBase64: string | undefined;
      let fileName: string | undefined;
      let fileType: string | undefined;

      console.log("handleSubmit - Current state:", {
        hasImageFile: !!imageFile,
        shouldRemoveImage,
        hasImagePreview: !!imagePreview
      });

      // Determine what to send based on the state
      if (imageFile) {
        // New image uploaded
        console.log("Processing new image upload");
        try {
          imageBase64 = await fileToBase64(imageFile);
          fileName = sanitizeFilename(imageFile.name);
          fileType = imageFile.type;
          console.log("Image processed successfully:", { fileName, fileType });
        } catch (error) {
          console.error("Failed to process image:", error);
          setErrorMessage("Failed to process image. Please try again.");
          setIsSubmitting(false);
          return;
        }
      } else if (shouldRemoveImage) {
        // Image should be removed - send null
        console.log("Removing image");
        imageBase64 = null;
        fileName = null;
        fileType = null;
      } else {
        // Keep existing image unchanged - send undefined
        console.log("Keeping existing image unchanged");
        imageBase64 = undefined;
        fileName = undefined;
        fileType = undefined;
      }

      console.log("Sending to onEdit:", {
        title: title.trim(),
        hasImageBase64: !!imageBase64,
        imageFilename: fileName,
        imageContentType: fileType
      });

      await onEdit({
        title: title.trim(),
        description: description.trim(),
        slug: slug.trim(),
        content: content.trim(),
        imageBase64,
        imageFilename: fileName,
        imageContentType: fileType,
      });

      console.log("onEdit completed successfully");
      setOpen(false);
      router.refresh();
    } catch (error) {
      console.error("Failed to edit blog:", error);
      setErrorMessage("Failed to edit blog. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get the current image URL
  const currentImageUrl = blog.image?.asset?._ref ? getSanityImageUrl(blog.image.asset._ref) : null;

  // Determine what image to show
  const displayImage = imageLoadError ? null : (imagePreview || (shouldRemoveImage ? null : currentImageUrl));

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
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
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
                <AlertCircle className="w-4 h-4 text-red-500" />
                <span className="text-red-700 text-sm">{errorMessage}</span>
              </div>
            )}

            {isSubmitting && (
              <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <div className="w-4 h-4 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin"></div>
                <span className="text-blue-700 text-sm">
                  {imageFile ? "Uploading image and updating blog..." : "Updating blog..."}
                </span>
              </div>
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
                {displayImage && (
                  <div className="relative">
                    <div className="relative w-full h-48 rounded-lg overflow-hidden">
                      <Image
                        src={displayImage}
                        alt="Blog preview"
                        fill
                        className="object-cover"
                        onError={(e) => {
                          console.error("Failed to load image:", e);
                          setImageError("Failed to load image. Please try uploading again.");
                          setImageLoadError(true);
                        }}
                        onLoad={() => {
                          setImageError("");
                          setImageLoadError(false);
                        }}
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

                {!displayImage && (
                  <div className="flex items-center justify-center w-full">
                    <Label htmlFor="blog-image" className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                      <div className="flex flex-col items-center justify-center">
                        {isProcessingImage ? (
                          <>
                            <div className="w-6 h-6 mb-2 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                            <p className="text-xs text-gray-500">Processing image...</p>
                          </>
                        ) : (
                          <>
                            <ImageIcon className="w-6 h-6 mb-2 text-gray-400" />
                            <p className="text-xs text-gray-500">
                              Click to upload image
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              Max 5MB • JPEG, PNG, WebP, GIF
                            </p>
                          </>
                        )}
                      </div>
                      <input
                        id="blog-image"
                        name="blog-image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        ref={fileInputRef}
                        className="hidden"
                        disabled={isProcessingImage}
                      />
                    </Label>
                  </div>
                )}

                {imageError && (
                  <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded-md">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    <span className="text-red-700 text-sm">{imageError}</span>
                  </div>
                )}
                {imageLoadError && (
                  <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded-md">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    <span className="text-red-700 text-sm">Failed to load image. Please try uploading again.</span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setImageLoadError(false)}
                      className="ml-auto"
                    >
                      Retry
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting || isProcessingImage}
            >
              {isSubmitting ? "Updating..." : isProcessingImage ? "Processing Image..." : "Update Blog Post"}
            </Button>
          </form>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
} 