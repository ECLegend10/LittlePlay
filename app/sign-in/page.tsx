import { authConfigured, safeReturnPath } from '../../lib/auth-policy';
import SignInButton from './sign-in-button';

export const dynamic = 'force-dynamic';

export default async function SignInPage({ searchParams }: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { callbackUrl } = await searchParams;
  return <main className="auth-page">
    <h1>Little Play</h1>
    <p>Sign in to edit · 登录编辑 · Log masuk untuk menyunting</p>
    {authConfigured()
      ? <SignInButton returnTo={safeReturnPath(callbackUrl)} />
      : <p>Sign-in is currently unavailable. Please try again later.<br />登录暂时不可用，请稍后重试。<br />Log masuk tidak tersedia buat masa ini.</p>}
    {/* A full reload is required by the preserved vanilla game bootstrap. */}
    {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
    <p><a href="/">Back to activities · 返回活动 · Kembali ke aktiviti</a></p>
  </main>;
}
