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

function CreateCommunityButton() {

  const { user } = useUser()
  const [open, setOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState(false)



  return (

<Dialog open={open} onOpenChange={setOpen}>
  <DialogTrigger className="w-full p-2 pl-5 flex items-center rounded-md 
  cursor-pointer bg-black text-white 
  hover:bg-black transition-all duration-200 
  disabled:text-sm disabled:opacity-50 disabled:cursor-not-allowed" disabled={!user}>
    <Plus />
  {user ? "Create a Community" : "Sign in to create community"}
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Create a Community</DialogTitle>
      <DialogDescription>
        Create a community to share your ideas and get feedback from others.
      </DialogDescription>

      <form>
        {errorMessage && (
          <div className="text-red-500 text-sm">{errorMessage}</div>
        )}
      </form>
    </DialogHeader>
  </DialogContent>
</Dialog>  )
}

export default CreateCommunityButton