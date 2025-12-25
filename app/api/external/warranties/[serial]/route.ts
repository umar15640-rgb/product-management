import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Warranty } from '@/models/Warranty';
import { Product } from '@/models/Product';
import { validateApiKey } from '@/lib/api-key-auth';

async function getHandler(req: NextRequest, { params }: { params: { serial: string } }) {
  try {
    const storeId = await validateApiKey(req);
    await connectDB();

    // Find product by serial number
    const product = await Product.findOne({
      serial_number: params.serial,
      store_id: storeId,
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const warranty = await Warranty.findOne({
      product_id: product._id,
      store_id: storeId,
    })
      .populate('product_id', 'product_model brand category serial_number')
      .populate('customer_id', 'customer_name phone email')
      .select('-__v');

    if (!warranty) {
      return NextResponse.json({ error: 'Warranty not found for this product' }, { status: 404 });
    }

    return NextResponse.json({ warranty });
  } catch (error: any) {
    if (error.message.includes('API key')) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export const GET = getHandler;
