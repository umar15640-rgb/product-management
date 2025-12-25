import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Claim } from '@/models/Claim';
import { Warranty } from '@/models/Warranty';
import { Product } from '@/models/Product';
import { validateApiKey } from '@/lib/api-key-auth';

async function getHandler(req: NextRequest) {
  try {
    const storeId = await validateApiKey(req);
    await connectDB();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const serialNumber = searchParams.get('serial_number');
    const status = searchParams.get('status');

    const query: any = { store_id: storeId };
    if (status) {
      query.status = status;
    }

    let warrantiesFilter: any[] = [];

    if (serialNumber) {
      // Find product by serial number first
      const product = await Product.findOne({
        serial_number: serialNumber,
        store_id: storeId,
      });

      if (product) {
        const warranties = await Warranty.find({
          product_id: product._id,
          store_id: storeId,
        });
        warrantiesFilter = warranties.map((w) => w._id);
        query.warranty_id = { $in: warrantiesFilter };
      } else {
        // Return empty result if product not found
        return NextResponse.json({
          claims: [],
          total: 0,
          page,
          pages: 0,
        });
      }
    }

    const claims = await Claim.find(query)
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
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ created_at: -1 })
      .select('-__v');

    const total = await Claim.countDocuments(query);

    return NextResponse.json({
      claims,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (error: any) {
    if (error.message.includes('API key')) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export const GET = getHandler;
