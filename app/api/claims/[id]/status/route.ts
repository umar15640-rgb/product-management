import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Claim } from '@/models/Claim';
import { logAudit } from '@/lib/audit-logger';
import { z } from 'zod';

const statusSchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected', 'completed']),
  notes: z.string().optional(),
});

async function handler(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();

    const body = await req.json();
    const { status, notes } = statusSchema.parse(body);

    const oldClaim = await Claim.findById(params.id);
    if (!oldClaim) {
      return NextResponse.json({ error: 'Claim not found' }, { status: 404 });
    }

    const claim = await Claim.findByIdAndUpdate(
      params.id,
      {
        status,
        $push: {
          timeline_events: {
            timestamp: new Date(),
            action: `Status changed to ${status}`,
            user_id: 'system',
            notes,
          },
        },
      },
      { new: true }
    );

    await logAudit({
      userId: 'system',
      storeId: claim!.store_id,
      entity: 'claims',
      entityId: claim!._id,
      action: 'update',
      oldValue: { status: oldClaim.status },
      newValue: { status },
    });

    return NextResponse.json({ claim });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export const PUT = handler;
