import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { UserAccount } from '@/models/UserAccount';
import { hashPassword } from '@/lib/auth';
import { z } from 'zod';

const simpleSignupSchema = z.object({
  full_name: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const validated = simpleSignupSchema.parse(body);

    const existingUser = await UserAccount.findOne({ email: validated.email });
    if (existingUser) {
      return NextResponse.json({
        user: { id: existingUser._id, email: existingUser.email },
        isExistingUser: true
      }, { status: 200 });
    }

    const password_hash = await hashPassword(validated.password);

    const user = await UserAccount.create({
      full_name: validated.full_name,
      email: validated.email,
      phone: validated.phone,
      password_hash,
    });

    return NextResponse.json({
      user: { id: user._id, email: user.email },
      isExistingUser: false
    }, { status: 201 });

  } catch (error: any) {
    if (error instanceof z.ZodError) {
        return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
