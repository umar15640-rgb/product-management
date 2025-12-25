import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Product } from '@/models/Product';
import { logAudit } from '@/lib/audit-logger';

async function getHandler(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const product = await Product.findById(params.id);

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ product });
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

    const token = authHeader.slice(7);
    let userId: string;
    try {
      const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
      userId = decoded.userId;
    } catch {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const oldProduct = await Product.findById(params.id);
    if (!oldProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const body = await req.json();
    const product = await Product.findByIdAndUpdate(params.id, body, { new: true });

    await logAudit({
      userId: userId,
      storeId: product!.store_id,
      entity: 'products',
      entityId: product!._id,
      action: 'update',
      oldValue: oldProduct,
      newValue: product,
    });

    return NextResponse.json({ product });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export const GET = getHandler;
export const PUT = putHandler;