import { NextRequest, NextResponse } from 'next/server';
import { generateRoomId } from '@/lib/mockData';

export async function POST(req: NextRequest) {
  try {
    const roomId = generateRoomId();
    return NextResponse.json({ roomId });
  } catch {
    return NextResponse.json({ error: 'Failed to create room' }, { status: 500 });
  }
}
