"use client"

import { SignedIn, SignedOut, SignInButton, UserButton,useUser } from "@clerk/nextjs"
import { Button } from "./ui/button"
import { MenuIcon } from "lucide-react"

function Header() {

    const {user} = useUser()

  return (
<header>
    {/* Left side */}
    <div>
        <MenuIcon className="h-6 w-6 gap-2" />
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