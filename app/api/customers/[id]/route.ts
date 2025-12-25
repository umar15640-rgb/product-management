import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Customer } from '@/models/Customer';
import { logAudit } from '@/lib/audit-logger';

async function getHandler(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const customer = await Customer.findById(params.id);

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    return NextResponse.json({ customer });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

async function putHandler(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();

    const oldCustomer = await Customer.findById(params.id);
    if (!oldCustomer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    const body = await req.json();
    const customer = await Customer.findByIdAndUpdate(params.id, body, { new: true });

    await logAudit({
      userId: 'system',
      storeId: customer!.store_id,
      entity: 'customers',
      entityId: customer!._id,
      action: 'update',
      oldValue: oldCustomer,
      newValue: customer,
    });

    return NextResponse.json({ customer });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export const GET = getHandler;
export const PUT = putHandler;
