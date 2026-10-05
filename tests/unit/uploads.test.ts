import { beforeEach, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ owner: vi.fn(), put: vi.fn() }));
vi.mock('../../lib/auth', () => ({ currentOwner: mocks.owner }));
vi.mock('@vercel/blob', () => ({ put: mocks.put }));
import { POST } from '../../app/api/admin/upload/route';
import { MAX_IMAGE_BYTES } from '../../lib/image-policy';
const png = new Uint8Array([137,80,78,71,13,10,26,10,0,0,0,0]);
function request(body: Uint8Array = png, headers: Record<string,string> = {}) {
  return new Request('https://littleplay.test/api/admin/upload', {method:'POST',headers:{origin:'https://littleplay.test','content-type':'image/png',...headers},body:new Blob([new Uint8Array(body)])});
}
beforeEach(() => {
  mocks.owner.mockReset().mockResolvedValue({userId:'owner'}); mocks.put.mockReset().mockResolvedValue({});
  vi.stubEnv('BLOB_READ_WRITE_TOKEN','test-only');
});
it('rejects anonymous uploads before touching storage', async () => {
  mocks.owner.mockResolvedValue(null);
  expect((await POST(request())).status).toBe(403); expect(mocks.put).not.toHaveBeenCalled();
});
it('rejects cross-origin uploads', async () => {
  expect((await POST(request(png,{origin:'https://evil.test'}))).status).toBe(403);
});
it('rejects forged content types and oversized declared payloads', async () => {
  expect((await POST(request(new Uint8Array([1,2,3])))).status).toBe(400);
  expect((await POST(request(png,{'content-length':String(MAX_IMAGE_BYTES+1)}))).status).toBe(413);
  expect(mocks.put).not.toHaveBeenCalled();
});
it('limits streamed uploads even without Content-Length', async () => {
  expect((await POST(request(new Uint8Array(MAX_IMAGE_BYTES+1)))).status).toBe(413);
  expect(mocks.put).not.toHaveBeenCalled();
});
it('stores valid images while preserving the original quiz URL contract', async () => {
  const response=await POST(request());
  expect(response.status).toBe(200);
  const {url}=await response.json();
  expect(url).toMatch(/^\/api\/images\/[a-f0-9-]+\.png$/);
  expect(mocks.put).toHaveBeenCalledWith(`quiz/${url.split('/').at(-1)}`,expect.any(Blob),expect.objectContaining({access:'public',addRandomSuffix:false}));
});
