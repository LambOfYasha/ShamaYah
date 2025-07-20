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
import { getSanityImageUrl, validateImageFile, fileToBase64, sanitizeFilename } from "@/lib/utils";

interface CommunityData {
  _id: string;
  title: string;
  description: string;
  slug: {
    _type: string;
    current: string;
  };
  image?: {
    asset?: {
      _ref: string;
    };
  };
}

interface EditCommunityButtonProps {
  community: CommunityData;
  onEdit: (data: {
    title: string;
    description: string;
    slug: string;
    imageBase64?: string;
    imageFilename?: string;
    imageContentType?: string;
  }) => Promise<void>;
}

export default function EditCommunityButton({ community, onEdit }: EditCommunityButtonProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(community.title);
  const [description, setDescription] = useState(community.description);
  const [slug, setSlug] = useState(community.slug?.current || '');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [imageError, setImageError] = useState("");
  const [shouldRemoveImage, setShouldRemoveImage] = useState(false);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Reset state when dialog opens/closes
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      // Reset state when dialog closes
      setTitle(community.title);
      setDescription(community.description);
      setSlug(community.slug?.current || '');
      setImagePreview(null);
      setImageFile(null);
      setErrorMessage("");
      setImageError("");
      setShouldRemoveImage(false);
      setIsProcessingImage(false);
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
    
    if (!slug || slug === generateSlug(community.title)) {
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

      // Determine what to send based on the state
      if (imageFile) {
        // New image uploaded
        try {
          imageBase64 = await fileToBase64(imageFile);
          fileName = sanitizeFilename(imageFile.name);
          fileType = imageFile.type;
        } catch (error) {
          console.error("Failed to process image:", error);
          setErrorMessage("Failed to process image. Please try again.");
          setIsSubmitting(false);
          return;
        }
      } else if (shouldRemoveImage) {
        // Image should be removed - send undefined
        imageBase64 = undefined;
        fileName = undefined;
        fileType = undefined;
      }
      // If neither imageFile nor shouldRemoveImage, keep existing image unchanged

      await onEdit({
        title: title.trim(),
        description: description.trim(),
        slug: slug.trim(),
        imageBase64,
        imageFilename: fileName,
        imageContentType: fileType,
      });

      setOpen(false);
      router.refresh();
    } catch (error) {
      console.error("Failed to edit community:", error);
      setErrorMessage("Failed to edit community. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get the current image URL
  const currentImageUrl = community.image?.asset?._ref ? getSanityImageUrl(community.image.asset._ref) : null;

  // Determine what image to show
  const displayImage = imagePreview || (shouldRemoveImage ? null : currentImageUrl);

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
          <DialogTitle>Edit Community</DialogTitle>
          <DialogDescription>
            Update your community information and settings.
          </DialogDescription>

          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            {errorMessage && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
                <AlertCircle className="w-4 h-4 text-red-500" />
                <span className="text-red-700 text-sm">{errorMessage}</span>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="title">Community Title</Label>
              <Input
                id="title"
                value={title}
                onChange={handleTitleChange}
                placeholder="Enter community title"
                required
                minLength={3}
                maxLength={100}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Community Slug (URL)</Label>
              <Input
                id="slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="Enter a unique slug for your community"
                required
                minLength={3}
                maxLength={50}
                pattern="[a-z0-9-]*"
                title="Lowercase letters, numbers, and hyphens only"
              />
              <p className="text-sm text-gray-500">
                This will be used in the URL: shama.com/community-questions/{slug || "community-slug"}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Question</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ask a question"
                required
                minLength={10}
                maxLength={500}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label>Community Image</Label>
              <div className="space-y-4">
                {displayImage && (
                  <div className="relative">
                    <div className="relative w-full h-48 rounded-lg overflow-hidden">
                      <Image
                        src={displayImage}
                        alt="Community preview"
                        fill
                        className="object-cover"
                        onError={(e) => {
                          console.error("Failed to load image:", e);
                          setImageError("Failed to load image. Please try uploading again.");
                        }}
                        onLoad={() => {
                          setImageError("");
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
                    <Label htmlFor="community-image" className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
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
                        id="community-image"
                        name="community-image"
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
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Updating..." : "Update Community"}
            </Button>
          </form>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
} 