import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Warranty } from '@/models/Warranty';
import { Product } from '@/models/Product';
import { Customer } from '@/models/Customer';
import { Store } from '@/models/Store';
import { validateApiKey } from '@/lib/api-key-auth';
import { generateQRCode } from '@/lib/qr-generator';
import { generateWarrantyPDF } from '@/lib/pdf-generator';
import { calculateWarrantyEnd } from '@/lib/utils';
import { logAudit } from '@/lib/audit-logger';
import { z } from 'zod';

const warrantyRegistrationSchema = z.object({
  product_serial_number: z.string().min(1, 'Product serial number is required'),
  customer_name: z.string().min(1, 'Customer name is required'),
  customer_phone: z.string().min(1, 'Customer phone is required'),
  customer_email: z.string().email().optional().or(z.literal('')),
  customer_address: z.string().optional().or(z.literal('')),
});

async function getHandler(req: NextRequest) {
  try {
    const storeId = await validateApiKey(req);
    await connectDB();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const serialNumber = searchParams.get('serial_number');

    const query: any = { store_id: storeId };

    if (serialNumber) {
      // Find product by serial number first
      const product = await Product.findOne({
        serial_number: serialNumber,
        store_id: storeId,
      });

      if (product) {
        query.product_id = product._id;
      } else {
        // Return empty result if product not found
        return NextResponse.json({
          warranties: [],
          total: 0,
          page,
          pages: 0,
        });
      }
    }

    const warranties = await Warranty.find(query)
      .populate('product_id', 'product_model brand category serial_number')
      .populate('customer_id', 'customer_name phone email')
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ created_at: -1 })
      .select('-__v');

    const total = await Warranty.countDocuments(query);

    return NextResponse.json({
      warranties,
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
    const validated = warrantyRegistrationSchema.parse(body);

    // Find product by serial number (this will give us the store_id)
    const product = await Product.findOne({
      serial_number: validated.product_serial_number,
    }).populate('store_id');

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found with the provided serial number' },
        { status: 404 }
      );
    }

    const storeId = typeof product.store_id === 'object' && product.store_id?._id
      ? product.store_id._id.toString()
      : product.store_id.toString();

    // Find or create customer
    let customer = await Customer.findOne({
      phone: validated.customer_phone,
      store_id: storeId,
    });

    if (!customer) {
      customer = await Customer.create({
        customer_name: validated.customer_name,
        phone: validated.customer_phone,
        email: validated.customer_email || '',
        address: validated.customer_address || '',
        store_id: storeId,
        user_id: product.user_id,
      });
    } else {
      // Update customer info if provided
      if (validated.customer_name) customer.customer_name = validated.customer_name;
      if (validated.customer_email) customer.email = validated.customer_email;
      if (validated.customer_address) customer.address = validated.customer_address;
      await customer.save();
    }

    // Check if warranty already exists for this product-customer combination
    const existingWarranty = await Warranty.findOne({
      product_id: product._id,
      customer_id: customer._id,
      store_id: storeId,
    });

    if (existingWarranty) {
      return NextResponse.json(
        { error: 'Warranty already exists for this product', warranty: existingWarranty },
        { status: 400 }
      );
    }

    const store = await Store.findById(storeId);
    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    // Use current date as warranty start date
    const warranty_start = new Date();
    const warranty_end = calculateWarrantyEnd(warranty_start, product.base_warranty_months);

    // Generate QR code
    let qr_code_url = '';
    try {
      qr_code_url = await generateQRCode(product.serial_number);
    } catch (qrError: any) {
      console.error('QR Code generation failed:', qrError.message);
    }

    // Create warranty first
    const warranty = await Warranty.create({
      product_id: product._id,
      customer_id: customer._id,
      store_id: storeId,
      user_id: store.owner_user_id,
      warranty_start,
      warranty_end,
      qr_code_url,
      status: 'active',
    });

    // Generate PDF after warranty creation
    let warranty_pdf_url = '';
    try {
      warranty_pdf_url = await generateWarrantyPDF({
        store_name: store.store_name,
        store_logo: store.store_logo,
        store_address: store.address,
        store_phone: store.contact_phone,
        customer_name: customer.customer_name,
        customer_phone: customer.phone,
        customer_email: customer.email,
        customer_address: customer.address,
        product_model: product.product_model,
        brand: product.brand,
        category: product.category,
        serial_number: product.serial_number,
        manufacturing_date: product.manufacturing_date
          ? new Date(product.manufacturing_date).toLocaleDateString()
          : new Date().toLocaleDateString(),
        warranty_start: warranty_start.toLocaleDateString(),
        warranty_end: warranty_end.toLocaleDateString(),
      });

      // Update warranty with PDF URL
      warranty.warranty_pdf_url = warranty_pdf_url;
      await warranty.save();
    } catch (pdfError: any) {
      console.error('PDF generation failed:', pdfError.message);
    }

    await logAudit({
      userId: store.owner_user_id.toString(),
      storeId: storeId.toString(),
      entity: 'warranties',
      entityId: warranty._id,
      action: 'create',
      newValue: warranty,
    });

    return NextResponse.json(
      {
        warranty,
        message: 'Warranty registered successfully',
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
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Warranty already exists for this product and customer combination' },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export const GET = getHandler;
export const POST = postHandler;
