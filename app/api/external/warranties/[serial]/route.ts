import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Warranty } from '@/models/Warranty';
import { Product } from '@/models/Product';

async function getHandler(req: NextRequest, { params }: { params: { serial: string } }) {
  try {
    await connectDB();

    // Find product by serial number (no store_id needed - find from product)
    const product = await Product.findOne({
      serial_number: params.serial,
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const warranties = await Warranty.find({
      product_id: product._id,
    })
      .populate('product_id', 'product_model brand category serial_number')
      .populate('customer_id', 'customer_name phone email')
      .sort({ created_at: -1 })
      .select('-__v');

    if (!warranties || warranties.length === 0) {
      return NextResponse.json({ error: 'Warranty not found for this product' }, { status: 404 });
    }

    return NextResponse.json({ warranties });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export const GET = getHandler;
