import { cookies } from 'next/headers';
import { readSession } from './admin-session';

export const SESSION_COOKIE = 'littleplay_admin';

export async function getAdmin() {
  return readSession((await cookies()).get(SESSION_COOKIE)?.value);
}
