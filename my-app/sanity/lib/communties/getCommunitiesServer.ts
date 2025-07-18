import { client } from "../client";
import { defineQuery } from "groq";
import type { CommunityQuestion, User } from "../../../sanity.types";

// Type for the expanded community data from GROQ query
interface CommunityWithModerator {
    _id: string;
    _type: "communityQuestion";
    _createdAt: string;
    _updatedAt: string;
    _rev: string;
    title?: string;
    description?: string;
    slug: string; // This comes from slug.current in the query
    image?: CommunityQuestion['image'];
    moderator: User; // This is the expanded user data
    createdAt?: string;
}

export async function getCommunitiesServer(): Promise<CommunityWithModerator[]> {
    const getCommunitiesQuery = defineQuery(`*[_type == "communityQuestion"] {
        ...,
        title,
        "slug": slug.current,
        "moderator": moderator->,
    }  | order(createdAt desc)`);

    const result = await client.fetch(getCommunitiesQuery);
    return result as CommunityWithModerator[];
}