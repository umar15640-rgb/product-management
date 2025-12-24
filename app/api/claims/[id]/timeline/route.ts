import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Claim } from '@/models/Claim';
import { withAuth } from '@/middleware/auth';
import { z } from 'zod';

const timelineSchema = z.object({
  action: z.string(),
  notes: z.string().optional(),
});

async function handler(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const user = (req as any).user;

    const body = await req.json();
    const { action, notes } = timelineSchema.parse(body);

    const claim = await Claim.findByIdAndUpdate(
      params.id,
      {
        $push: {
          timeline_events: {
            timestamp: new Date(),
            action,
            user_id: user.userId,
            notes,
          },
        },
      },
      { new: true }
    );

    if (!claim) {
      return NextResponse.json({ error: 'Claim not found' }, { status: 404 });
    }

    return NextResponse.json({ claim });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export const POST = withAuth(handler);
