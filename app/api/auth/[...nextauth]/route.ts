import type { NextRequest } from 'next/server';
import { handlers } from '../../../../auth';
import { authConfigured } from '../../../../lib/auth-policy';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  if (!authConfigured()) return Response.json({ error: 'Authentication is not configured' }, { status: 503 });
  return handlers.GET(request);
}

export async function POST(request: NextRequest) {
  if (!authConfigured()) return Response.json({ error: 'Authentication is not configured' }, { status: 503 });
  return handlers.POST(request);
}
