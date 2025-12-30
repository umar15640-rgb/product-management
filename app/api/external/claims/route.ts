import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Claim } from '@/models/Claim';
import { Warranty } from '@/models/Warranty';
import { Product } from '@/models/Product';
import { validateApiKey } from '@/lib/api-key-auth';
import { logAudit } from '@/lib/audit-logger';
import { z } from 'zod';

const claimRegistrationSchema = z.object({
  product_serial_number: z.string().min(1, 'Product serial number is required'),
  claim_type: z.enum(['repair', 'replacement', 'refund']),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  attachments: z.array(z.string()).optional(),
});

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

async function postHandler(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const validated = claimRegistrationSchema.parse(body);

    // Find product by serial number (this will give us the store_id)
    const product = await Product.findOne({
      serial_number: validated.product_serial_number,
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found with the provided serial number' },
        { status: 404 }
      );
    }

    const storeId = typeof product.store_id === 'object' && product.store_id?._id
      ? product.store_id._id.toString()
      : product.store_id.toString();

    // Find warranty for this product
    const warranty = await Warranty.findOne({
      product_id: product._id,
      store_id: storeId,
    });

    if (!warranty) {
      return NextResponse.json(
        { error: 'Warranty not found for this product. Please register warranty first.' },
        { status: 404 }
      );
    }

    // Check if warranty is still active
    if (warranty.status !== 'active') {
      return NextResponse.json(
        { error: `Warranty is ${warranty.status}. Only active warranties can have claims.` },
        { status: 400 }
      );
    }

    // Create claim
    const claim = await Claim.create({
      warranty_id: warranty._id,
      store_id: storeId,
      claim_type: validated.claim_type,
      description: validated.description,
      status: 'pending',
      attachments: validated.attachments || [],
      timeline_events: [
        {
          timestamp: new Date(),
          action: 'Claim created via external API',
        },
      ],
    });

    // Update warranty status to claimed
    await Warranty.findByIdAndUpdate(warranty._id, { status: 'claimed' });

    await logAudit({
      userId: warranty.user_id.toString(),
      storeId: storeId.toString(),
      entity: 'claims',
      entityId: claim._id,
      action: 'create',
      newValue: claim,
    });

    return NextResponse.json(
      {
        claim,
        message: 'Claim registered successfully',
      },
      { status: 201 }
    );
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export const GET = getHandler;
export const POST = postHandler;
