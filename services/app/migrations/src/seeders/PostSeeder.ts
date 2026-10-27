import type { SQL } from 'bun';

export const SEED_POSTS = [
  { title: 'Hello from flisk-stack', body: 'This post came from src/seeders/PostSeeder.ts.' },
  { title: 'Convention over configuration', body: 'Drop a file in Actions, Jobs or views and it is wired up.' },
];

// Seeds only an empty table, so restarting the migrator never duplicates rows.
export async function seedPosts(sql: SQL): Promise<void> {
  const [{ count }] = await sql<Array<{ count: number }>>`select count(*)::int as count from posts`;
  if (count > 0) return;
  for (const post of SEED_POSTS) {
    await sql`insert into posts ${sql(post)}`;
  }
}
