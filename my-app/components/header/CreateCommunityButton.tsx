'use client'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog"

import React, { useState } from 'react'
import { useUser } from '@clerk/nextjs' 
import { Plus } from "lucide-react"
import { Input } from "../ui/input"

function CreateCommunityButton() {

  const { user } = useUser()
  const [open, setOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")

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

  return (

<Dialog open={open} onOpenChange={setOpen}>
  <DialogTrigger className="w-full p-2 pl-5 flex items-center rounded-md 
  cursor-pointer bg-black text-white 
  hover:bg-black transition-all duration-200 
  disabled:text-sm disabled:opacity-50 disabled:cursor-not-allowed" disabled={!user}>
    <Plus />
  {user ? "Ask a Question" : "Sign in to ask a Question"}
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Ask a question</DialogTitle>
      <DialogDescription>
        Share your ideas and get feedback from others in regards to Christian doctrine.
      </DialogDescription>

      <form>
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
      </form>
    </DialogHeader>
  </DialogContent>
</Dialog>  )
}

export default CreateCommunityButton