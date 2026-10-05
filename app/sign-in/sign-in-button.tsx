'use client';
import { signIn } from 'next-auth/react';

export default function SignInButton({ returnTo }: { returnTo: string }) {
  return <button type="button" onClick={() => void signIn('google', { redirectTo: returnTo })}>
    Continue with Google · 使用 Google 登录 · Teruskan dengan Google
  </button>;
}
