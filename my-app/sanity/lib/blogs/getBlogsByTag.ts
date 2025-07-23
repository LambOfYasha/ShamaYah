import { defineQuery } from "groq"
import { client } from "../client";
import { BlogWithAuthor } from "./getBlogs";

const getBlogsByTagQuery = defineQuery(`
  *[_type == "blog" && (isDeleted == false || isDeleted == null) && $tagSlug in tags[]->slug.current] | order(createdAt desc) {
    _id,
    title,
    "slug": slug.current,
    description,
    content,
    "author": author->{
      _id,
      username,
      imageURL
    },
    createdAt,
    image,
    "tags": tags[]->{
      _id,
      name,
      "slug": slug.current,
      color
    }
  }
`)

// Generic wrapper for client.fetch with proper typing
async function typedClientFetch<T>(query: string, params?: any): Promise<T> {
  return client.fetch<T>(query, params);
}

export async function getBlogsByTag(tagSlug: string): Promise<BlogWithAuthor[]> {
  return typedClientFetch<BlogWithAuthor[]>(getBlogsByTagQuery, { tagSlug });
}

export async function getTagInfo(tagSlug: string) {
  const tagQuery = defineQuery(`
    *[_type == "tag" && slug.current == $tagSlug][0] {
      _id,
      name,
      "slug": slug.current,
      description,
      color,
      createdAt
    }
  `);
  
  return typedClientFetch<any>(tagQuery, { tagSlug });
} 