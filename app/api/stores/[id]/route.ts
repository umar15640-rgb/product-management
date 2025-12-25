import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Store } from '@/models/Store';
import { logAudit } from '@/lib/audit-logger';

// Helper to extract user ID
const getUserId = (req: NextRequest): string | null => {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  try {
    const token = authHeader.slice(7);
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
    return decoded.userId;
  } catch {
    return null;
  }
};

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
    const userId = getUserId(req); // Get user ID

    const oldStore = await Store.findById(params.id);
    if (!oldStore) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    const body = await req.json();
    const store = await Store.findByIdAndUpdate(params.id, body, { new: true });

    // Only log if we have a valid user, or omit userId if your schema allows it (usually it doesn't)
    if (userId) {
        await logAudit({
          userId: userId, // FIXED
          storeId: store!._id,
          entity: 'stores',
          entityId: store!._id,
          action: 'update',
          oldValue: oldStore,
          newValue: store,
        });
    }

    return NextResponse.json({ store });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

async function deleteHandler(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const userId = getUserId(req);

    const store = await Store.findByIdAndDelete(params.id);
    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    if (userId) {
        await logAudit({
          userId: userId, // FIXED
          storeId: store._id,
          entity: 'stores',
          entityId: store._id,
          action: 'delete',
          oldValue: store,
        });
    }

    return NextResponse.json({ message: 'Store deleted' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export const GET = getHandler;
export const PUT = putHandler;
export const DELETE = deleteHandler;