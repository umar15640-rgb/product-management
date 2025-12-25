import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Warranty } from '@/models/Warranty';
import { Product } from '@/models/Product';
import { Customer } from '@/models/Customer';
import { Store } from '@/models/Store';
import { warrantySchema } from '@/middleware/validation';
import { generateQRCode } from '@/lib/qr-generator';
import { generateWarrantyPDF } from '@/lib/pdf-generator';
import { calculateWarrantyEnd } from '@/lib/utils';
import { logAudit } from '@/lib/audit-logger';
import { whatsappClient } from '@/lib/whatsapp-client';

async function getHandler(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const storeId = searchParams.get('storeId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const query = storeId ? { store_id: storeId } : {};
    const warranties = await Warranty.find(query)
      .populate('product_id')
      .populate('customer_id')
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ created_at: -1 });

    const total = await Warranty.countDocuments(query);

    return NextResponse.json({ warranties, total, page, pages: Math.ceil(total / limit) });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

async function postHandler(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const validated = warrantySchema.parse(body);

    const product = await Product.findById(validated.product_id);
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const customer = await Customer.findById(validated.customer_id);
    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    const store = await Store.findById(product.store_id);
    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    const warranty_start = new Date(validated.warranty_start);
    const warranty_end = calculateWarrantyEnd(warranty_start, product.base_warranty_months);

    const qr_code_url = await generateQRCode(product.serial_number);

    const warranty_pdf_url = await generateWarrantyPDF({
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
      purchase_date: product.purchase_date.toLocaleDateString(),
      warranty_start: warranty_start.toLocaleDateString(),
      warranty_end: warranty_end.toLocaleDateString(),
    });

    const warranty = await Warranty.create({
      product_id: validated.product_id,
      customer_id: validated.customer_id,
      store_id: product.store_id,
      user_id: 'system',
      warranty_start,
      warranty_end,
      qr_code_url,
      warranty_pdf_url,
      status: 'active',
    });

    await logAudit({
      userId: 'system',
      storeId: product.store_id,
      entity: 'warranties',
      entityId: warranty._id,
      action: 'create',
      newValue: warranty,
    });

    if (store.whatsapp_enabled && customer.phone) {
      const pdfUrl = `${process.env.NEXT_PUBLIC_APP_URL}${warranty_pdf_url}`;
      await whatsappClient.sendDocument(
        customer.phone,
        pdfUrl,
        `Warranty-${product.serial_number}.pdf`,
        `Your warranty for ${product.brand} ${product.product_model} has been registered. Valid until ${warranty_end.toLocaleDateString()}.`,
        store._id
      );
    }

    return NextResponse.json({ warranty }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export const GET = getHandler;
export const POST = postHandler;
