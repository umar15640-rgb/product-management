import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { ApiKeyManagement } from '@/models/ApiKeyManagement';
import { getAuthenticatedUserId } from '@/lib/auth-helpers';
import { StoreUser } from '@/models/StoreUser';
import { z } from 'zod';

const updateApiKeySchema = z.object({
  name: z.string().min(1).optional(),
  status: z.enum(['Enabled', 'Disabled']).optional(),
  expired_at: z.string().optional(),
});

async function getHandler(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    
    const userId = getAuthenticatedUserId(req);
    const apiKey = await ApiKeyManagement.findById(params.id);

    if (!apiKey) {
      return NextResponse.json({ error: 'API key not found' }, { status: 404 });
    }

    // Verify user has access to this store
    const storeUser = await StoreUser.findOne({
      store_id: apiKey.store_id,
      user_id: userId,
    });

    if (!storeUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    return NextResponse.json({ apiKey });
  } catch (error: any) {
    if (error.message === 'Missing authorization token' || error.message === 'Invalid or expired token') {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

async function putHandler(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();

    const userId = getAuthenticatedUserId(req);
    const body = await req.json();
    const validated = updateApiKeySchema.parse(body);

    const apiKey = await ApiKeyManagement.findById(params.id);
    if (!apiKey) {
      return NextResponse.json({ error: 'API key not found' }, { status: 404 });
    }

    // Verify user has admin access to this store
    const storeUser = await StoreUser.findOne({
      store_id: apiKey.store_id,
      user_id: userId,
      role: 'admin',
    });

    if (!storeUser) {
      return NextResponse.json({ error: 'Only admin users can update API keys' }, { status: 403 });
    }

    const updateData: any = {};
    if (validated.name !== undefined) updateData.name = validated.name;
    if (validated.status !== undefined) updateData.status = validated.status;
    if (validated.expired_at !== undefined) {
      updateData.expired_at = validated.expired_at ? new Date(validated.expired_at) : null;
    }

    const updatedApiKey = await ApiKeyManagement.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true }
    );

    return NextResponse.json({ apiKey: updatedApiKey });
  } catch (error: any) {
    if (error.message === 'Missing authorization token' || error.message === 'Invalid or expired token') {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

async function deleteHandler(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();

    const userId = getAuthenticatedUserId(req);

    const apiKey = await ApiKeyManagement.findById(params.id);
    if (!apiKey) {
      return NextResponse.json({ error: 'API key not found' }, { status: 404 });
    }

    // Verify user has admin access to this store
    const storeUser = await StoreUser.findOne({
      store_id: apiKey.store_id,
      user_id: userId,
      role: 'admin',
    });

    if (!storeUser) {
      return NextResponse.json({ error: 'Only admin users can delete API keys' }, { status: 403 });
    }

    await ApiKeyManagement.findByIdAndDelete(params.id);

    return NextResponse.json({ message: 'API key deleted successfully' });
  } catch (error: any) {
    if (error.message === 'Missing authorization token' || error.message === 'Invalid or expired token') {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export const GET = getHandler;
export const PUT = putHandler;
export const DELETE = deleteHandler;
