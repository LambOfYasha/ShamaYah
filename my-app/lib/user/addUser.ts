import { adminClient } from "@/sanity/lib/adminClient"

export async function addUser({
    id,
    username,
    imageUrl,
    email,
} : {
    id:string
    username:string
    imageUrl:string
    email:string
}) {
    const user = await adminClient.createIfNotExists({
        _id: id,
        _type: "user",
        username,
        imageUrl,
        email,
        joinedAt: new Date().toISOString(),
    })

return user
    }