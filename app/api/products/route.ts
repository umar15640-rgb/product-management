import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Product } from '@/models/Product';
import { withAuth } from '@/middleware/auth';
import { productSchema } from '@/middleware/validation';
import { generateSerialNumber } from '@/lib/serial-generator';
import { logAudit } from '@/lib/audit-logger';

async function getHandler(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const storeId = searchParams.get('storeId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const query = storeId ? { store_id: storeId } : {};
    const products = await Product.find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ created_at: -1 });

    const total = await Product.countDocuments(query);

    return NextResponse.json({ products, total, page, pages: Math.ceil(total / limit) });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

async function postHandler(req: NextRequest) {
  try {
    await connectDB();
    const user = (req as any).user;

    const body = await req.json();
    const validated = productSchema.parse(body);

    const serialData = await generateSerialNumber(validated.store_id);

    const product = await Product.create({
      ...validated,
      ...serialData,
      user_id: user.userId,
      purchase_date: new Date(validated.purchase_date),
    });

    await logAudit({
      userId: user.userId,
      storeId: validated.store_id,
      entity: 'products',
      entityId: product._id,
      action: 'create',
      newValue: product,
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export const GET = withAuth(getHandler);
export const POST = withAuth(postHandler);
