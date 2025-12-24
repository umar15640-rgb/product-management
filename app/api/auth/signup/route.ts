import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { UserAccount } from '@/models/UserAccount';
import { hashPassword, signToken } from '@/lib/auth';
import { userAccountSchema } from '@/middleware/validation';

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const validated = userAccountSchema.parse(body);

    const existingUser = await UserAccount.findOne({ email: validated.email });
    if (existingUser) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
    }

    const password_hash = await hashPassword(validated.password);

    const user = await UserAccount.create({
      full_name: validated.full_name,
      email: validated.email,
      phone: validated.phone,
      password_hash,
      business_name: validated.business_name,
      business_whatsapp: validated.business_whatsapp,
    });

    const token = signToken({ userId: user._id.toString(), email: user.email });

    return NextResponse.json({
      token,
      user: {
        id: user._id,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone,
      },
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
