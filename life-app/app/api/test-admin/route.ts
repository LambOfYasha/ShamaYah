import { testAdminClient } from '@/action/test-admin-client';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const result = await testAdminClient();
        return NextResponse.json(result);
    } catch (error) {
        return NextResponse.json({ 
            error: "Test failed", 
            details: error instanceof Error ? error.message : String(error) 
        }, { status: 500 });
    }
} 