'use client'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog"

import React, { useState, useRef, useTransition } from 'react'
import { useUser } from '@clerk/nextjs' 
import { Input } from "../ui/input"
import { Textarea } from "../ui/textarea"
import { ImageIcon, Plus, X, BookOpen } from "lucide-react"
import Image from "next/image"
import { Label } from "../ui/label"
import { Button } from "../ui/button"
import { createBlogPost } from "@/action/createBlog"
import { useRouter } from "next/navigation"
import { useModeration } from "@/hooks/useModeration"
import { ModerationFeedback } from "@/components/ui/moderation-feedback"

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
  const router = useRouter()

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
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
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
          content.trim()
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
      <DialogTrigger className="w-full p-2 pl-5 flex items-center rounded-md 
  cursor-pointer bg-black text-white 
  hover:bg-black transition-all duration-200 
  disabled:text-sm disabled:opacity-50 disabled:cursor-not-allowed" disabled={!user}>
        <Plus />
        {user ? "Create Blog Post" : "Sign in to create blog post"}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create a Blog Post</DialogTitle>
          <DialogDescription>
            Share your knowledge and insights with the community through a blog post.
          </DialogDescription>

          <form onSubmit={handleCreateBlog} className="space-y-4 mt-2">
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
                className="w-full focus:ring-2 focus:ring-blue-500"
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
                This will be used in the URL: shama.com/blogs/{slug || "blog-slug"}
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                Description
              </label>
              <Textarea
                id="description"
                placeholder="Enter a brief description of your blog post"
                className="w-full focus:ring-2 focus:ring-blue-500"
                value={description}
                onChange={handleDescriptionChange}
                required
                minLength={10}
                maxLength={200}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="content" className="text-sm font-medium">
                Content
              </label>
              <Textarea
                id="content"
                placeholder="Write your blog post content here..."
                className="w-full focus:ring-2 focus:ring-blue-500"
                value={content}
                onChange={handleContentChange}
                required
                minLength={50}
                maxLength={10000}
                rows={8}
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
                  <Label htmlFor="blog-image" className="flex flex-col items-center justify-center w-full
                  h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
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

            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
              disabled={isPending || !user || !canSubmit}
            >
              {isPending ? "Creating..." : "Create Blog Post"}
            </Button>
          </form>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}

export default CreateBlogButton 