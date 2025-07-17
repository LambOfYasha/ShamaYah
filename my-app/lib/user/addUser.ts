import { adminClient } from "@/sanity/lib/adminClient"
import { UserRole } from "../auth/roles"

export async function addUser({
    id,
    username,
    imageURL,
    email,
    role = 'member',
} : {
    id:string
    username:string
    imageURL:string
    email:string
    role?: UserRole
}) {
    try {
        console.log("Attempting to create user with ID:", id)
        
        // Check if admin token is available
        if (!process.env.SANITY_ADMIN_API_TOKEN) {
            throw new Error("SANITY_ADMIN_API_TOKEN is not configured")
        }

        // Create the user document with all required fields
        const user = await adminClient.createIfNotExists({
            _id: id,
            _type: "user",
            id: id, // Add the Clerk ID as a field for reference
            username,
            imageURL,
            email,
            role,
            joinedAt: new Date().toISOString(),
            isReported: false,
        })

        console.log("User created successfully in Sanity:", user._id)
        return user
    } catch (error) {
        console.error("Error creating user:", error)
        throw error
    }
}