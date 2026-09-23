import { cookies } from 'next/headers';
import { createSession, readCookie, SESSION_SECONDS } from '../../../../../lib/admin-session';
import { SESSION_COOKIE } from '../../../../../lib/auth';
import { finishGoogleSignIn, FLOW_COOKIE, FLOW_SECONDS, type GoogleFlow } from '../../../../../lib/google-auth';

export async function GET(request: Request) {
  const jar = await cookies();
  const flow = readCookie<GoogleFlow>(jar.get(FLOW_COOKIE)?.value, 'google-flow', FLOW_SECONDS);
  jar.delete(FLOW_COOKIE);
  const params = new URL(request.url).searchParams;
  let location = '/login?error=access';
  try {
    const code = params.get('code');
    if (!flow || !code || params.get('error') || params.get('state') !== flow.state) throw new Error('Invalid Google callback');
    const user = await finishGoogleSignIn(code, flow);
    jar.set(SESSION_COOKIE, createSession(user), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: SESSION_SECONDS,
    });
    location = '/admin';
  } catch {
    // Never expose OAuth codes, tokens, or credentials in logs or responses.
  }
  return new Response(null, { status: 303, headers: { Location: location, 'Cache-Control': 'no-store', 'Referrer-Policy': 'no-referrer' } });
}
