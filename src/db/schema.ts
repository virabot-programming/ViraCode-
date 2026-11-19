import { relations } from 'drizzle-orm';
import { integer, jsonb, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

export interface RepoFileRecord {
  path: string;
  name: string;
  language: string;
  content: string;
}

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(),
  email: text('email').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const gitboxRepos = pgTable('gitbox_repos', {
  id: text('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id)
    .notNull(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  author: text('author').notNull(),
  primaryLanguage: text('primary_language').notNull(),
  files: jsonb('files').$type<RepoFileRecord[]>().notNull().default([]),
  stars: integer('stars').notNull().default(1),
  forks: integer('forks').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  gitboxRepos: many(gitboxRepos),
}));

export const gitboxReposRelations = relations(gitboxRepos, ({ one }) => ({
  owner: one(users, {
    fields: [gitboxRepos.userId],
    references: [users.id],
  }),
}));
