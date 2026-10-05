import { head, BlobNotFoundError } from '@vercel/blob';
export async function GET(_request: Request, { params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  if (!/^[a-f0-9-]+\.(png|jpg|webp)$/.test(key)) return new Response(null, { status: 404 });
  try {
    if (!process.env.BLOB_READ_WRITE_TOKEN) return new Response(null, { status: 503 });
    const image = await head(`quiz/${key}`);
    return new Response(null, { status: 307, headers: {
      Location: image.url, 'Cache-Control': 'public, max-age=31536000, immutable',
      'X-Content-Type-Options': 'nosniff',
    } });
  } catch (error) {
    if (error instanceof BlobNotFoundError) return new Response(null, { status: 404 });
    console.error('Image lookup failed', error); return new Response(null, { status: 503 });
  }
}
