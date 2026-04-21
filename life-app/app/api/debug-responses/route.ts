import { adminClient } from '@/sanity/lib/adminClient';
import { defineQuery } from 'groq';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        // Query all responses to see what exists
        const responsesQuery = defineQuery(`
            *[_type == "post" && isDeleted == false] {
                _id,
                title,
                slug,
                "hasSlug": defined(slug),
                publishedAt
            }
        `);
        
        const responses = await adminClient.fetch(responsesQuery);
        
        return NextResponse.json({
            success: true,
            count: responses.length,
            responses: responses
        });
    } catch (error) {
        return NextResponse.json({ 
            error: "Failed to fetch responses", 
            details: error instanceof Error ? error.message : String(error) 
        }, { status: 500 });
    }
} 