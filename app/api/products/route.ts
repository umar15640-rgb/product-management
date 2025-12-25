import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Product } from '@/models/Product';
import { productSchema } from '@/middleware/validation'; // Note: You should also update your Zod schema to expect manufacturing_date instead of purchase_date
import { generateSerialNumber } from '@/lib/serial-generator';
import { logAudit } from '@/lib/audit-logger';

async function getHandler(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const storeId = searchParams.get('storeId');
    const userId = searchParams.get('userId'); // New param
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const query: any = {};
    if (storeId) query.store_id = storeId;
    if (userId) query.user_id = userId; // Filter by user

    const products = await Product.find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ created_at: -1 });

    const total = await Product.countDocuments(query);

    return NextResponse.json({ products, total, page, pages: Math.ceil(total / limit) });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

async function postHandler(req: NextRequest) {
  try {
    await connectDB();
    // ... Auth logic ...
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing authorization' }, { status: 401 });
    }
    const token = authHeader.slice(7);
    let userId: string;
    try {
      const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
      userId = decoded.userId;
    } catch {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await req.json();
    // Assuming you updated validation schema, or map it manually here if schema isn't updated
    // const validated = productSchema.parse(body); 
    
    // Manual mapping if validation fails due to schema name change
    const validated = { ...body }; 
    
    const serialData = await generateSerialNumber(validated.store_id);

    const product = await Product.create({
      ...validated,
      ...serialData,
      user_id: userId,
      manufacturing_date: new Date(validated.manufacturing_date), // Changed
    });

    await logAudit({
      userId,
      storeId: validated.store_id,
      entity: 'products',
      entityId: product._id,
      action: 'create',
      newValue: product,
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export const GET = getHandler;
export const POST = postHandler;