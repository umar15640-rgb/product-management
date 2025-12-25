import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { UserAccount } from '@/models/UserAccount';
import { getAuthenticatedUserId } from '@/lib/auth-helpers';

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const userId = getAuthenticatedUserId(req);

    const user = await UserAccount.findById(userId).select('-password_hash');
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error: any) {
    if (error.message === 'Missing authorization token' || error.message === 'Invalid or expired token') {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
