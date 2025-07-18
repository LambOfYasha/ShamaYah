'use server'

import { getUser } from "@/lib/user/getUser"
import { createBlog } from "@/sanity/lib/blogs/createBlog"

export type ImageData = {
    base64: string
    fileName: string
    contentType: string
} | null

export async function createBlogPost(
    title: string,
    imageBase64: string | null | undefined,
    imageFilename: string | null | undefined,
    imageContentType: string | null | undefined,
    slug?: string,
    description?: string,
    content?: string
) {
    try {
        const user = await getUser()

        if ("error" in user) {
            return { error: user.error }
        }

        // Check if user has permission to create blogs (admin or teacher)
        if (user.role !== "admin" && user.role !== "teacher") {
            return { error: "You don't have permission to create blog posts" }
        }

        let imageData: ImageData = null
        if(imageBase64 && imageFilename && imageContentType) {
            imageData = {
                base64: imageBase64,
                fileName: imageFilename,
                contentType: imageContentType,
            }
        }

        const result = await createBlog(
            title,
            user._id,
            imageData,
            slug,
            description || "",
            content || ""
        )

        return result
       
    } catch (error) {
        console.error("failed to create blog", error)
        return { error: "failed to create blog" }
    }
} 