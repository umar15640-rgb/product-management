import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Claim } from '@/models/Claim';
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

    // Find all warranties for this product
    const warranties = await Warranty.find({
      product_id: product._id,
    });

    if (!warranties || warranties.length === 0) {
      return NextResponse.json({ error: 'Warranty not found for this product' }, { status: 404 });
    }

    // Find claims for all warranties of this product
    const warrantyIds = warranties.map(w => w._id);
    const claims = await Claim.find({
      warranty_id: { $in: warrantyIds },
    })
      .populate({
        path: 'warranty_id',
        populate: {
          path: 'product_id',
          select: 'product_model brand category serial_number',
        },
      })
      .populate({
        path: 'warranty_id',
        populate: {
          path: 'customer_id',
          select: 'customer_name phone email',
        },
      })
      .sort({ created_at: -1 })
      .select('-__v');

    return NextResponse.json({ claims });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export const GET = getHandler;
