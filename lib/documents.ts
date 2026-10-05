import { eq, and, sql } from 'drizzle-orm';
import { getDb } from '../db';
import { quizzes, spyVault, siteSettings } from '../db/schema';

export type Collection = 'quizzes' | 'spy_vault' | 'site_settings';
const tables = { quizzes, spy_vault: spyVault, site_settings: siteSettings };

export async function readDocument<T>(collection: Collection, fallback: T) {
  const table = tables[collection];
  const [row] = await getDb().select({ data: table.data, revision: table.revision })
    .from(table).where(eq(table.id, 'main'));
  return { data: row ? row.data as T : fallback, revision: row?.revision ?? 0 };
}

// Conditional writes keep concurrent editors from silently overwriting a revision.
export async function writeDocument(collection: Collection, data: unknown, revision: number, userId: string) {
  const table = tables[collection];
  const database = getDb();
  const result = revision === 0
    ? await database.insert(table).values({ id: 'main', data, revision: 1, updatedBy: userId })
      .onConflictDoNothing().returning({ revision: table.revision })
    : await database.update(table).set({ data, revision: sql`${table.revision} + 1`, updatedBy: userId })
      .where(and(eq(table.id, 'main'), eq(table.revision, revision))).returning({ revision: table.revision });
  return result[0]?.revision ?? null;
}
