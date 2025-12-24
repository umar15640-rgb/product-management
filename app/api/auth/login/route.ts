import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { UserAccount } from '@/models/UserAccount';
import { comparePassword, signToken } from '@/lib/auth';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const { email, password } = loginSchema.parse(body);

    const user = await UserAccount.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: 'User does not exist' }, { status: 401 });
    }

    const isValid = await comparePassword(password, user.password_hash);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const token = signToken({ userId: user._id.toString(), email: user.email });

    return NextResponse.json({
      token,
      user: {
        id: user._id,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone,
        business_name: user.business_name,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
