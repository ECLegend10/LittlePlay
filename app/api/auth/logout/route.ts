import { cookies } from 'next/headers';
import { SESSION_COOKIE } from '../../../../lib/auth';
import { sameOrigin } from '../../../../lib/quiz';

export async function POST(request: Request) {
  if (!sameOrigin(request)) return new Response('Forbidden', { status: 403 });
  (await cookies()).delete(SESSION_COOKIE);
  return new Response(null, { status: 303, headers: { Location: '/login' } });
}
