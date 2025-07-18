import { sanityFetch } from "../live";
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

// Type-safe fetch function
async function typedSanityFetch<T>(query: string): Promise<T> {
    return sanityFetch<T>(query);
}

export async function getBlogs(): Promise<BlogWithAuthor[]> {
    const getBlogsQuery = defineQuery(`*[_type == "blog"] {
        ...,
        title,
        "slug": slug.current,
        "author": author->,
    }  | order(createdAt desc)`);

    return typedSanityFetch<BlogWithAuthor[]>(getBlogsQuery);
} 