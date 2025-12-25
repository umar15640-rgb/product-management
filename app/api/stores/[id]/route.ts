import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Store } from '@/models/Store';
import { logAudit } from '@/lib/audit-logger';

async function getHandler(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const store = await Store.findById(params.id);

    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    return NextResponse.json({ store });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

async function putHandler(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();

    const oldStore = await Store.findById(params.id);
    if (!oldStore) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    const body = await req.json();
    const store = await Store.findByIdAndUpdate(params.id, body, { new: true });

    await logAudit({
      userId: 'system',
      storeId: store!._id,
      entity: 'stores',
      entityId: store!._id,
      action: 'update',
      oldValue: oldStore,
      newValue: store,
    });

    return NextResponse.json({ store });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

async function deleteHandler(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();

    const store = await Store.findByIdAndDelete(params.id);
    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    await logAudit({
      userId: 'system',
      storeId: store._id,
      entity: 'stores',
      entityId: store._id,
      action: 'delete',
      oldValue: store,
    });

    return NextResponse.json({ message: 'Store deleted' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export const GET = getHandler;
export const PUT = putHandler;
export const DELETE = deleteHandler;
