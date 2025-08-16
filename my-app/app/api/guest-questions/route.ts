import { NextRequest, NextResponse } from 'next/server';
import { client } from '@/sanity/lib/client';

export async function POST(request: NextRequest) {
  try {
    const { question, guestEmail } = await request.json();

    if (!question || !question.trim()) {
      return NextResponse.json(
        { error: 'Question is required' },
        { status: 400 }
      );
    }

    // Create a guest question document in Sanity
    const guestQuestionDoc = {
      _type: 'guestQuestion',
      question: question.trim(),
      guestEmail: guestEmail || null,
      status: 'pending', // pending, reviewed, answered, rejected
      createdAt: new Date().toISOString(),
      reviewed: false,
      reviewedAt: null,
      reviewedBy: null,
      answer: null,
      answeredAt: null,
      tags: [],
      category: 'general'
    };

    const result = await client.create(guestQuestionDoc);

    return NextResponse.json(
      { 
        success: true, 
        message: 'Question submitted successfully',
        id: result._id 
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error submitting guest question:', error);
    return NextResponse.json(
      { error: 'Failed to submit question. Please try again.' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Get pending guest questions (for admin review)
    const query = `*[_type == "guestQuestion" && status == "pending"] | order(createdAt desc) {
      _id,
      question,
      guestEmail,
      createdAt,
      category,
      tags
    }`;

    const questions = await client.fetch(query);

    return NextResponse.json({ questions });

  } catch (error) {
    console.error('Error fetching guest questions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch questions' },
      { status: 500 }
    );
  }
}
