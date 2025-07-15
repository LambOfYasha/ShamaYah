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
       
    } catch (error) {
        console.error("failed to create community", error)
        return { error: "failed to create community" }
    }
}