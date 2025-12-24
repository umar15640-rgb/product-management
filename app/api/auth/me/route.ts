import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { UserAccount } from '@/models/UserAccount';
import { withAuth } from '@/middleware/auth';

async function getHandler(req: NextRequest) {
  try {
    await connectDB();
    const user = (req as any).user;

    const userAccount = await UserAccount.findById(user.userId).select('-password_hash');
    if (!userAccount) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user: userAccount });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export const GET = withAuth(getHandler);
