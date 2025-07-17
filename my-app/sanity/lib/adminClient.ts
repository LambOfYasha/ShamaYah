import {apiVersion, dataset, projectId} from '../env'
import { createClient } from "next-sanity"

    export const adminClient = createClient({
        projectId,
        dataset,
        apiVersion,
        useCdn: true,
        token: process.env.SANITY_API_ADMIN_TOKEN,
    })

