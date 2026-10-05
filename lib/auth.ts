import { auth } from '../auth';
import { authConfigured, isOwnerEmail, safeReturnPath } from './auth-policy';

export async function currentOwner() {
  if (!authConfigured()) return null;
  const session = await auth();
  if (!isOwnerEmail(session?.user?.email)) return null;
  return { userId: session!.user!.email!, email: session!.user!.email! };
}

export function signInPath(returnTo: string) {
  return `/sign-in?callbackUrl=${encodeURIComponent(safeReturnPath(returnTo))}`;
}
