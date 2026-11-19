import { desc, eq, sql } from 'drizzle-orm';
import { db } from './index.ts';
import { gitboxRepos, RepoFileRecord } from './schema.ts';

export interface CreateGitboxRepoInput {
  userId: number;
  name: string;
  description: string;
  author: string;
  primaryLanguage: string;
  files: RepoFileRecord[];
}

export async function listGitboxRepos() {
  try {
    return await db
      .select()
      .from(gitboxRepos)
      .orderBy(desc(gitboxRepos.createdAt));
  } catch (error) {
    console.error('Failed to list GitBox repositories:', error);
    throw new Error('Failed to load repositories.', { cause: error });
  }
}

export async function getGitboxRepoById(id: string) {
  try {
    const rows = await db
      .select()
      .from(gitboxRepos)
      .where(eq(gitboxRepos.id, id));
    return rows[0] ?? null;
  } catch (error) {
    console.error('Failed to load GitBox repository by id:', error);
    throw new Error('Failed to load repository details.', { cause: error });
  }
}

export async function createGitboxRepo(input: CreateGitboxRepoInput) {
  try {
    const id = `gb-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`;
    const inserted = await db
      .insert(gitboxRepos)
      .values({
        id,
        userId: input.userId,
        name: input.name || 'Untitled Repository',
        description: input.description || 'Created via GitBox by VBP',
        author: input.author || 'Anonymous Developer',
        primaryLanguage: input.primaryLanguage || 'typescript',
        files: Array.isArray(input.files) ? input.files : [],
        stars: 1,
        forks: 0,
      })
      .returning();

    return inserted[0];
  } catch (error) {
    console.error('Failed to create GitBox repository:', error);
    throw new Error('Failed to publish repository.', { cause: error });
  }
}

export async function forkGitboxRepo(id: string) {
  try {
    const updated = await db
      .update(gitboxRepos)
      .set({
        forks: sql`${gitboxRepos.forks} + 1`,
      })
      .where(eq(gitboxRepos.id, id))
      .returning();

    return updated[0] ?? null;
  } catch (error) {
    console.error('Failed to fork GitBox repository:', error);
    throw new Error('Failed to fork repository.', { cause: error });
  }
}
