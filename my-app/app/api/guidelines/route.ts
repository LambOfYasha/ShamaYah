import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { CustomGuidelinesService } from '@/lib/ai/customGuidelines';
import { getUser } from '@/lib/user/getUser';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user information
    const userResult = await getUser();
    if ('error' in userResult) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user is admin or teacher
    if (userResult.role !== 'admin' && userResult.role !== 'teacher') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const activeOnly = searchParams.get('active') === 'true';

    let guidelines;
    if (category) {
      guidelines = CustomGuidelinesService.getGuidelinesByCategory(category);
    } else if (activeOnly) {
      guidelines = CustomGuidelinesService.getActiveGuidelines();
    } else {
      guidelines = CustomGuidelinesService.getActiveGuidelines(); // For now, just get active
    }

    const stats = CustomGuidelinesService.getGuidelineStats();

    return NextResponse.json({
      success: true,
      guidelines,
      stats
    });

  } catch (error) {
    console.error('Guidelines retrieval error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user information
    const userResult = await getUser();
    if ('error' in userResult) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user is admin
    if (userResult.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { name, description, category, severity, keywords, patterns, conditions, actions, priority } = body;

    // Validate required fields
    if (!name || !description || !category || !severity || !keywords || !patterns || !actions) {
      return NextResponse.json({ 
        error: 'Missing required fields: name, description, category, severity, keywords, patterns, actions' 
      }, { status: 400 });
    }

    // Validate category
    const validCategories = ['content', 'behavior', 'language', 'spam', 'custom'];
    if (!validCategories.includes(category)) {
      return NextResponse.json({ 
        error: `Invalid category. Must be one of: ${validCategories.join(', ')}` 
      }, { status: 400 });
    }

    // Validate severity
    const validSeverities = ['low', 'medium', 'high', 'critical'];
    if (!validSeverities.includes(severity)) {
      return NextResponse.json({ 
        error: `Invalid severity. Must be one of: ${validSeverities.join(', ')}` 
      }, { status: 400 });
    }

    // Validate actions
    const validActions = ['allow', 'flag', 'block'];
    if (!validActions.includes(actions.suggestedAction)) {
      return NextResponse.json({ 
        error: `Invalid suggested action. Must be one of: ${validActions.join(', ')}` 
      }, { status: 400 });
    }

    if (typeof actions.confidenceThreshold !== 'number' || actions.confidenceThreshold < 0 || actions.confidenceThreshold > 1) {
      return NextResponse.json({ 
        error: 'Confidence threshold must be a number between 0 and 1' 
      }, { status: 400 });
    }

    // Create the guideline
    const guideline = await CustomGuidelinesService.addGuideline({
      name,
      description,
      category,
      severity,
      keywords,
      patterns,
      conditions,
      actions,
      priority: priority || 5,
      isActive: true,
      createdBy: userResult._id
    });

    return NextResponse.json({
      success: true,
      guideline
    });

  } catch (error) {
    console.error('Guideline creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
} 