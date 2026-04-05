'use server'

import { getUser } from "@/lib/user/getUser"
import { createCommunity } from "@/sanity/lib/communties/createCommunity"

export type ImageData = {
    base64: string
    fileName: string
    contentType: string
} | null

export async function createCommunityQuestion(
    {
        name,
        imageBase64,
        imageFilename,
        imageContentType,
        slug,
        description,
        content,
    }: {
        name: string
        imageBase64?: string | null
        imageFilename?: string | null
        imageContentType?: string | null
        slug?: string
        description?: string
        content?: string
    }
) {
    try {
        const user = await getUser()

        if ("error" in user) {
            return { error: user.error }
        }

        let imageData: ImageData = null
        if(imageBase64 && imageFilename && imageContentType) {
            imageData = {
                base64: imageBase64,
                fileName: imageFilename,
                contentType: imageContentType,
            }
        }

        const result = await createCommunity(
            name,
            user._id,
            imageData,
            slug,
            description || "",
            content || ""
        )

        return result

    } catch (error) {
        console.error("failed to create community", error)
        return { error: "failed to create community" }
    }
}