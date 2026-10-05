import { pgTable, text, integer, jsonb } from 'drizzle-orm/pg-core';
const columns = () => ({
  id: text('id').primaryKey(),
  data: jsonb('data').notNull(),
  revision: integer('revision').notNull().default(1),
  updatedBy: text('updated_by').notNull(),
});
export const quizzes = pgTable('quizzes', columns());
export const spyVault = pgTable('spy_vault', columns());
export const siteSettings = pgTable('site_settings', columns());
