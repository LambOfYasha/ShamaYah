import { testDeleteSimple } from '@/action/test-delete-simple';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { responseId } = await request.json();
        
        if (!responseId) {
            return NextResponse.json({ error: "No responseId provided" }, { status: 400 });
        }

        console.log("Testing simple delete for responseId:", responseId);
        
        const result = await testDeleteSimple(responseId);
        
        return NextResponse.json({
            success: true,
            result: result
        });
    } catch (error) {
        console.error("Test simple delete error:", error);
        return NextResponse.json({ 
            error: "Failed to test simple delete", 
            details: error instanceof Error ? error.message : String(error) 
        }, { status: 500 });
    }
} 