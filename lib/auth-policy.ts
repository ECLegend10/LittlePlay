export function isOwnerEmail(email: unknown): boolean {
  const owner = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  return !!owner && typeof email === 'string' && email.trim().toLowerCase() === owner;
}

export function verifiedOwnerProfile(profile: unknown): boolean {
  if (!profile || typeof profile !== 'object') return false;
  const value = profile as Record<string, unknown>;
  return value.email_verified === true && isOwnerEmail(value.email);
}

export function authConfigured(): boolean {
  return ['AUTH_SECRET', 'AUTH_GOOGLE_ID', 'AUTH_GOOGLE_SECRET', 'ADMIN_EMAIL']
    .every(key => !!process.env[key]?.trim()) && (process.env.AUTH_SECRET?.length ?? 0) >= 32;
}

export function safeReturnPath(value: string | null | undefined): string {
  if (!value?.startsWith('/') || value.startsWith('//')) return '/admin';
  try {
    const url = new URL(value, 'https://app.local');
    if (url.origin !== 'https://app.local' || /^\/(api\/auth|sign-in)(\/|$)/.test(url.pathname)) return '/admin';
    return `${url.pathname}${url.search}${url.hash}`;
  } catch { return '/admin'; }
}
