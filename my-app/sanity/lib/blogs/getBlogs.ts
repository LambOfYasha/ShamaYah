import { defineQuery } from "groq"
import { client } from "../client";

export interface BlogWithAuthor {
  _id: string;
  title: string;
  slug: string;
  description: string;
  content: any[];
  author: {
    _id: string;
    username: string;
    imageURL?: string;
  };
  createdAt: string;
  image?: {
    asset: {
      _ref: string;
    };
    alt?: string;
  };
}

const getBlogsQuery = defineQuery(`
  *[_type == "blog"] | order(createdAt desc) {
    _id,
    title,
    slug,
    description,
    content,
    "author": author->{
      _id,
      username,
      imageURL
    },
    createdAt,
    image
  }
`)

// Generic wrapper for client.fetch with proper typing
async function typedClientFetch<T>(query: string): Promise<T> {
  return client.fetch<T>(query);
}

export async function getBlogs(): Promise<BlogWithAuthor[]> {
  return typedClientFetch<BlogWithAuthor[]>(getBlogsQuery);
} 