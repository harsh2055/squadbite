import { NextRequest, NextResponse } from 'next/server';
import { getAISuggestions } from '@/lib/aiHelper';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, preferences } = body;

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const result = await getAISuggestions({ userMessage: message, preferences });
    return NextResponse.json(result);
  } catch (error) {
    console.error('AI suggestion error:', error);
    return NextResponse.json({ error: 'Failed to get suggestions' }, { status: 500 });
  }
}
