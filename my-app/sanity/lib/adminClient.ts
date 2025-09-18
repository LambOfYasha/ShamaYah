import {apiVersion, dataset, projectId} from '../env'
import { createClient } from "next-sanity"

    export const adminClient = createClient({
        projectId,
        dataset,
        apiVersion,
        useCdn: false, // Set to false for admin operations
        token: process.env.SANITY_ADMIN_API_TOKEN,
    })

