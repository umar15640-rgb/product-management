import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { StoreUser } from '@/models/StoreUser';
import { withAuth } from '@/middleware/auth';
import { z } from 'zod';

const storeUserSchema = z.object({
  store_id: z.string(),
  user_id: z.string(),
  role: z.enum(['admin', 'manager', 'staff']),
  permissions: z.array(z.string()).default([]),
});

async function getHandler(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const storeId = searchParams.get('storeId');

    const query = storeId ? { store_id: storeId } : {};
    const storeUsers = await StoreUser.find(query)
      .populate('user_id')
      .populate('store_id')
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

    const existing = await StoreUser.findOne({
      store_id: validated.store_id,
      user_id: validated.user_id,
    });

    if (existing) {
      return NextResponse.json({ error: 'User already assigned to this store' }, { status: 400 });
    }

    const storeUser = await StoreUser.create(validated);

    return NextResponse.json({ storeUser }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export const GET = withAuth(getHandler);
export const POST = withAuth(postHandler);
