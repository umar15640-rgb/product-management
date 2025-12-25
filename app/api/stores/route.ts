import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Store } from '@/models/Store';
import { storeSchema } from '@/middleware/validation';
import { logAudit } from '@/lib/audit-logger';

async function getHandler(req: NextRequest) {
  try {
    await connectDB();

    // Ideally, filter stores by the user's access if this is a multi-tenant system
    // For now, returning all as per original logic, but be aware of data leak potential
    const allStores = await Store.find();

    return NextResponse.json({ stores: allStores });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

async function postHandler(req: NextRequest) {
  try {
    await connectDB();

    // 1. Extract User ID
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing authorization' }, { status: 401 });
    }

    const token = authHeader.slice(7);
    let userId: string;
    try {
      const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
      userId = decoded.userId;
    } catch {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await req.json();
    const validated = storeSchema.parse(body);

    const store = await Store.create({
      ...validated,
      owner_user_id: userId, // Ensure owner is set correctly if not passed in body
    });

    await logAudit({
      userId: userId, // FIXED
      storeId: store._id,
      entity: 'stores',
      entityId: store._id,
      action: 'create',
      newValue: store,
    });

    return NextResponse.json({ store }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export const GET = getHandler;
export const POST = postHandler;