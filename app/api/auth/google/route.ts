import { cookies } from 'next/headers';
import { signCookie } from '../../../../lib/admin-session';
import { FLOW_COOKIE, FLOW_SECONDS, startGoogleSignIn } from '../../../../lib/google-auth';

export async function GET() {
  try {
    const { url, flow } = startGoogleSignIn();
    (await cookies()).set(FLOW_COOKIE, signCookie(flow, 'google-flow', FLOW_SECONDS), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: FLOW_SECONDS,
    });
    return new Response(null, { status: 302, headers: { Location: url.toString(), 'Cache-Control': 'no-store' } });
  } catch {
    return new Response(null, { status: 302, headers: { Location: '/login?error=configuration', 'Cache-Control': 'no-store' } });
  }
}
