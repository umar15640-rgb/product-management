import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getUserIdFromToken } from './auth';
import { connectDB } from './db';
import { StoreUser } from '@/models/StoreUser';

export interface AuthContext {
  userId: string;
  storeId?: string;
  storeUser?: any;
}

/**
 * Extracts and validates JWT token from request
 */
export function getAuthToken(req: NextRequest): string | null {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.slice(7);
}

/**
 * Gets authenticated user ID from request
 */
export function getAuthenticatedUserId(req: NextRequest): string {
  const token = getAuthToken(req);
  if (!token) {
    throw new Error('Missing authorization token');
  }
  try {
    return getUserIdFromToken(token);
  } catch (error: any) {
    throw new Error('Invalid or expired token');
  }
}

/**
 * Middleware helper to authenticate requests
 */
export async function authenticateRequest(req: NextRequest): Promise<AuthContext> {
  const token = getAuthToken(req);
  if (!token) {
    throw new Error('Missing authorization');
  }

  const userId = getUserIdFromToken(token);
  return { userId };
}

/**
 * Middleware helper to authenticate requests and get store context
 */
export async function authenticateStoreRequest(req: NextRequest, storeId?: string): Promise<AuthContext> {
  const authContext = await authenticateRequest(req);
  
  if (storeId) {
    await connectDB();
    const storeUser = await StoreUser.findOne({
      store_id: storeId,
      user_id: authContext.userId,
    }).populate('store_id').populate('user_id');
    
    if (!storeUser) {
      throw new Error('User does not have access to this store');
    }
    
    return {
      ...authContext,
      storeId,
      storeUser,
    };
  }
  
  return authContext;
}

/**
 * Checks if a store user has a specific permission
 */
export function hasPermission(storeUser: any, permission: string): boolean {
  if (!storeUser) return false;
  
  // Admin has all permissions
  if (storeUser.role === 'admin') return true;
  
  // Check if 'all' permission is granted
  if (storeUser.permissions?.includes('all')) return true;
  
  // Check specific permission
  return storeUser.permissions?.includes(permission) || false;
}

/**
 * Checks if a store user is admin
 */
export function isAdmin(storeUser: any): boolean {
  return storeUser?.role === 'admin';
}
