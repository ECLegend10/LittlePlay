import assert from 'node:assert/strict';
import { afterEach, mock, test } from 'node:test';
import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { createSession, SESSION_SECONDS, readSession, signCookie, readCookie } from '../lib/admin-session';
import { database, queryD1 } from '../lib/d1';
import { getImage, putImage } from '../lib/storage';
import { googleAdmin, startGoogleSignIn, verifyGoogleIdToken, FLOW_SECONDS } from '../lib/google-auth';
import { createLocalJWKSet, exportJWK, generateKeyPair, SignJWT } from 'jose';

const originalFetch = globalThis.fetch;
const originalEnv = { ...process.env };
afterEach(() => {
  globalThis.fetch = originalFetch;
  process.env = { ...originalEnv };
  mock.restoreAll();
});

function configureAuth() {
  process.env.ADMIN_EMAIL = 'admin@example.com';
  process.env.ADMIN_SESSION_SECRET = 'an-independent-test-secret-with-32-characters';
}

const user = { userId: 'google:123', email: 'admin@example.com' };

test('admin sessions reject tampering, expiration and credential rotation', () => {
  configureAuth();
  const now = 1800000000000;
  const token = createSession(user, now);
  assert.deepEqual(readSession(token, now), user);
  assert.equal(readSession(`${token}x`, now), null);
  assert.equal(readSession(token, now + SESSION_SECONDS * 1000), null);
  assert.equal(readSession(token, now - 1000), null);
  process.env.ADMIN_SESSION_SECRET += 'rotated';
  assert.equal(readSession(token, now), null);
});

test('changing the allowed email revokes sessions and missing configuration fails closed', () => {
  configureAuth();
  const token = createSession(user);
  process.env.ADMIN_EMAIL = 'different@example.com';
  assert.equal(readSession(token), null);
  delete process.env.ADMIN_SESSION_SECRET;
  assert.throws(() => createSession(user));
  for (const token of [undefined, '', 'fake', '123.bad.extra', 'NaN.signature']) {
    assert.equal(readSession(token), null);
  }
});

test('Google authorization uses state, nonce, PKCE and a fixed callback', () => {
  configureAuth();
  process.env.APP_URL = 'https://littleplay.example';
  process.env.GOOGLE_CLIENT_ID = 'test-client';
  process.env.GOOGLE_CLIENT_SECRET = 'test-secret';
  const { url, flow } = startGoogleSignIn();
  assert.equal(url.origin, 'https://accounts.google.com');
  assert.equal(url.searchParams.get('redirect_uri'), 'https://littleplay.example/api/auth/callback/google');
  assert.equal(url.searchParams.get('state'), flow.state);
  assert.equal(url.searchParams.get('nonce'), flow.nonce);
  assert.equal(url.searchParams.get('code_challenge_method'), 'S256');
  assert.ok(url.searchParams.get('code_challenge'));
  assert.notEqual(flow.state, startGoogleSignIn().flow.state);
  const cookie = signCookie(flow, 'google-flow', FLOW_SECONDS);
  assert.equal(readSession(cookie), null);
  assert.ok(readCookie(cookie, 'google-flow', FLOW_SECONDS));
  assert.equal(readCookie(cookie + 'x', 'google-flow', FLOW_SECONDS), null);
});

test('Google identity requires the allowed verified email and matching nonce', () => {
  configureAuth();
  const claims = { sub: '123', email: 'ADMIN@example.com', email_verified: true, nonce: 'test-nonce' };
  assert.deepEqual(googleAdmin(claims, 'test-nonce'), user);
  assert.throws(() => googleAdmin({ ...claims, email: 'other@example.com' }, 'test-nonce'));
  assert.throws(() => googleAdmin({ ...claims, email_verified: false }, 'test-nonce'));
  assert.throws(() => googleAdmin(claims, 'different-nonce'));
});

function configureD1() {
  process.env.CLOUDFLARE_ACCOUNT_ID = 'test-account';
  process.env.CLOUDFLARE_D1_DATABASE_ID = 'test-database';
  process.env.CLOUDFLARE_D1_API_TOKEN = 'test-token';
}

