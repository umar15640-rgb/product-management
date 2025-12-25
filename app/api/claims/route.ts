import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Claim } from '@/models/Claim';
import { Warranty } from '@/models/Warranty';
import { claimSchema } from '@/middleware/validation';
import { logAudit } from '@/lib/audit-logger';

async function getHandler(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const storeId = searchParams.get('storeId');
    const userId = searchParams.get('userId'); 
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const query: any = storeId ? { store_id: storeId } : {};
    
    // Optional: Filter claims related to warranties owned by this user
    // This requires a more complex query or assumed permission scope
    
    const claims = await Claim.find(query)
      .populate({
        path: 'warranty_id',
        populate: [{ path: 'product_id' }, { path: 'customer_id' }],
      })
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ created_at: -1 });

    const total = await Claim.countDocuments(query);

    return NextResponse.json({ claims, total, page, pages: Math.ceil(total / limit) });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

async function postHandler(req: NextRequest) {
  try {
    await connectDB();

    // 1. Extract User ID
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
    const validated = claimSchema.parse(body);

    const warranty = await Warranty.findById(validated.warranty_id);
    if (!warranty) {
      return NextResponse.json({ error: 'Warranty not found' }, { status: 404 });
    }

    const claim = await Claim.create({
      ...validated,
      store_id: warranty.store_id,
      timeline_events: [
        {
          timestamp: new Date(),
          action: 'Claim created',
          user_id: userId, // FIXED: Use actual userId
        },
      ],
    });

    await Warranty.findByIdAndUpdate(validated.warranty_id, { status: 'claimed' });

    await logAudit({
      userId: userId, // FIXED
      storeId: warranty.store_id,
      entity: 'claims',
      entityId: claim._id,
      action: 'create',
      newValue: claim,
    });

    return NextResponse.json({ claim }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export const GET = getHandler;
export const POST = postHandler;