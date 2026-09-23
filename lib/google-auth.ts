import { createHash, randomBytes } from 'node:crypto';
import { createRemoteJWKSet, jwtVerify, type JWTPayload, type JWTVerifyGetKey } from 'jose';
import { requiredEnv } from './env';
import type { AdminUser } from './admin-session';

export const FLOW_COOKIE = 'littleplay_google_flow';
export const FLOW_SECONDS = 600;
export type GoogleFlow = { state: string; nonce: string; verifier: string };
const googleKeys = createRemoteJWKSet(new URL('https://www.googleapis.com/oauth2/v3/certs'));

export function callbackUrl() {
  const url = new URL(requiredEnv('APP_URL'));
  if (url.protocol !== 'https:' && !(url.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(url.hostname))) {
    throw new Error('APP_URL must use HTTPS, except on localhost');
  }
  return `${url.origin}/api/auth/callback/google`;
}

export function startGoogleSignIn() {
  requiredEnv('ADMIN_EMAIL');
  requiredEnv('GOOGLE_CLIENT_SECRET');
  const random = () => randomBytes(32).toString('base64url');
  const flow: GoogleFlow = { state: random(), nonce: random(), verifier: random() };
  const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  url.search = new URLSearchParams({
    client_id: requiredEnv('GOOGLE_CLIENT_ID'),
    redirect_uri: callbackUrl(),
    response_type: 'code',
    scope: 'openid email',
    state: flow.state,
    nonce: flow.nonce,
    code_challenge: createHash('sha256').update(flow.verifier).digest('base64url'),
    code_challenge_method: 'S256',
    prompt: 'select_account',
  }).toString();
  return { url, flow };
}

// Called only after signature, issuer, audience, and expiry verification.
export function googleAdmin(payload: JWTPayload, nonce: string): AdminUser {
  if (payload.nonce !== nonce || payload.email_verified !== true ||
      typeof payload.email !== 'string' || typeof payload.sub !== 'string' || !payload.sub ||
      payload.email.toLowerCase() !== requiredEnv('ADMIN_EMAIL').toLowerCase()) {
    throw new Error('Google account is not authorized');
  }
  return { userId: `google:${payload.sub}`, email: payload.email.toLowerCase() };
}

export async function verifyGoogleIdToken(token: string, nonce: string, keys: JWTVerifyGetKey = googleKeys) {
  const { payload } = await jwtVerify(token, keys, {
    issuer: ['https://accounts.google.com', 'accounts.google.com'],
    audience: requiredEnv('GOOGLE_CLIENT_ID'),
    algorithms: ['RS256'],
    requiredClaims: ['exp', 'iat', 'sub', 'nonce', 'email', 'email_verified'],
  });
  if (payload.azp && payload.azp !== requiredEnv('GOOGLE_CLIENT_ID')) throw new Error('Unexpected authorized party');
  return googleAdmin(payload, nonce);
}

export async function finishGoogleSignIn(code: string, flow: GoogleFlow) {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    body: new URLSearchParams({
      client_id: requiredEnv('GOOGLE_CLIENT_ID'),
      client_secret: requiredEnv('GOOGLE_CLIENT_SECRET'),
      redirect_uri: callbackUrl(),
      code,
      code_verifier: flow.verifier,
      grant_type: 'authorization_code',
    }),
    cache: 'no-store',
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) throw new Error('Google token exchange failed');
  const tokens = await response.json() as { id_token?: string };
  if (!tokens.id_token) throw new Error('Google ID token is missing');
  return verifyGoogleIdToken(tokens.id_token, flow.nonce);
}
