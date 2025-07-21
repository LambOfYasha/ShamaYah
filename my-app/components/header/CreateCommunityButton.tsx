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
import { ImageIcon, Plus, X } from "lucide-react"
import Image from "next/image"
import { Label } from "../ui/label"
import { Button } from "../ui/button"
import { createCommunityQuestion } from "@/action/createCommunityQuestion"
import { useRouter } from "next/navigation"

function CreateCommunityButton() {

  const { user } = useUser()
  const [open, setOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [description, setDescription] = useState("")
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const value = e.target.value
  setName(value)
  
  if (!slug || slug === generateSlug(name)) {
    setSlug(generateSlug(value))
  }
}

const generateSlug = (text: string) => {
  return text.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "").slice(0, 21)
}

const removeImage = () => {
  setImagePreview(null)
  setImageFile(null)
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


const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault()
}

const resetForm = () => {
  setName("")
  setSlug("")
  setDescription("")
  setImagePreview(null)
  setImageFile(null)
  if (fileInputRef.current) {
    fileInputRef.current.value = ""
  }
}

const handleCreateCommunity = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault()
  if(!name.trim()) {
    setErrorMessage("Name is required")
    return
  }

  if(!slug.trim()) {
    setErrorMessage("Slug is required")
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

        const result = await createCommunityQuestion(
  name.trim(),
  imageBase64,
  fileName,
  fileType,
  slug.trim(),
  description.trim() || undefined,
        )  

        console.log("created community:", result)
      
      if ("error" in result && result.error) {
        setErrorMessage(result.error)
      } else if ("createdCommunity" in result && result.createdCommunity) {
        setOpen(false)
        resetForm()
        router.push(`/community-questions/${result.createdCommunity.slug?.current}`)
      }} catch (err) {
          console.error("failed to create community", err)
          setErrorMessage("failed to create community")
        }
      })
}

  return (

<Dialog open={open} onOpenChange={setOpen}>
  <DialogTrigger className="w-full p-2 pl-5 flex items-center rounded-md 
  cursor-pointer bg-black text-white 
  hover:bg-black transition-all duration-200 
  disabled:text-sm disabled:opacity-50 disabled:cursor-not-allowed" disabled={!user}>
<<<<<<< HEAD
        <Plus />
        {user ? "Ask a Question" : "Sign in to ask a question"}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ask a Question</DialogTitle>
          <DialogDescription>
            Ask a question to get help from the community.
          </DialogDescription>
=======
    <Plus />
  {user ? "Ask a Question" : "Sign in to ask a Question"}
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Ask a question</DialogTitle>
      <DialogDescription>
        Share your ideas and get feedback from others in regards to Christian doctrine.
      </DialogDescription>
>>>>>>> parent of 12983e2 (update)

      <form onSubmit={handleCreateCommunity} className="space-y-4 mt-2">
        {errorMessage && (
          <div className="text-red-500 text-sm">{errorMessage}</div>
        )}

        <div className="space-y-2">
          <label htmlFor="question" className="text-sm font-medium">
            Question
          </label>
          <Input 
          id="question" 
          placeholder="What is your question?"
          className="w-full focus:ring-2 focus:ring-blue-500"
          value={name}
          onChange={handleNameChange}
          required
          minLength={3}
          maxLength={21} 
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="slug" className="text-sm font-medium">
            Community Slug (URL)
          </label>
          <Input 
          id="slug" 
          placeholder="Enter a unique slug for your question"
          className="w-full focus:ring-2 focus:ring-blue-500"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          required
          minLength={3}
          maxLength={21} 
          pattern="[a-z0-9-]*"
          title="Lowercase letters, numbers, and hyphens only"
          />
          <p className="text-sm text-gray-500">
            This will be used in the URL: shama.com/community-questions/{slug || "community-slug"}
          </p>
        </div>
        <div className="space-y-2">
          <label htmlFor="description" className="text-sm font-medium">
            Description
          </label>
          <Textarea
          id="description"
          placeholder="Enter a description for your question"
          className="w-full focus:ring-2 focus:ring-blue-500"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          minLength={10}
          maxLength={1000}
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
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center"
              >
                <X className="w-4 h-4" />
              </button>
              </div>
<<<<<<< HEAD
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
=======
            ): (
              <div className="flex items-center justify-center w-full">
                <Label htmlFor="community-image" className="flex flex-col items-center justify-center w-full
                h-24 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                  <div className="flex flex-col items-center justify-center">
                    <ImageIcon className="w-6 h-6 mb-2 text-gray-400" />
                    <p className="text-xs text-gray-500">
                      Click to upload image
                    </p>
>>>>>>> parent of 12983e2 (update)
                    </div>
                    <input 
                    id="community-image"
                    name="community-image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    ref={fileInputRef}
                    className="hidden" />
                  </Label>
                  </div>
            )}
            </div>

            <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled={isPending || !user}>Submit Question</Button>
      </form>
    </DialogHeader>
  </DialogContent>
</Dialog>  )
}

export default CreateCommunityButton