import { ImageData } from "@/action/createCommunityQuestion"
import { defineQuery } from "groq"
import { sanityFetch } from "../live"
import { adminClient } from "../adminClient"
import { CommunityQuestion } from "@/sanity.types"

export async function createCommunity(
    name: string,
    moderatorId: string,
    imageData: ImageData | null,
    customSlug: string,
    customDescription: string

) {
    console.log(`Creating community: ${name} with moderator: ${moderatorId}`)
    try {
        //check if community with this name already exists
        const checkExistingQuery = defineQuery(
            `*[_type == "community" && title == $name][0]
            {
                _id,
            }
        `)

        const existingCommunity = await sanityFetch({
            query: checkExistingQuery,
            params: { name },
        })
        
            if (existingCommunity.data) {
                console.log(`Community with name ${name} already exists`)
                return { error: "Community with this name already exists" }
            }


            //check if slug already exists if custon slug is provided

            if (customSlug) {
                const checkSlugQuery = defineQuery(
                    `*[_type == "community" && slug.current == $slug][0]
                    {
                        _id,
                    }
                `)

                const existingSlug = await sanityFetch({
                    query: checkSlugQuery,
                    params: {slug: customSlug}
                })

                if (existingSlug.data) {
                    console.log(`Community with slug "${customSlug}" already exists`)
                    return { error: "A community with this URL already exists" }
                }
            }

            //create slug from name or use custom slug
            const slug = customSlug || name.toLowerCase().replace(/\s+/g, "-")

            //Upload image if provided
            let imageAsset
            if (imageData) {
                try {
                    //extract base64 data (remove data:image/jpeg;base63, part)
                    const base64Data = imageData.base64.split(",")[1]

                    //convert base64 to buffer
                    const buffer = Buffer.from(base64Data, "base64")

                    //upload to sanity
                    imageAsset = await adminClient.assets.upload("image", buffer, {
                        filename: imageData.fileName,
                        contentType: imageData.contentType,
                    })

                    console.log("image asset:", imageAsset)
                } catch (error) {
                    console.error("failed to upload image", error)
                    //continue without image if upload fails
                }
        }
        
        // Create the community
        const communityDoc: Partial<CommunityQuestion> = {
            _type: "communityQuestion",
            title: name,
            description: customDescription || `Welcom to r/${name}`,
            slug: {
                current: slug,
                _type: "slug",
            },
            moderator: {
                _type: "reference",
                _ref: moderatorId,
            },
            createdAt: new Date().toISOString(),
        }


        //add image if available

        if (imageAsset) {
            communityDoc.image = {
                _type: "image",
                asset: {
                    _type: "reference",
                    _ref: imageAsset._id,
                },
            }
        }

        //create community
        const createdCommunity = await adminClient.create(communityDoc as CommunityQuestion)

        console.log(`created community: ${createdCommunity._id}`)

        return { createdCommunity }

     } catch (error) {
        console.error("failed to create community", error)
        return { error: "failed to create community" }
    }
}