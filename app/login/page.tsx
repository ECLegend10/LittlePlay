import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getAdmin } from '../../lib/auth';

export const dynamic = 'force-dynamic';

export default async function Login({ searchParams }: {
  searchParams: Promise<{ error?: string }>;
}) {
  if (await getAdmin()) redirect('/admin');
  const { error } = await searchParams;
  return <main style={{ maxWidth: 480, margin: '12vh auto', padding: 24 }}>
    <Link className="brand" href="/">littleplay</Link>
    <h1>Sign in to edit</h1>
    <section className="play-panel">
      <p>Use the Google account authorized to manage this site.</p>
      {error && <p role="alert">{error === 'configuration'
        ? 'Google sign-in has not been configured yet.'
        : 'Sign-in failed or this Google account does not have access. Please try again.'}</p>}
      {/* OAuth must start with a full navigation, without route prefetching. */}
      {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
      <a className="primary link-button" href="/api/auth/google">Sign in with Google</a>
    </section>
  </main>;
}
