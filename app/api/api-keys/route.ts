import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { ApiKeyManagement } from '@/models/ApiKeyManagement';
import { getAuthenticatedUserId, authenticateStoreRequest } from '@/lib/auth-helpers';
import { StoreUser } from '@/models/StoreUser';
import { z } from 'zod';
import mongoose from 'mongoose';

const apiKeySchema = z.object({
  store_id: z.string(),
  name: z.string().min(1, 'Name is required'),
  expired_at: z.string().optional(),
});

async function getHandler(req: NextRequest) {
  try {
    await connectDB();
    
    const userId = getAuthenticatedUserId(req);
    const { searchParams } = new URL(req.url);
    const storeId = searchParams.get('store_id');

    if (!storeId) {
      return NextResponse.json({ error: 'store_id is required' }, { status: 400 });
    }

    // Verify user has access to this store
    await authenticateStoreRequest(req, storeId);

    const apiKeys = await ApiKeyManagement.find({ store_id: storeId })
      .sort({ created_at: -1 });

    return NextResponse.json({ apiKeys });
  } catch (error: any) {
    if (error.message === 'Missing authorization token' || error.message === 'Invalid or expired token') {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

async function postHandler(req: NextRequest) {
  try {
    await connectDB();

    const userId = getAuthenticatedUserId(req);
    const body = await req.json();
    const validated = apiKeySchema.parse(body);

    // Verify user has admin access to this store
    const storeUser = await StoreUser.findOne({
      store_id: validated.store_id,
      user_id: userId,
      role: 'admin',
    });

    if (!storeUser) {
      return NextResponse.json({ error: 'Only admin users can create API keys' }, { status: 403 });
    }

    const apiKey = await ApiKeyManagement.create({
      store_id: validated.store_id,
      name: validated.name,
      status: 'Enabled',
      expired_at: validated.expired_at ? new Date(validated.expired_at) : undefined,
    });

    // The _id of the API key is the actual API key that external systems will use
    return NextResponse.json({ 
      apiKey: {
        _id: apiKey._id,
        name: apiKey.name,
        store_id: apiKey.store_id,
        status: apiKey.status,
        expired_at: apiKey.expired_at,
        created_at: apiKey.created_at,
      }
    }, { status: 201 });
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

export const GET = getHandler;
export const POST = postHandler;
