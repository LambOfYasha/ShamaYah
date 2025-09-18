import { deleteCommunityResponse } from '@/action/postActions';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { responseId } = await request.json();
        
        if (!responseId) {
            return NextResponse.json({ error: "No responseId provided" }, { status: 400 });
        }

        console.log("Testing delete function for responseId:", responseId);
        
        const result = await deleteCommunityResponse(responseId);
        
        return NextResponse.json({
            success: true,
            result: result
        });
    } catch (error) {
        console.error("Test delete error:", error);
        return NextResponse.json({ 
            error: "Failed to test delete", 
            details: error instanceof Error ? error.message : String(error) 
        }, { status: 500 });
    }
} 