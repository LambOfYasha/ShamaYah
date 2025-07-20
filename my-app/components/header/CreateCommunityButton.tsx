'use client';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, ImageIcon, X, AlertCircle } from "lucide-react";
import { useState, useRef, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { createCommunityQuestion } from "@/action/createCommunityQuestion";
import { validateImageFile, fileToBase64, sanitizeFilename } from "@/lib/utils";

function CreateCommunityButton() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [imageError, setImageError] = useState("");
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { user } = useUser();

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setName(value);
    
    if (!slug || slug === generateSlug(name)) {
      setSlug(generateSlug(value));
    }
  };

  const generateSlug = (text: string) => {
    return text.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "").slice(0, 50);
  };

  const removeImage = () => {
    setImagePreview(null);
    setImageFile(null);
    setImageError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (file) {
      // Clear previous errors
      setImageError("");
      
      // Validate the file
      const validation = validateImageFile(file);
      if (!validation.isValid) {
        setImageError(validation.error || "Invalid image file");
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
      } catch (error) {
        console.error("Failed to process image:", error);
        setImageError("Failed to process image. Please try again.");
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    }
  };

  const resetForm = () => {
    setName("");
    setSlug("");
    setDescription("");
    setImagePreview(null);
    setImageFile(null);
    setImageError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleCreateCommunity = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Clear previous errors
    setErrorMessage("");
    
    // Validate required fields
    if (!name.trim()) {
      setErrorMessage("Name is required");
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

    startTransition(async () => {
      try {
        let imageBase64: string | null = null;
        let fileName: string | null = null;
        let fileType: string | null = null;

        if (imageFile) {
          try {
            imageBase64 = await fileToBase64(imageFile);
            fileName = sanitizeFilename(imageFile.name);
            fileType = imageFile.type;
          } catch (error) {
            console.error("Failed to process image:", error);
            setErrorMessage("Failed to process image. Please try again.");
            return;
          }
        }

        const result = await createCommunityQuestion(
          name.trim(),
          imageBase64,
          fileName,
          fileType,
          slug.trim(),
          description.trim()
        );

        console.log("created community:", result);
        
        if ("error" in result && result.error) {
          setErrorMessage(result.error);
        } else if ("createdCommunity" in result && result.createdCommunity) {
          setOpen(false);
          resetForm();
          router.push(`/community-questions/${result.createdCommunity.slug?.current}`);
        }
      } catch (err) {
        console.error("failed to create community", err);
        setErrorMessage("Failed to create community. Please try again.");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="w-full p-2 pl-5 flex items-center rounded-md 
  cursor-pointer bg-black text-white 
  hover:bg-black transition-all duration-200 
  disabled:text-sm disabled:opacity-50 disabled:cursor-not-allowed" disabled={!user}>
        <Plus />
        {user ? "Ask a Question" : "Sign in to ask a question"}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ask a Question</DialogTitle>
          <DialogDescription>
            Ask a question to get help from the community.
          </DialogDescription>

          <form onSubmit={handleCreateCommunity} className="space-y-4 mt-2">
            {errorMessage && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
                <AlertCircle className="w-4 h-4 text-red-500" />
                <span className="text-red-700 text-sm">{errorMessage}</span>
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Community Name
              </label>
              <Input 
                id="name" 
                placeholder="Enter your community name"
                className="w-full focus:ring-2 focus:ring-blue-500"
                value={name}
                onChange={handleNameChange}
                required
                minLength={3}
                maxLength={100} 
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="slug" className="text-sm font-medium">
                Community Slug (URL)
              </label>
              <Input 
                id="slug" 
                placeholder="Enter a unique slug for your community"
                className="w-full focus:ring-2 focus:ring-blue-500"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
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
              <label htmlFor="description" className="text-sm font-medium">
                Question
              </label>
              <Textarea
                id="description"
                placeholder="Ask a question"
                className="w-full focus:ring-2 focus:ring-blue-500"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                minLength={10}
                maxLength={500}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Community Image (Optional)
              </Label>

              {imagePreview ? (
                <div className="relative w-24 h-24 mx-auto">
                  <Image 
                    src={imagePreview}
                    alt="Community Preview"
                    fill
                    className="object-cover rounded-full"
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
                  <Label htmlFor="community-image" className="flex flex-col items-center justify-center w-full
                  h-24 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                    <div className="flex flex-col items-center justify-center">
                      <ImageIcon className="w-6 h-6 mb-2 text-gray-400" />
                      <p className="text-xs text-gray-500">
                        Click to upload image
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Max 5MB • JPEG, PNG, WebP, GIF
                      </p>
                    </div>
                    <input 
                      id="community-image"
                      name="community-image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      ref={fileInputRef}
                      className="hidden" 
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

            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
              disabled={isPending || !user}
            >
              {isPending ? "Creating..." : "Create Community"}
            </Button>
          </form>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}

export default CreateCommunityButton;