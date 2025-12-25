import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Store } from '@/models/Store';
import { StoreUser } from '@/models/StoreUser';
import { UserAccount } from '@/models/UserAccount';
import { z } from 'zod';

const setupStoreSchema = z.object({
  store_name: z.string().min(1),
  store_address: z.string().optional(),
  store_phone: z.string().optional(),
  serial_prefix: z.string().default('PRD'),
  user_id: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const validated = setupStoreSchema.parse(body);
    const userId = validated.user_id;

    const existingStore = await Store.findOne({ owner_user_id: userId });
    if (existingStore) {
      return NextResponse.json({ success: true, storeId: existingStore._id, message: 'Store already exists' }, { status: 200 });
    }

    const store = await Store.create({
      store_name: validated.store_name,
      address: validated.store_address,
      contact_phone: validated.store_phone,
      serial_prefix: validated.serial_prefix,
      owner_user_id: userId,
      serial_counter: 1
    });

    await StoreUser.create({
      store_id: store._id,
      user_id: userId,
      role: 'admin',
      permissions: ['all']
    });
    
    await UserAccount.findByIdAndUpdate(userId, { 
        business_name: validated.store_name 
    });

    return NextResponse.json({ success: true, storeId: store._id }, { status: 201 });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
