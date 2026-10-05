import { put } from '@vercel/blob';
import { admin, json, sameOrigin } from '../../../../lib/quiz';
import { imageExtensions, MAX_IMAGE_BYTES, validImageBytes } from '../../../../lib/image-policy';
export const dynamic = 'force-dynamic';
export async function POST(request: Request) {
  if (!await admin()) return json({ error: 'forbidden' }, 403);
  if (!sameOrigin(request)) return json({ error: 'origin' }, 403);
  const type = request.headers.get('content-type') ?? '';
  if (!imageExtensions[type]) return json({ error: 'image' }, 400);
  if (Number(request.headers.get('content-length')) > MAX_IMAGE_BYTES) return json({ error: 'image' }, 413);
  try {
    const reader = request.body?.getReader();
    if (!reader) return json({ error: 'image' }, 400);
    const chunks: Uint8Array[] = [];
    let size = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > MAX_IMAGE_BYTES) { await reader.cancel(); return json({ error: 'image' }, 413); }
      chunks.push(value);
    }
    const bytes = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
    if (!validImageBytes(bytes, type)) return json({ error: 'image' }, 400);
    if (!process.env.BLOB_READ_WRITE_TOKEN) throw new Error('Storage is not configured');
    const key = `${crypto.randomUUID()}.${imageExtensions[type]}`;
    await put(`quiz/${key}`, new Blob([bytes], { type }), {
      access: 'public', contentType: type, addRandomSuffix: false,
    });
    return json({ url: `/api/images/${key}` });
  } catch (error) { console.error('Image upload failed', error); return json({ error: 'unavailable' }, 503); }
}
