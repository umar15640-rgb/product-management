import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Product } from '@/models/Product';
import { validateApiKey } from '@/lib/api-key-auth';

async function getHandler(req: NextRequest, { params }: { params: Promise<{ serial: string }> }) {
  try {
    const resolvedParams = await params;
    await validateApiKey(req);
    await connectDB();

    const product = await Product.findOne({
      serial_number: resolvedParams.serial,
    })
      .populate('store_id', 'store_name')
      .select('-__v');

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ product });
  } catch (error: any) {
    if (error.message.includes('API key')) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export const GET = getHandler;
