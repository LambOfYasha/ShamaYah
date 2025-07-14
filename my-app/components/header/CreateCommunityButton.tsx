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

const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setName(e.target.value)
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
      </form>
    </DialogHeader>
  </DialogContent>
</Dialog>  )
}

export default CreateCommunityButton