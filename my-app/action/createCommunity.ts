'use server'

export type ImageData = {
    base64: string
    fileName: string
    contentType: string
} | null


export async function createCommunity(
    name: string,
    imageBase64: string | null | undefined,
    imageFilename: string | null | undefined,
    imageContentType: string | null | undefined,
    slug: string,
    description?: string
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

const result = await createCommunity({
    name,
    imageData,
    slug,
    description,
    user._id,
})
       
    } catch (error) {
        console.error("failed to create community", error)
        return { error: "failed to create community" }
    }
}