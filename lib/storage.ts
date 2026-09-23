import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { requiredEnv } from './env';

function client() {
  return new S3Client({
    region: 'auto',
    endpoint: requiredEnv('R2_ENDPOINT'),
    credentials: {
      accessKeyId: requiredEnv('R2_ACCESS_KEY_ID'),
      secretAccessKey: requiredEnv('R2_SECRET_ACCESS_KEY'),
    },
  });
}

export async function putImage(key: string, bytes: Uint8Array, contentType: string) {
  await client().send(new PutObjectCommand({
    Bucket: requiredEnv('R2_BUCKET_NAME'),
    Key: key,
    Body: bytes,
    ContentType: contentType,
  }));
}

export async function getImage(key: string) {
  try {
    const result = await client().send(new GetObjectCommand({
      Bucket: requiredEnv('R2_BUCKET_NAME'),
      Key: key,
    }));
    if (!result.Body) return null;
    return {
      body: result.Body.transformToWebStream(),
      contentType: result.ContentType ?? 'application/octet-stream',
    };
  } catch (error) {
    if ((error as { $metadata?: { httpStatusCode?: number } }).$metadata?.httpStatusCode === 404) return null;
    throw error;
  }
}
