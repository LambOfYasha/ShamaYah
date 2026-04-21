import { defineQuery } from "groq"
import { client } from "../client";

export interface Tag {
  _id: string;
  name: string;
  slug: string;
  color: string;
  description?: string;
  createdAt?: string;
}

const getTagsQuery = defineQuery(`
  *[_type == "tag"] | order(name asc) {
    _id,
    name,
    "slug": slug.current,
    color,
    description,
    createdAt
  }
`)

// Generic wrapper for client.fetch with proper typing
async function typedClientFetch<T>(query: string): Promise<T> {
  return client.fetch<T>(query);
}

export async function getTags(): Promise<Tag[]> {
  return typedClientFetch<Tag[]>(getTagsQuery);
} 