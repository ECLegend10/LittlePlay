import { afterEach, describe, expect, it, vi } from 'vitest';
import { authConfigured, isOwnerEmail, safeReturnPath, verifiedOwnerProfile } from '../../lib/auth-policy';
afterEach(() => vi.unstubAllEnvs());
describe('verified owner identity', () => {
  it('fails closed with no configured owner', () => {
    vi.stubEnv('ADMIN_EMAIL', '');
    expect(isOwnerEmail('owner@example.com')).toBe(false);
  });
  it('requires verified Google email matching the configured owner', () => {
    vi.stubEnv('ADMIN_EMAIL', 'owner@example.com');
    expect(verifiedOwnerProfile({email:'OWNER@example.com',email_verified:true})).toBe(true);
    expect(verifiedOwnerProfile({email:'owner@example.com',email_verified:false})).toBe(false);
    expect(verifiedOwnerProfile({email:'other@example.com',email_verified:true})).toBe(false);
    expect(verifiedOwnerProfile({email:'owner@example.com'})).toBe(false);
  });
  it('requires all OAuth configuration keys', () => {
    for (const key of ['ADMIN_EMAIL','AUTH_SECRET','AUTH_GOOGLE_ID','AUTH_GOOGLE_SECRET']) vi.stubEnv(key,'test-only-configuration-32-characters');
    expect(authConfigured()).toBe(true);
    vi.stubEnv('AUTH_SECRET','');
    expect(authConfigured()).toBe(false);
  });
});
it('rejects external, auth-loop and backslash return paths', () => {
  for(const path of ['https://evil.test','//evil.test','/\\evil.test','/api/auth/signin','/sign-in']) {
    expect(safeReturnPath(path)).toBe('/admin');
  }
  expect(safeReturnPath('/admin/quiz?draft=1')).toBe('/admin/quiz?draft=1');
});
