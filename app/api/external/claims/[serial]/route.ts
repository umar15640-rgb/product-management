import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Claim } from '@/models/Claim';
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

    // Find warranty for this product
    const warranty = await Warranty.findOne({
      product_id: product._id,
      store_id: storeId,
    });

    if (!warranty) {
      return NextResponse.json({ error: 'Warranty not found for this product' }, { status: 404 });
    }

    // Find claims for this warranty
    const claims = await Claim.find({
      warranty_id: warranty._id,
      store_id: storeId,
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
    if (error.message.includes('API key')) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export const GET = getHandler;
