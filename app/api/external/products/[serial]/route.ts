import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Product } from '@/models/Product';

async function getHandler(req: NextRequest, { params }: { params: { serial: string } }) {
  try {
    await connectDB();

    const product = await Product.findOne({
      serial_number: params.serial,
    })
      .populate('store_id', 'store_name')
      .select('-__v');

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ product });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export const GET = getHandler;
