import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Store } from '@/models/Store';
import { StoreUser } from '@/models/StoreUser';
import { logAudit } from '@/lib/audit-logger';
import { getAuthenticatedUserId } from '@/lib/auth-helpers';

async function getHandler(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    
    const userId = getAuthenticatedUserId(req);
    
    const store = await Store.findById(params.id);
    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    // Verify user has access to this store
    const storeUser = await StoreUser.findOne({
      store_id: params.id,
      user_id: userId,
    });

    if (!storeUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    return NextResponse.json({ store });
  } catch (error: any) {
    if (error.message === 'Missing authorization token' || error.message === 'Invalid or expired token') {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

async function putHandler(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    
    const userId = getAuthenticatedUserId(req);

    // Verify user is admin of this store
    const storeUser = await StoreUser.findOne({
      store_id: params.id,
      user_id: userId,
      role: 'admin',
    });

    if (!storeUser) {
      return NextResponse.json({ error: 'Only admin users can update store settings' }, { status: 403 });
    }

    const oldStore = await Store.findById(params.id);
    if (!oldStore) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    const body = await req.json();
    const store = await Store.findByIdAndUpdate(params.id, body, { new: true });

    await logAudit({
      userId: userId,
      storeId: store!._id,
      entity: 'stores',
      entityId: store!._id,
      action: 'update',
      oldValue: oldStore,
      newValue: store,
    });

    return NextResponse.json({ store });
  } catch (error: any) {
    if (error.message === 'Missing authorization token' || error.message === 'Invalid or expired token') {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

async function deleteHandler(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    
    const userId = getAuthenticatedUserId(req);

    // Verify user is admin of this store
    const storeUser = await StoreUser.findOne({
      store_id: params.id,
      user_id: userId,
      role: 'admin',
    });

    if (!storeUser) {
      return NextResponse.json({ error: 'Only admin users can delete stores' }, { status: 403 });
    }

    const store = await Store.findByIdAndDelete(params.id);
    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    await logAudit({
      userId: userId,
      storeId: store._id,
      entity: 'stores',
      entityId: store._id,
      action: 'delete',
      oldValue: store,
    });

    return NextResponse.json({ message: 'Store deleted' });
  } catch (error: any) {
    if (error.message === 'Missing authorization token' || error.message === 'Invalid or expired token') {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export const GET = getHandler;
export const PUT = putHandler;
export const DELETE = deleteHandler;