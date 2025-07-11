import { sanityFetch } from "../live";
import { defineQuery } from "groq";

export async function getCommunities() {
    
const getCommunitiesQuery = defineQuery(`*[_type == "community"] {
        ...,
        "slug": slug.current,
        "moderator": moderator->,
    }  | order(createdAt desc)`);

    const communities = await sanityFetch({query: getCommunitiesQuery});
    return communities.data;
}

