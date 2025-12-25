import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Warranty } from '@/models/Warranty';
import { logAudit } from '@/lib/audit-logger';

async function getHandler(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const warranty = await Warranty.findById(params.id)
      .populate('product_id')
      .populate('customer_id')
      .populate('store_id');

    if (!warranty) {
      return NextResponse.json({ error: 'Warranty not found' }, { status: 404 });
    }

    return NextResponse.json({ warranty });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

async function putHandler(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();

    // 1. Extract User ID
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing authorization' }, { status: 401 });
    }

    const { getAuthenticatedUserId } = await import('@/lib/auth-helpers');
    const userId = getAuthenticatedUserId(req);

    const oldWarranty = await Warranty.findById(params.id);
    if (!oldWarranty) {
      return NextResponse.json({ error: 'Warranty not found' }, { status: 404 });
    }

    const body = await req.json();
    const warranty = await Warranty.findByIdAndUpdate(params.id, body, { new: true });

    await logAudit({
      userId: userId,
      storeId: warranty!.store_id,
      entity: 'warranties',
      entityId: warranty!._id,
      action: 'update',
      oldValue: oldWarranty,
      newValue: warranty,
    });

    return NextResponse.json({ warranty });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export const GET = getHandler;
export const PUT = putHandler;