import { defineQuery } from "groq"
import { sanityFetch } from "@/sanity/lib/live"
import { addUser} from "./addUser"
import { currentUser } from "@clerk/nextjs/server"

interface UserResult {
    _id: string
    username: string
    imageUrl: string
    email: string
}


const parseUsername = (username: string) => {
    const randomNum = Math.floor(1000 + Math.random() * 9000)

    //convert whitespace to camelCase and add random number to avoid conflicts
    return (
        username
        .replace(/\s+/g, (_, char) => char.toUpperCase()) // Convert whitespace to camelCase
        .replace(/\s+/g, "") + randomNum // Add random number to avoid conflicts
    )
}

export async function getUser(): Promise<UserResult | {error: string}> {
    try {
        console.log("Getting user")
        const loggedInUser = await currentUser()

        if(!loggedInUser) {
            console.log("No user found")
            return { error: "User not found" }
    }

    console.log("User found", loggedInUser)

    const getExistingUserQuery = defineQuery (

        `*[_type == "user" && id == $id][0]`,
)

console.log("checking if user exists")
const existingUser = await sanityFetch({
    query: getExistingUserQuery,
    params: {
        id: loggedInUser.id,
    },
})

if(existingUser.data?._id) {
    console.log(`User already exists with ID:  ${existingUser.data._id}`)
    const user = {
    _id: existingUser.data._id,
    username: existingUser.data.username,
    imageUrl: existingUser.data.imageUrl,
    email: existingUser.data.email,
    }

    return user
 
}

console.log("User does not exist, creating new user")
const newUser = await addUser( {
    _id: loggedInUser.id,
    username: parseUsername(loggedInUser.fullName!),
    imageUrl: loggedInUser.imageUrl,
    email: loggedInUser.primaryEmailAddress?.emailAddress || 
    loggedInUser.emailAddresses[0].emailAddress,
})

console.log("New user created", newUser._id)
const user = {
    _id: newUser._id,
    username: newUser.username!,
    imageUrl: newUser.imageUrl,
    email: newUser.email,
}

return user


} catch (error) {
    console.error("Error getting user", error)
    return { error: "Error getting user" }
  
}
}
