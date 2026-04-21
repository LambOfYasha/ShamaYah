import { createClient } from '@sanity/client'

const readToken = process.env.SANITY_API_READ_TOKEN?.trim()

const token =
  typeof window === 'undefined'
    ? readToken || undefined
    : undefined

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION,
  perspective: 'published',
  token,
  useCdn: false,
})
