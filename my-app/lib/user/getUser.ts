import { defineQuery } from "groq"
import { client } from "@/sanity/lib/client"
import { addUser} from "./addUser"
import { currentUser } from "@clerk/nextjs/server"
import { UserWithRole, UserRole } from "../auth/roles"

const parseUsername = (username: string) => {
    const randomNum = Math.floor(1000 + Math.random() * 9000)

    //convert whitespace to camelCase and add random number to avoid conflicts
    return (
        username
        .replace(/\s+(.)/g, (_, char) => char.toUpperCase()) // Convert whitespace to camelCase
        .replace(/\s+/g, "") + randomNum // Add random number to avoid conflicts
    )
}

export async function getUser(): Promise<UserWithRole | {error: string}> {
    try {
        console.log("Getting user")
        const loggedInUser = await currentUser()

        if(!loggedInUser) {
            console.log("No user found")
            return { error: "User not found" }
        }

        console.log("User found", loggedInUser)

        // Check for both user and teacher types
        const getUserQuery = defineQuery(
            `*[_type == "user" && id == $id][0]`
        )

        const getTeacherQuery = defineQuery(
            `*[_type == "teacher" && id == $id][0]`
        )

        console.log("checking if user exists")
        
        // Check for user first
        const existingUser = await Promise.race([
            client.fetch(getUserQuery, {
                id: loggedInUser.id,
            }),
            new Promise((_, reject) => 
                setTimeout(() => reject(new Error("Query timeout")), 15000)
            )
        ]) as any

        if(existingUser?._id) {
            console.log(`User already exists with ID: ${existingUser._id}`)
            const user: UserWithRole = {
                _id: existingUser._id,
                username: existingUser.username,
                imageURL: existingUser.imageURL,
                email: existingUser.email,
                role: existingUser.role || 'member',
            }
            return user
        }

        // Check for teacher if user not found
        const existingTeacher = await Promise.race([
            client.fetch(getTeacherQuery, {
                id: loggedInUser.id,
            }),
            new Promise((_, reject) => 
                setTimeout(() => reject(new Error("Query timeout")), 15000)
            )
        ]) as any

        if(existingTeacher?._id) {
            console.log(`Teacher already exists with ID: ${existingTeacher._id}`)
            const teacher: UserWithRole = {
                _id: existingTeacher._id,
                username: existingTeacher.username,
                imageURL: existingTeacher.imageURL,
                email: existingTeacher.email,
                role: existingTeacher.role || 'teacher',
            }
            return teacher
        }

        console.log("User does not exist, creating new user")
        const newUser = await addUser( {
            id: loggedInUser.id,
            username: parseUsername(loggedInUser.fullName!),
            imageURL: loggedInUser.imageUrl,
            email: loggedInUser.primaryEmailAddress?.emailAddress || 
            loggedInUser.emailAddresses[0].emailAddress,
        })

        console.log("New user created", newUser._id)
        const user: UserWithRole = {
            _id: newUser._id,
            username: newUser.username!,
            imageURL: newUser.imageURL,
            email: newUser.email,
            role: newUser.role || 'member',
        }

        return user

    } catch (error) {
        console.error("Error getting user", error)
        
        // Provide more specific error messages
        if (error instanceof Error) {
            if (error.message.includes("timeout")) {
                return { error: "Network timeout - please check your internet connection" }
            }
            if (error.message.includes("permission")) {
                return { error: "Permission denied - please check your Sanity API token" }
            }
            if (error.message.includes("SANITY_ADMIN_API_TOKEN")) {
                return { error: "Sanity admin token not configured - please set SANITY_ADMIN_API_TOKEN" }
            }
        }
        
        return { error: "Error getting user" }
    }
}
