import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Customer } from '@/models/Customer';
import { withAuth } from '@/middleware/auth';
import { customerSchema } from '@/middleware/validation';
import { logAudit } from '@/lib/audit-logger';

async function getHandler(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const storeId = searchParams.get('storeId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const query = storeId ? { store_id: storeId } : {};
    const customers = await Customer.find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ created_at: -1 });

    const total = await Customer.countDocuments(query);

    return NextResponse.json({ customers, total, page, pages: Math.ceil(total / limit) });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

async function postHandler(req: NextRequest) {
  try {
    await connectDB();
    const user = (req as any).user;

    const body = await req.json();
    const validated = customerSchema.parse(body);

    const customer = await Customer.create(validated);

    await logAudit({
      userId: user.userId,
      storeId: validated.store_id,
      entity: 'customers',
      entityId: customer._id,
      action: 'create',
      newValue: customer,
    });

    return NextResponse.json({ customer }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export const GET = withAuth(getHandler);
export const POST = withAuth(postHandler);
