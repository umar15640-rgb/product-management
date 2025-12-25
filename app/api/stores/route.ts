import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Store } from '@/models/Store';
import { storeSchema } from '@/middleware/validation';
import { logAudit } from '@/lib/audit-logger';

async function getHandler(req: NextRequest) {
  try {
    await connectDB();

    const allStores = await Store.find();

    return NextResponse.json({ stores: allStores });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

async function postHandler(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const validated = storeSchema.parse(body);

    const store = await Store.create({
      ...validated,
    });

    await logAudit({
      userId: 'system',
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
