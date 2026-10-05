import { beforeEach, expect, it, vi } from 'vitest';
// Exercise the actual Drizzle/Postgres statements using a test-only Postgres emulator.
const memory = vi.hoisted(() => ({ pool: null as unknown as {
  query: (sql: string, params?: unknown[]) => Promise<{ rows: Record<string, unknown>[]; rowCount: number }>;
} }));
vi.mock('@neondatabase/serverless', async () => {
  const { newDb } = await import('pg-mem');
  const { Pool } = newDb().adapters.createPg();
  memory.pool = new Pool();
  const { readFileSync } = await import('node:fs');
  await memory.pool.query(readFileSync('migrations/0001_postgres.sql','utf8'));
  return { neon: () => ({ query: async (sql: string, params: unknown[], options: { arrayMode?: boolean }) => {
    const result = await memory.pool.query(sql, params);
    return { ...result, rows: options?.arrayMode ? result.rows.map(Object.values) : result.rows };
  } }) };
});
import { readDocument, writeDocument } from '../../lib/documents';
beforeEach(async () => {
  vi.stubEnv('DATABASE_URL','postgresql://test-only');
  for (const table of ['quizzes','spy_vault','site_settings']) await memory.pool.query(`DELETE FROM ${table}`);
});
it('reads defaults without storing them, then round-trips localized JSON', async () => {
  expect(await readDocument('quizzes', {published:false})).toEqual({data:{published:false},revision:0});
  const data = {title:{en:'Test',cn:'测试',bm:'Ujian'},published:true};
  expect(await writeDocument('quizzes',data,0,'owner')).toBe(1);
  expect(await readDocument('quizzes',null)).toEqual({data,revision:1});
});
it('rejects duplicate creation and stale revisions without losing content', async () => {
  expect(await writeDocument('site_settings',{timerTarget:5},0,'owner')).toBe(1);
  expect(await writeDocument('site_settings',{timerTarget:9},0,'owner')).toBeNull();
  expect(await writeDocument('site_settings',{timerTarget:6},1,'owner')).toBe(2);
  expect(await writeDocument('site_settings',{timerTarget:7},1,'owner')).toBeNull();
  expect(await readDocument('site_settings',null)).toEqual({data:{timerTarget:6},revision:2});
});
it('isolates quiz, spy vault and settings records', async () => {
  for (const table of ['quizzes','spy_vault','site_settings'] as const) await writeDocument(table,{table},0,'owner');
  expect((await readDocument('spy_vault',null)).data).toEqual({table:'spy_vault'});
});
