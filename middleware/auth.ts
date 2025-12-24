import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractTokenFromHeader } from '@/lib/auth';

export async function authMiddleware(request: NextRequest) {
  const token = extractTokenFromHeader(request.headers.get('authorization') || '');
  
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const payload = verifyToken(token);
  
  if (!payload) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  return payload;
}

export function withAuth(handler: (req: NextRequest, context: any) => Promise<NextResponse>) {
  return async (req: NextRequest, context: any) => {
    const authResult = await authMiddleware(req);
    
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    (req as any).user = authResult;
    return handler(req, context);
  };
}
