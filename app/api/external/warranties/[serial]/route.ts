import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Warranty } from '@/models/Warranty';
import { Product } from '@/models/Product';
import { validateApiKey } from '@/lib/api-key-auth';
import { z } from 'zod';

const normalizePhone = (phone: string) =>
  phone.replace(/\D/g, '').replace(/^91/, '');

const warrantyLookupSchema = z.object({
  customer_phone: z.string().optional(),
  customer_email: z.string().email().optional(),
}).refine(
  (data) => data.customer_phone || data.customer_email,
  'Either customer_phone or customer_email is required'
);

async function getHandler(req: NextRequest, { params }: { params: { serial: string } }) {
  try {
    await validateApiKey(req);
    await connectDB();

    const { searchParams } = new URL(req.url);
    const customerPhone = searchParams.get('customer_phone');
    const customerEmail = searchParams.get('customer_email');

    const validated = warrantyLookupSchema.parse({
      customer_phone: customerPhone,
      customer_email: customerEmail,
    });

    const product = await Product.findOne({
      serial_number: params.serial,
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const warranties = await Warranty.find({ product_id: product._id })
      .populate('product_id', 'product_model brand category serial_number')
      .populate('customer_id', 'customer_name phone email');

    if (warranties.length === 0) {
      return NextResponse.json(
        { error: 'Warranty not found for this product' },
        { status: 404 }
      );
    }

    for (const warranty of warranties) {
      const customer = warranty.customer_id as any;
      let customerMatches = false;

      if (validated.customer_phone) {
        const normalizedPhone = normalizePhone(validated.customer_phone);
        customerMatches = normalizePhone(customer.phone) === normalizedPhone;
      }

      if (validated.customer_email && !customerMatches) {
        customerMatches = customer.email === validated.customer_email;
      }

      if (customerMatches) {
        return NextResponse.json({ warranty });
      }
    }

    return NextResponse.json(
      { error: 'Warranty not found for this product and customer' },
      { status: 404 }
    );
  } catch (error: any) {
    if (error.message.includes('API key')) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
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
