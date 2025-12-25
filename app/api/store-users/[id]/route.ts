import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { StoreUser } from '@/models/StoreUser';

async function putHandler(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();

    const body = await req.json();
    const storeUser = await StoreUser.findByIdAndUpdate(params.id, body, { new: true });

    if (!storeUser) {
      return NextResponse.json({ error: 'Store user not found' }, { status: 404 });
    }

    return NextResponse.json({ storeUser });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

async function deleteHandler(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();

    const storeUser = await StoreUser.findByIdAndDelete(params.id);
    if (!storeUser) {
      return NextResponse.json({ error: 'Store user not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Store user removed' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export const PUT = putHandler;
export const DELETE = deleteHandler;
