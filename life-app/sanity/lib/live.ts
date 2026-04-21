// Querying with "sanityFetch" will keep content automatically updated
// Before using it, import and render "<SanityLive />" in your layout, see
// https://github.com/sanity-io/next-sanity#live-content-api for more information.

import { client } from './client'

// Fallback exports to prevent import errors
export const sanityFetch = async (query: string, params?: any) => {
  return client.fetch(query, params);
};

export const SanityLive = () => null;
