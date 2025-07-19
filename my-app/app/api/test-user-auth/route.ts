import { testUserAuth } from '@/action/test-user-auth';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        console.log("Testing user authentication...");
        
        const result = await testUserAuth();
        
        return NextResponse.json({
            success: true,
            result: result
        });
    } catch (error) {
        console.error("Test user auth error:", error);
        return NextResponse.json({ 
            error: "Failed to test user auth", 
            details: error instanceof Error ? error.message : String(error) 
        }, { status: 500 });
    }
} 