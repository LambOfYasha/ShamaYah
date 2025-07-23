'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ClientRichEditor from '@/components/ui/client-rich-editor';
import { Label } from '@/components/ui/label';
import { ImageIcon, Edit, X } from 'lucide-react';
import Image from 'next/image';
import { useModeration } from '@/hooks/useModeration';
import { ModerationFeedback } from '@/components/ui/moderation-feedback';

interface Blog {
  _id: string;
  title: string;
  slug: { current: string };
  description: string;
  content: any[];
  image?: {
    asset: {
      _ref: string;
    };
  };
}

interface EditBlogButtonProps {
  blog: Blog;
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  const [title, setTitle] = useState(blog.title);
  const [slug, setSlug] = useState(blog.slug.current);
  const [description, setDescription] = useState(blog.description);
  const [content, setContent] = useState(
    blog.content?.[0]?.children?.[0]?.text || ''
  );
  
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Initialize moderation for blog content
  const {
    content: moderatedContent,
    updateContent: updateModeratedContent,
    moderationState,
    checkModeration,
    clearModeration,
    getModerationFeedback,
    canSubmit
  } = useModeration({
    contentType: 'blog',
    debounceMs: 1500,
    autoCheck: true
  });

  // Update moderated content when content changes
  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    updateModeratedContent(newContent);
  };

  // Update moderated content when description changes
  const handleDescriptionChange = (newDescription: string) => {
    setDescription(newDescription);
    // Check both content and description together
    updateModeratedContent(`${newDescription}\n\n${content}`);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTitle(value);
    
    // Auto-generate slug if it matches the original title's slug
    if (slug === blog.slug.current) {
      const newSlug = value.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '').slice(0, 50);
      setSlug(newSlug);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setImageFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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

  const resetForm = () => {
    setTitle(blog.title);
    setSlug(blog.slug.current);
    setDescription(blog.description);
    setContent(blog.content?.[0]?.children?.[0]?.text || '');
    setImagePreview(null);
    setImageFile(null);
    clearModeration();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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

    // Check if content is appropriate before submitting
    if (!canSubmit) {
      setErrorMessage("Please review the content guidelines before submitting.");
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
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Edit Blog Post</DialogTitle>
          <DialogDescription>
            Update your blog post content and settings.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2 flex-1 overflow-y-auto">
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
              <ClientRichEditor
                content={description}
                onChange={handleDescriptionChange}
                placeholder="Enter a brief description of your blog post"
                maxHeight="200px"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <ClientRichEditor
                content={content}
                onChange={handleContentChange}
                placeholder="Write your blog post content here..."
                maxHeight="400px"
              />
              
              {/* Moderation Feedback */}
              {(description.trim() || content.trim()) && (
                <div className="mt-3">
                  <ModerationFeedback
                    isChecking={moderationState.isChecking}
                    result={moderationState.result}
                    error={moderationState.error}
                    showDetails={true}
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Blog Image (Optional)
              </Label>

              {imagePreview ? (
                <div className="relative w-32 h-32 mx-auto">
                  <Image 
                    src={imagePreview}
                    alt="Blog Preview"
                    fill
                    className="object-cover rounded-lg"
                  />
                  <button 
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-center w-full">
                  <Label htmlFor="edit-blog-image" className="flex flex-col items-center justify-center w-full
                  h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                    <div className="flex flex-col items-center justify-center">
                      <ImageIcon className="w-6 h-6 mb-2 text-gray-400" />
                      <p className="text-xs text-gray-500">
                        Click to upload new image
                      </p>
                    </div>
                    <input 
                      id="edit-blog-image"
                      name="edit-blog-image"
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

            <div className="flex justify-end gap-3 flex-shrink-0 pt-4 border-t bg-white">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting || !canSubmit}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Blog Post'
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
    </Dialog>
  );
} 