test('Google ID tokens require a trusted signature, issuer, audience and expiry', async () => {
  configureAuth();
  process.env.GOOGLE_CLIENT_ID = 'test-client';
  const { publicKey, privateKey } = await generateKeyPair('RS256');
  const keys = createLocalJWKSet({ keys: [await exportJWK(publicKey)] });
  const claims = { email: user.email, email_verified: true, nonce: 'nonce' };
  const jwt = () => new SignJWT(claims).setProtectedHeader({ alg: 'RS256' }).setSubject('123').setIssuedAt().setIssuer('https://accounts.google.com').setAudience('test-client').setExpirationTime('5m');
  const token = await jwt().sign(privateKey);
  assert.deepEqual(await verifyGoogleIdToken(token, 'nonce', keys), user);
  await assert.rejects(verifyGoogleIdToken(token.slice(0, -20) + 'tampered', 'nonce', keys));
  await assert.rejects(verifyGoogleIdToken(await jwt().setIssuer('https://attacker.example').sign(privateKey), 'nonce', keys));
  await assert.rejects(verifyGoogleIdToken(await jwt().setAudience('other-client').sign(privateKey), 'nonce', keys));
  await assert.rejects(verifyGoogleIdToken(await jwt().setExpirationTime(1).sign(privateKey), 'nonce', keys));
});

test('D1 sends parameterized queries and preserves conflict metadata', async () => {
  configureD1();
  globalThis.fetch = async (url, init) => {
    assert.equal(String(url), 'https://api.cloudflare.com/client/v4/accounts/test-account/d1/database/test-database/query');
    assert.equal(new Headers(init?.headers).get('Authorization'), 'Bearer test-token');
    assert.deepEqual(JSON.parse(init?.body as string), { sql: 'UPDATE quizzes SET data = ? WHERE revision = ?', params: ['{}', 2] });
    assert.equal(init?.cache, 'no-store');
    return Response.json({ success: true, result: [{ success: true, results: [], meta: { changes: 0 } }] });
  };
  const result = await database().prepare('UPDATE quizzes SET data = ? WHERE revision = ?').bind('{}', 2).run();
  assert.equal(result.meta.changes, 0);
});

test('D1 returns the first row or null', async () => {
  configureD1();
  const rows = [{ revision: 3 }];
  globalThis.fetch = async () => Response.json({ success: true, result: [{ success: true, results: rows, meta: { changes: 0 } }] });
  assert.deepEqual(await database().prepare('SELECT revision').bind().first(), { revision: 3 });
  rows.pop();
  assert.equal(await database().prepare('SELECT revision').bind().first(), null);
});

test('D1 HTTP and SQL failures are not treated as empty quizzes', async () => {
  configureD1();
  globalThis.fetch = async () => new Response(null, { status: 403 });
  await assert.rejects(queryD1('SELECT 1'), /403/);
  globalThis.fetch = async () => Response.json({ success: true, result: [{ success: false }] });
  await assert.rejects(queryD1('SELECT 1'), /query failed/);
});

function configureStorage() {
  process.env.R2_ENDPOINT = 'https://example.r2.cloudflarestorage.com';
  process.env.R2_ACCESS_KEY_ID = 'test-key';
  process.env.R2_SECRET_ACCESS_KEY = 'test-secret';
  process.env.R2_BUCKET_NAME = 'test-images';
}

test('image writes preserve keys, bytes and content type', async () => {
  configureStorage();
  const bytes = new Uint8Array([1, 2, 3]);
  mock.method(S3Client.prototype, 'send', async (command: PutObjectCommand) => {
    assert.ok(command instanceof PutObjectCommand);
    assert.deepEqual(command.input, { Bucket: 'test-images', Key: 'abc.png', Body: bytes, ContentType: 'image/png' });
    return {};
  });
  await putImage('abc.png', bytes, 'image/png');
});

test('image reads stream bytes and distinguish missing objects from service errors', async () => {
  configureStorage();
  const stream = new ReadableStream({ start(controller) { controller.enqueue(new Uint8Array([1])); controller.close(); } });
  const send = mock.method(S3Client.prototype, 'send', async (command: GetObjectCommand) => {
    assert.ok(command instanceof GetObjectCommand);
    return { Body: { transformToWebStream: () => stream }, ContentType: 'image/png' };
  });
  const image = await getImage('abc.png');
  assert.equal(image?.contentType, 'image/png');
  assert.deepEqual(new Uint8Array(await new Response(image?.body).arrayBuffer()), new Uint8Array([1]));
  send.mock.mockImplementation(async () => { throw { $metadata: { httpStatusCode: 404 } }; });
  assert.equal(await getImage('missing.png'), null);
  send.mock.mockImplementation(async () => { throw new Error('unavailable'); });
  await assert.rejects(getImage('abc.png'), /unavailable/);
});
