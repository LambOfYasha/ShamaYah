"use client"

import { SignedIn, SignedOut, SignInButton, UserButton,useUser } from "@clerk/nextjs"
import { Button } from "./ui/button"
import { ChevronLeftIcon, MenuIcon } from "lucide-react"
import { useSidebar } from "./ui/sidebar"

function Header() {

    const {user} = useUser()
    const {toggleSidebar, open, isMobile} = useSidebar()

  return (
<header className="flex items-center justify-between p-4 border-b border-gray-200">
    {/* Left side */}
    <div>
        {open ? (
            <ChevronLeftIcon className="h-6 w-6 gap-2" onClick={toggleSidebar}/>
        ) : (
            <MenuIcon className="h-6 w-6 gap-2" onClick={toggleSidebar}/>
        )}
    </div>

    {/* Right side */}
    <div>
        <SignedIn>
            <UserButton/>
        </SignedIn>
      
        <SignedOut>
                <Button asChild variant={"outline"}>
                <SignInButton mode="modal" />
                </Button>
        </SignedOut>
    </div>
</header>  
)
}

export default Header