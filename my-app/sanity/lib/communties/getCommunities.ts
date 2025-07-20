import { defineQuery } from "groq"
import { client } from "../client";

export interface CommunityWithModerator {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  image?: {
    asset: {
      _ref: string;
    };
    alt?: string;
  };
  moderator: {
    _id: string;
    username: string;
    imageURL?: string;
  };
  createdAt: string;
}

const getCommunitiesQuery = defineQuery(`
  *[_type == "communityQuestion"] | order(createdAt desc) {
    _id,
    title,
    slug,
    description,
    image,
    "moderator": moderator->{
      _id,
      username,
      imageURL
    },
    createdAt
  }
`)

// Generic wrapper for client.fetch with proper typing
async function typedClientFetch<T>(query: string): Promise<T> {
  return client.fetch<T>(query);
}

export async function getCommunities(): Promise<CommunityWithModerator[]> {
  return typedClientFetch<CommunityWithModerator[]>(getCommunitiesQuery);
}

