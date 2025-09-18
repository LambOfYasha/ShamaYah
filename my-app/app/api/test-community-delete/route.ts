import { testCommunityDelete } from '@/action/test-community-delete';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { communityId } = await request.json();
        
        if (!communityId) {
            return NextResponse.json({ error: "No communityId provided" }, { status: 400 });
        }

        console.log("Testing community delete for communityId:", communityId);
        
        const result = await testCommunityDelete(communityId);
        
        return NextResponse.json({
            success: true,
            result: result
        });
    } catch (error) {
        console.error("Test community delete error:", error);
        return NextResponse.json({ 
            error: "Failed to test community delete", 
            details: error instanceof Error ? error.message : String(error) 
        }, { status: 500 });
    }
} 