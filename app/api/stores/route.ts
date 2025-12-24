import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Store } from '@/models/Store';
import { StoreUser } from '@/models/StoreUser';
import { withAuth } from '@/middleware/auth';
import { storeSchema } from '@/middleware/validation';
import { logAudit } from '@/lib/audit-logger';

async function getHandler(req: NextRequest) {
  try {
    await connectDB();
    const user = (req as any).user;

    const ownedStores = await Store.find({ owner_user_id: user.userId });
    const storeUserRecords = await StoreUser.find({ user_id: user.userId }).populate('store_id');
    const accessibleStores = storeUserRecords.map(su => su.store_id);

    const allStores = [...ownedStores, ...accessibleStores];
    const uniqueStores = Array.from(new Map(allStores.map(s => [s._id.toString(), s])).values());

    return NextResponse.json({ stores: uniqueStores });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

async function postHandler(req: NextRequest) {
  try {
    await connectDB();
    const user = (req as any).user;

    const body = await req.json();
    const validated = storeSchema.parse(body);

    const store = await Store.create({
      ...validated,
      owner_user_id: user.userId,
    });

    await logAudit({
      userId: user.userId,
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

export const GET = withAuth(getHandler);
export const POST = withAuth(postHandler);
