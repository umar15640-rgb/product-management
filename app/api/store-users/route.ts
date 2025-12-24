import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { StoreUser } from '@/models/StoreUser';
import { UserAccount } from '@/models/UserAccount';
import { withAuth } from '@/middleware/auth';
import { hashPassword } from '@/lib/auth';
import { z } from 'zod';

const storeUserSchema = z.object({
  store_id: z.string(),
  user_id: z.string().optional(),
  
  // New User Details
  full_name: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  password: z.string().optional(),
  
  role: z.enum(['admin', 'manager', 'staff']),
  permissions: z.array(z.string()).default([]),
});

async function getHandler(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const storeId = searchParams.get('store_id');

    if (!storeId) {
        return NextResponse.json({ error: 'store_id is required' }, { status: 400 });
    }

    const storeUsers = await StoreUser.find({ store_id: storeId })
      .populate('user_id', 'full_name email phone')
      .populate('store_id', 'store_name')
      .sort({ created_at: -1 });

    return NextResponse.json({ storeUsers });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

async function postHandler(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const validated = storeUserSchema.parse(body);

    let targetUserId = validated.user_id;

    // Handle creation of new user or finding existing by email
    if (!targetUserId) {
      if (!validated.email || !validated.password || !validated.full_name) {
        return NextResponse.json(
          { error: 'If user_id is not provided; email, password, and name are required.' },
          { status: 400 }
        );
      }

      const existingUser = await UserAccount.findOne({ email: validated.email });

      if (existingUser) {
        // FIXED: Convert ObjectId to string
        targetUserId = existingUser._id.toString();
      } else {
        const password_hash = await hashPassword(validated.password);
        const newUser = await UserAccount.create({
          full_name: validated.full_name,
          email: validated.email,
          phone: validated.phone || '',
          password_hash,
        });
        // FIXED: Convert ObjectId to string
        targetUserId = newUser._id.toString();
      }
    }

    // Check if user is already in store
    const existingLink = await StoreUser.findOne({
      store_id: validated.store_id,
      user_id: targetUserId,
    });

    if (existingLink) {
      return NextResponse.json({ error: 'User is already a member of this store' }, { status: 400 });
    }

    const storeUser = await StoreUser.create({
      store_id: validated.store_id,
      user_id: targetUserId,
      role: validated.role,
      permissions: validated.permissions,
    });

    return NextResponse.json({ storeUser }, { status: 201 });

  } catch (error: any) {
    if (error instanceof z.ZodError) {
        return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export const GET = withAuth(getHandler);
export const POST = withAuth(postHandler);