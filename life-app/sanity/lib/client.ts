import { createClient } from '@sanity/client'
import { apiVersion, dataset, projectId } from '../env'

// Importing shared Sanity environment helper to validate missing configuration consistently
// Rationale: This change ensures that the client is created with validated configuration, reducing the risk of errors due to missing or incorrect environment variables.
// Possible regression risk: If the shared environment helper is not properly configured, it may cause issues with the client creation.

const readToken = process.env.SANITY_API_READ_TOKEN?.trim()

const token =
  typeof window === 'undefined'
    ? readToken || undefined
    : undefined

export const client = createClient({
  projectId: projectId, // Using validated projectId from shared environment helper
  dataset: dataset, // Using validated dataset from shared environment helper
  apiVersion: apiVersion, // Using validated apiVersion from shared environment helper
  perspective: 'published',
  token,
  useCdn: false,
})
