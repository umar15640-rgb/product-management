import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Store } from '@/models/Store';
import { StoreUser } from '@/models/StoreUser';
import { storeSchema } from '@/middleware/validation';
import { logAudit } from '@/lib/audit-logger';
import { getAuthenticatedUserId } from '@/lib/auth-helpers';

async function getHandler(req: NextRequest) {
  try {
    await connectDB();

    const userId = getAuthenticatedUserId(req);

    // Get all stores that the user has access to via StoreUser
    const storeUsers = await StoreUser.find({ user_id: userId })
      .populate('store_id')
      .select('store_id');

    const stores = storeUsers
      .map((su: any) => su.store_id)
      .filter((store: any) => store !== null);

    return NextResponse.json({ stores });
  } catch (error: any) {
    if (error.message === 'Missing authorization token' || error.message === 'Invalid or expired token') {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

async function postHandler(req: NextRequest) {
  try {
    await connectDB();

    const userId = getAuthenticatedUserId(req);
    const body = await req.json();
    const validated = storeSchema.parse(body);

    const store = await Store.create({
      ...validated,
      owner_user_id: userId,
    });

    // Create store user with admin role
    await StoreUser.create({
      store_id: store._id,
      user_id: userId,
      role: 'admin',
      permissions: ['all'],
    });

    await logAudit({
      userId: userId,
      storeId: store._id,
      entity: 'stores',
      entityId: store._id,
      action: 'create',
      newValue: store,
    });

    return NextResponse.json({ store }, { status: 201 });
  } catch (error: any) {
    if (error.message === 'Missing authorization token' || error.message === 'Invalid or expired token') {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export const GET = getHandler;
export const POST = postHandler;