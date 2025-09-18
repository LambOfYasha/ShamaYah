'use client'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog"

import React, { useState, useRef, useTransition, useEffect } from 'react'
import { useUser } from '@clerk/nextjs' 
import { Input } from "../ui/input"
import ClientRichEditor from "../ui/client-rich-editor"
import { ImageIcon, Plus, X, BookOpen } from "lucide-react"
import Image from "next/image"
import { Label } from "../ui/label"
import { Button } from "../ui/button"
import { createBlogPost } from "@/action/createBlog"
import { useRouter } from "next/navigation"
import { useModeration } from "@/hooks/useModeration"
import { ModerationFeedback } from "@/components/ui/moderation-feedback"
import { TagSelector } from "@/components/ui/tag-selector"

function CreateBlogButton() {

  const { user } = useUser()
  const [open, setOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [title, setTitle] = useState("")
  const [slug, setSlug] = useState("")
  const [description, setDescription] = useState("")
  const [content, setContent] = useState("")
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [isPending, startTransition] = useTransition()
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [availableTags, setAvailableTags] = useState<Array<{_id: string; name: string; slug: string; color: string; description?: string}>>([])
  const router = useRouter()

  // Fetch available tags when dialog opens
  useEffect(() => {
    if (open) {
      fetch('/api/tags')
        .then(res => res.json())
        .then(data => {
          if (data.tags) {
            setAvailableTags(data.tags)
          }
        })
        .catch(err => console.error('Failed to fetch tags:', err))
    }
  }, [open])

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
    contentType: 'post',
    debounceMs: 1500,
    autoCheck: true
  });

  // Update moderated content when content changes
  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    updateModeratedContent(newContent);
  };

  // Update moderated content when description changes
  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newDescription = e.target.value;
    setDescription(newDescription);
    // Check both content and description together
    updateModeratedContent(`${newDescription}\n\n${content}`);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setTitle(value)
    
    if (!slug || slug === generateSlug(title)) {
      setSlug(generateSlug(value))
    }
  }

  const generateSlug = (text: string) => {
    return text.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "").slice(0, 50)
  }

  const removeImage = () => {
    setImagePreview(null)
    setImageFile(null)
    clearModeration()
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onload = () => {
        const result = reader.result as string
        setImagePreview(result)
      } 
      reader.readAsDataURL(file)
    }
  }

  const resetForm = () => {
    setTitle("")
    setSlug("")
    setDescription("")
    setContent("")
    setImagePreview(null)
    setImageFile(null)
    setSelectedTags([])
    clearModeration()
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleCreateBlog = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if(!title.trim()) {
      setErrorMessage("Title is required")
      return
    }

    if(!slug.trim()) {
      setErrorMessage("Slug is required")
      return
    }

    if(!description.trim()) {
      setErrorMessage("Description is required")
      return
    }

    if(!content.trim()) {
      setErrorMessage("Content is required")
      return
    }

    // Check if content is appropriate before submitting
    if (!canSubmit) {
      setErrorMessage("Please review the content guidelines before submitting.")
      return
    }

    setErrorMessage("")

    startTransition(async () => {
      try {
        let imageBase64: string | null = null
        let fileName: string | null = null
        let fileType: string | null = null

        if(imageFile) {
          const reader = new FileReader()
          imageBase64 = await new Promise<string>((resolve) => {
            reader.onload = () => {
              resolve(reader.result as string)
            }
            reader.readAsDataURL(imageFile)
          })

          fileName = imageFile.name
          fileType = imageFile.type
        }

        const result = await createBlogPost(
          title.trim(),
          imageBase64,
          fileName,
          fileType,
          slug.trim(),
          description.trim(),
          content.trim(),
          selectedTags
        )  

        console.log("created blog:", result)
        
        if ("error" in result && result.error) {
          setErrorMessage(result.error)
        } else if ("createdBlog" in result && result.createdBlog) {
          setOpen(false)
          resetForm()
          router.push(`/blogs/${result.createdBlog.slug?.current}`)
        }
      } catch (err) {
        console.error("failed to create blog", err)
        setErrorMessage("failed to create blog")
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div className="w-full p-2 pl-5 flex items-center rounded-md 
        cursor-pointer bg-primary text-primary-foreground 
        hover:bg-primary/90 transition-all duration-200"
  aria-disabled={!user}
  tabIndex={user ? 0 : -1}
  style={{
    opacity: user ? 1 : 0.5,
    pointerEvents: user ? "auto" : "none",
    fontSize: user ? undefined : "0.875rem",
    cursor: user ? "pointer" : "not-allowed"
  }}>
          <BookOpen className="mr-2 h-4 w-4" />
          <span>{user ? "Create Blog Post" : "Sign in to create blog post"}</span>
        </div>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Create a Blog Post</DialogTitle>
          <DialogDescription>
            Share your knowledge and insights with the community through a blog post.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleCreateBlog} className="space-y-4 mt-2 flex-1 overflow-y-auto">
            {errorMessage && (
              <div className="text-red-500 text-sm">{errorMessage}</div>
            )}

            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">
                Blog Title
              </label>
              <Input 
                id="title" 
                placeholder="Enter your blog post title"
                className="w-full focus:ring-2 focus:ring-ring"
                value={title}
                onChange={handleTitleChange}
                required
                minLength={3}
                maxLength={100} 
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="slug" className="text-sm font-medium">
                Blog Slug (URL)
              </label>
              <Input 
                id="slug" 
                placeholder="Enter a unique slug for your blog post"
                className="w-full focus:ring-2 focus:ring-ring"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                required
                minLength={3}
                maxLength={50} 
                pattern="[a-z0-9-]*"
                title="Lowercase letters, numbers, and hyphens only"
              />
              <p className="text-sm text-muted-foreground">
                This will be used in the URL: shama.com/blogs/{slug || "blog-slug"}
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={handleDescriptionChange}
                placeholder="Enter a brief description of your blog post"
                className="w-full p-3 border rounded-md focus:ring-2 focus:ring-ring focus:border-ring resize-none"
                rows={3}
                maxLength={500}
              />
              <p className="text-sm text-muted-foreground">
                {description.length}/500 characters
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="content" className="text-sm font-medium">
                Content
              </label>
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
              <TagSelector
                selectedTags={selectedTags}
                onTagsChange={setSelectedTags}
                availableTags={availableTags}
                label="Tags (Optional)"
              />
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
                    className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full w-6 h-6 flex items-center justify-center"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-center w-full">
                  <Label htmlFor="blog-image" className="flex flex-col items-center justify-center w-full
                  h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted hover:bg-muted/80">
                    <div className="flex flex-col items-center justify-center">
                      <ImageIcon className="w-6 h-6 mb-2 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">
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

            <div className="flex-shrink-0 pt-4 border-t bg-background">
              <Button 
                type="submit" 
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
                disabled={isPending || !user || !canSubmit}
              >
                {isPending ? "Creating..." : "Create Blog Post"}
              </Button>
            </div>
          </form>
        </DialogContent>
    </Dialog>
  )
}

export default CreateBlogButton 