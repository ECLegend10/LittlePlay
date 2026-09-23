import { requiredEnv } from './env';

type QueryResult<T> = {
  success: boolean;
  results: T[];
  meta: { changes: number };
};

// D1's HTTP API lets the Node.js runtime use the existing SQLite database.
export async function queryD1<T = Record<string, unknown>>(
  sql: string,
  params: (string | number | null)[] = [],
): Promise<QueryResult<T>> {
  const account = encodeURIComponent(requiredEnv('CLOUDFLARE_ACCOUNT_ID'));
  const database = encodeURIComponent(requiredEnv('CLOUDFLARE_D1_DATABASE_ID'));
  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${account}/d1/database/${database}/query`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${requiredEnv('CLOUDFLARE_D1_API_TOKEN')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sql, params }),
      cache: 'no-store',
      signal: AbortSignal.timeout(15000),
    },
  );
  if (!response.ok) throw new Error(`D1 request failed (${response.status})`);
  const payload = await response.json() as {
    success: boolean;
    result?: QueryResult<T>[];
  };
  const result = payload.result?.[0];
  if (!payload.success || !result?.success) throw new Error('D1 query failed');
  return result;
}

// Keep the small prepared-statement interface used by the quiz routes.
export function database() {
  return {
    prepare(sql: string) {
      return {
        bind(...params: (string | number | null)[]) {
          return {
            run: () => queryD1(sql, params),
            async first<T>() {
              const result = await queryD1<T>(sql, params);
              return result.results[0] ?? null;
            },
          };
        },
      };
    },
  };
}
