import { client } from "../client";
import { defineQuery } from "groq";
import type { Blog, Teacher } from "../../../sanity.types";

// Type for the expanded blog data from GROQ query
interface BlogWithAuthor {
    _id: string;
    _type: "blog";
    _createdAt: string;
    _updatedAt: string;
    _rev: string;
    title?: string;
    description?: string;
    slug: string; // This comes from slug.current in the query
    image?: Blog['image'];
    content?: Blog['content'];
    author: Teacher; // This is the expanded teacher data
    createdAt?: string;
}

export async function getBlogsServer(): Promise<BlogWithAuthor[]> {
    const getBlogsQuery = defineQuery(`*[_type == "blog" && (isDeleted == false || isDeleted == null)] {
        ...,
        title,
        "slug": slug.current,
        "author": author->,
    }  | order(createdAt desc)`);

    const result = await client.fetch(getBlogsQuery);
    return result as BlogWithAuthor[];
} 