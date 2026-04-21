import {apiVersion, dataset, projectId} from '../env'
import { createClient } from "next-sanity"

const token = process.env.SANITY_ADMIN_API_TOKEN?.trim()

export const adminClient = createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn: false, // Set to false for admin operations
    token: token || undefined,
})
