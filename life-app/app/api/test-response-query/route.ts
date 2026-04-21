import { adminClient } from '@/sanity/lib/adminClient';
import { defineQuery } from 'groq';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const slug = searchParams.get('slug');
        
        if (!slug) {
            return NextResponse.json({ error: "No slug provided" }, { status: 400 });
        }

        console.log('Testing query for slug:', slug);

        // Test the exact query from the response page
        const responseQuery = defineQuery(`
            *[_type == "post" && isDeleted == false && (_id == $slug || (defined(slug) && slug.current == $slug))][0] {
                _id,
                title,
                slug,
                "hasSlug": defined(slug)
            }
        `);
        
        const response = await adminClient.fetch(responseQuery, { slug });
        
        console.log('Query result:', response);
        
        return NextResponse.json({
            success: true,
            slug: slug,
            response: response,
            found: !!response
        });
    } catch (error) {
        console.error('Test query error:', error);
        return NextResponse.json({ 
            error: "Failed to test query", 
            details: error instanceof Error ? error.message : String(error) 
        }, { status: 500 });
    }
} 