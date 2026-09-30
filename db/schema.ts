import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
export const quizzes = sqliteTable('quizzes', { id: text('id').primaryKey(), data: text('data').notNull(), revision: integer('revision').notNull().default(1), updatedBy: text('updated_by').notNull() });
export const spyVault = sqliteTable('spy_vault', { id: text('id').primaryKey(), data: text('data').notNull(), revision: integer('revision').notNull().default(1), updatedBy: text('updated_by').notNull() });
