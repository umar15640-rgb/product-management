import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { UserAccount } from '@/models/UserAccount';
import { Store } from '@/models/Store';
import { StoreUser } from '@/models/StoreUser';
import { hashPassword, generateToken } from '@/lib/auth';
import { z } from 'zod';

const simpleSignupSchema = z.object({
  full_name: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  store_name: z.string().min(1, "Store name is required"),
  store_address: z.string().optional(),
  store_phone: z.string().optional(),
  serial_prefix: z.string().default('PRD'),
});

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const validated = simpleSignupSchema.parse(body);

    const existingUser = await UserAccount.findOne({ email: validated.email });
    if (existingUser) {
      return NextResponse.json({
        error: 'User already exists. Please login instead.',
      }, { status: 400 });
    }

    const password_hash = await hashPassword(validated.password);

    // Create user account
    const user = await UserAccount.create({
      full_name: validated.full_name,
      email: validated.email,
      phone: validated.phone,
      password_hash,
      business_name: validated.store_name,
    });

    // Create store
    const store = await Store.create({
      store_name: validated.store_name,
      address: validated.store_address,
      contact_phone: validated.store_phone,
      serial_prefix: validated.serial_prefix,
      owner_user_id: user._id,
      serial_counter: 1,
    });

    // Create store user with admin role
    await StoreUser.create({
      store_id: store._id,
      user_id: user._id,
      role: 'admin',
      permissions: ['all'],
    });

    const token = generateToken(user._id.toString());

    return NextResponse.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        full_name: user.full_name,
        phone: user.phone,
        business_name: user.business_name,
      },
      store: {
        id: store._id,
        store_name: store.store_name,
      },
    }, { status: 201 });

  } catch (error: any) {
    if (error instanceof z.ZodError) {
        return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
