import { adminClient } from "@/sanity/lib/adminClient"

export async function addUser({
    id,
    username,
    imageURL,
    email,
} : {
    id:string
    username:string
    imageURL:string
    email:string
}) {
    try {
        console.log("Attempting to create user with ID:", id)
        
        // Check if admin token is available
        if (!process.env.SANITY_ADMIN_API_TOKEN) {
            throw new Error("SANITY_ADMIN_API_TOKEN is not configured")
        }

        const user = await adminClient.createIfNotExists({
            _id: id,
            _type: "user",
            username,
            imageURL,
            email,
            joinedAt: new Date().toISOString(),
        })

        console.log("User created successfully:", user._id)
        return user
    } catch (error) {
        console.error("Error creating user:", error)
        throw error
    }
}