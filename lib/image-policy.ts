export const MAX_IMAGE_BYTES = 4_000_000;
export const imageExtensions: Record<string, string> = {
  'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp',
};

export function validImageBytes(bytes: Uint8Array, type: string): boolean {
  const sig = Array.from(bytes.slice(0, 12));
  if (type === 'image/png') return sig.slice(0, 8).join(',') === '137,80,78,71,13,10,26,10';
  if (type === 'image/jpeg') return sig[0] === 255 && sig[1] === 216 && sig[2] === 255;
  if (type === 'image/webp') return String.fromCharCode(...sig.slice(0, 4)) === 'RIFF'
    && String.fromCharCode(...sig.slice(8, 12)) === 'WEBP';
  return false;
}
