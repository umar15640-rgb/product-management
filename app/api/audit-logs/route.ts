import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { SystemAuditLog } from '@/models/SystemAuditLog';

async function handler(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const storeId = searchParams.get('storeId');
    const entity = searchParams.get('entity');
    const entityId = searchParams.get('entityId');
    const userId = searchParams.get('userId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    const query: any = {};
    if (storeId) query.store_id = storeId;
    if (entity) query.entity = entity;
    if (entityId) query.entity_id = entityId;
    if (userId) query.user_id = userId;

    const logs = await SystemAuditLog.find(query)
      .populate('user_id', 'full_name email')
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ created_at: -1 });

    const total = await SystemAuditLog.countDocuments(query);

    return NextResponse.json({ logs, total, page, pages: Math.ceil(total / limit) });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export const GET = handler;
